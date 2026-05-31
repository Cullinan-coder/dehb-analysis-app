# DEHB Platform

**7-12 yaş çocuklar için yapay zeka destekli bilişsel değerlendirme platformu.**

5 nöropsikolojik oyun, Supabase veri katmanı ve Puq.ai klinik yorumlama motoru ile veli e-postasına otomatik rapor gönderen mobil-first bir ön-tarama aracı.

> Bu bir klinik tanı aracı değildir. DEHB değerlendirmesi için lisanslı sağlık profesyoneline başvurunuz.

---

## İçindekiler

- [Genel Bakış](#genel-bakış)
- [5 Oyun ve Bilimsel Temeli](#5-oyun-ve-bilimsel-temeli)
- [Mimari](#mimari)
- [Tech Stack](#tech-stack)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Veritabanı Şeması](#veritabanı-şeması)
- [Skor Hesaplama](#skor-hesaplama)
- [Demo Modu](#demo-modu)
- [Puq.ai Workflow](#puqai-workflow)
- [Güvenlik](#güvenlik)
- [Yol Haritası](#yol-haritası)

---

## Genel Bakış

DEHB (Dikkat Eksikliği ve Hiperaktivite Bozukluğu) Türkiye'de okul çağındaki çocuklarda %5–8 prevalansla görülür. Uzmana ulaşım süresi büyük şehirlerde dahi 3–6 ay olabilmektedir.

**DEHB Platform**, aileye klinik öncesinde objektif veri sunar:

1. Veli onboarding formunu doldurur (çocuk adı, yaş, e-posta).
2. Çocuk sırayla 5 bilişsel oyunu oynar (~10–12 dakika).
3. Supabase webhook, son oyun tamamlanınca Puq.ai pipeline'ını tetikler.
4. GPT-4o tabanlı klinik yorum HTML formatında velinin e-postasına gönderilir.

### Neden Anti-Gamification?

Tipik çocuk uygulamalarındaki streak, XP, rozet, liderlik tablosu gibi mekanizmalar *engagement* için tasarlanmıştır. Bu platform **değerlendirici**, terapötik değil; bu nedenle hiçbir gamification döngüsü içermez. Amaç çocuğun bilişsel profilini ölçmek, uygulamaya bağlamak değildir.

---

## 5 Oyun ve Bilimsel Temeli

| # | Oyun | Bilişsel Domain | Klinik Paradigma | Ağırlık | Max Skor |
|---|------|----------------|-----------------|---------|----------|
| 1 | **Harf Avı** | Seçici Dikkat | Visual Search Task | ×2 | 200 |
| 2 | **Harf Baloncukları** | Tepki İnhibisyonu | CPT + Go/No-Go (Conners, 1985) | ×4 | 400 |
| 3 | **Hece Birleştirme** | Sözel Çalışma Belleği | Baddeley Fonolojik Döngü (1974) | ×6 | 600 |
| 4 | **Ritim Ustası** | Zaman Algısı | Sensorimotor Synchronization (Repp, 2005) | ×8 | 800 |
| 5 | **Kural Değiştirici** | Bilişsel Esneklik | WCST Çocuk Versiyonu (Grant & Berg, 1948) | ×10 | 1000 |

**Toplam: 3000 puan**

### Oyun Detayları

**Harf Avı** — 10 round, 6'lı harf grid. Türkçe alfabede karıştırılan harfler (b/d/p) distraktör olarak kasıtlı kullanılır. Round başına 10 sn timeout (omisyon hatası markeri).

**Harf Baloncukları** — 45 sn boyunca ekranda süzülen baloncuklarda sesli/sessiz harf ayrımı. %40 sesli / %60 sessiz dağılım. 4 CPT sonuç kategorisi: `correct_hit`, `correct_reject`, `commission` (dürtüsellik), `omission` (dikkat kopukluğu).

**Hece Birleştirme** — 12 kelimelik Türkçe havuzdan rastgele 10 seçilir. Çocuk heceleri doğru sırayla birleştirerek kelimeyi tamamlar. 3 distraktör hece eklenir.

**Ritim Ustası** — 20 beat, 1.2 sn aralık. Dokunuş zamanı ile beat zamanı arasındaki fark ms cinsinden ölçülür. Tolerans bantları: ≤150ms mükemmel, ≤300ms iyi, ≤500ms olur. Varyans DEHB imzasıdır.

**Kural Değiştirici** — 3 faz × 5 round = 15 round. Faz geçişlerinde kural değişir (kırmızı → kare → mavi). Kural değişimi sonrası ilk 2 round'daki hatalar **perseverasyon hatası** olarak ayrıca penalize edilir (DEHB'nin en belirleyici davranışsal markeri).

---

## Mimari

```
[İSTEMCİ]              [VERİ]                [ZEKA]
React Native     →    Supabase          →    Puq.ai
+ Expo + TS           PostgreSQL              Workflow
                       + RLS                  + GPT-4o
      ↓                    ↓                      ↓
 Oyun Motoru          Veri Saklama          Klinik Yorum
 Skor Üretimi         Webhook Tetik         E-posta Dispatch
```

**Prensipler:** Separation of Concerns · Event-Driven · Stateless iletişim · Idempotent işlemler

### Klasör Yapısı

```
src/
├── app/                    # Expo Router ekranları
│   ├── _layout.tsx         # Root Stack navigator
│   ├── index.tsx           # Ana ekran (5 oyun kartı)
│   ├── onboarding.tsx      # Veli/çocuk kayıt formu
│   └── play/               # Oyun ekranları (letter-hunt, bubbles, ...)
├── games/                  # Oyun mantığı (UI-bağımsız)
│   ├── [game]/
│   │   ├── types.ts        # Tip tanımları
│   │   ├── logic.ts        # Saf TypeScript — React yok
│   │   └── [Game]Scene.tsx # Görsel katman
├── services/               # Dış sistemlerle iletişim
│   ├── supabase.ts         # Supabase client
│   ├── child.ts            # children CRUD
│   └── childScores.ts      # child_scores CRUD + skor formülü
├── stores/                 # Zustand state
│   └── gameStore.ts
├── config/
│   └── demoMode.ts         # Demo / production geçiş sabitler
├── constants/              # Renk paleti, tema
├── hooks/                  # Custom React hooks
└── utils/                  # Yardımcı fonksiyonlar
```

---

## Tech Stack

| Katman | Teknoloji | Sürüm |
|--------|-----------|-------|
| Runtime | React Native | 0.83.6 |
| Framework | Expo SDK | 55 |
| Routing | Expo Router | 55 |
| Language | TypeScript | 5.9 strict |
| Animation | React Native Reanimated | 4.2 |
| State | Zustand | 5.0 |
| Database | Supabase (PostgreSQL + RLS) | — |
| AI Workflow | Puq.ai (GPT-4o + GPT-4o-mini) | — |

---

## Kurulum

### Gereksinimler

- Node.js 20+
- npm veya yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase hesabı
- Puq.ai hesabı (workflow için)

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/Cullinan-coder/dehb-analysis-app.git
cd dehb-analysis-app

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle (aşağıya bak)

# 4. Uygulamayı başlat
npx expo start

# Belirli platform:
npx expo start --android
npx expo start --ios
npx expo start --web
```

---

## Ortam Değişkenleri

Proje kök dizininde `.env` dosyası oluştur:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> `EXPO_PUBLIC_` prefix'i olmayan değişkenler istemci kodunda görünmez. Hassas key'ler (service_role) asla istemciye eklenmemeli.

---

## Veritabanı Şeması

Supabase'de iki tablo gereklidir:

```sql
-- Çocuk ve veli bilgileri
CREATE TABLE children (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  child_name  TEXT NOT NULL,
  age         INT  NOT NULL CHECK (age BETWEEN 4 AND 18),
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Oyun skorları (sırayla doldurulur)
CREATE TABLE child_scores (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id   BIGINT REFERENCES children(id) ON DELETE CASCADE,
  age        INT  NOT NULL,
  game1      INT,   -- Letter Hunt
  game2      INT,   -- Bubbles
  game3      INT,   -- Robot Factory
  game4      INT,   -- Rhythm
  game5      INT,   -- Flexibility
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Supabase Webhook Ayarı

`child_scores` tablosunda `game5` kolonuna `UPDATE` geldiğinde Puq.ai endpoint'ini çağıracak bir Database Webhook tanımla:

- **Event:** `UPDATE`
- **Table:** `child_scores`
- **URL:** `<puqai-webhook-url>`
- **HTTP Method:** `POST`

---

## Skor Hesaplama

```
final_score = round(performance × game_weight)

performance  ∈ [0, 100]    (oyun-içi hesaplama)
game_weight  ∈ {2, 4, 6, 8, 10}
```

**Oyun başına performans formülleri:**

```ts
// Letter Hunt
performance = (correctCount / totalRounds) * 100

// Bubbles
performance = ((correctHits + correctRejects) / totalBubbles) * 100

// Robot Factory
performance = (completedWords / totalWords) * 100

// Rhythm
beatScore = delta ≤ 150ms ? 100 : delta ≤ 300ms ? 75 : delta ≤ 500ms ? 50 : 0
performance = avg(beatScores)

// Flexibility (perseverasyon penaltılı)
base    = (correct / totalRounds) * 100
penalty = perseverationErrors * 5
performance = max(0, base - penalty)
```

---

## Demo Modu

`src/config/demoMode.ts` dosyasında `DEMO_MODE` sabitini değiştir:

```ts
export const DEMO_MODE = true;   // sunum için kısaltılmış süreler
export const DEMO_MODE = false;  // production süreleri
```

| Oyun | Production | Demo |
|------|-----------|------|
| Letter Hunt | 10 round / 10 sn timeout | 3 round / 5 sn timeout |
| Bubbles | 45 sn | 10 sn |
| Robot Factory | 10 kelime / 20 sn | 3 kelime / 12 sn |
| Rhythm | 20 beat (~24 sn) | 6 beat (~7 sn) |
| Flexibility | 15 round (5/5/5) | 6 round (2/2/2) |
| **Toplam** | **~10–12 dk** | **~2–3 dk** |

Skor formülü ve ağırlıklar demo modda değişmez.

---

## Puq.ai Workflow

7 adımlı event-driven pipeline:

```
1. Webhook Trigger       → Supabase'den gelen HTTP POST
2. PrepareData           → child_scores tablosundan skor çek
3. AnalyzeAndReport      → children tablosundan veli bilgisi çek
4. DispatchAll           → GPT-4o-mini: veriyi eşleştir, JSON üret
5. Parse JSON            → String → Object dönüşümü
6. ClinicalInterpretation→ GPT-4o: nöropsikoloj rolü, HTML klinik yorum
7. Send Email            → Gmail SMTP → parent_email
```

**Çift LLM stratejisi:** Mekanik veri işleme için `gpt-4o-mini` (hız + maliyet), klinik yorumlama için `gpt-4o` (nüans + kalite).

**Yorumlama eşikleri:**

| Yüzde | Kategori |
|-------|---------|
| ≥ 85% | Güçlü |
| 70–84% | Yeterli |
| 50–69% | Sınırda |
| < 50% | Zayıf |

---

## Güvenlik

Projenin mevcut güvenlik durumu ve üretim öncesi yapılması gerekenler [SECURITY.md](./SECURITY.md) dosyasında detaylı olarak belgelenmiştir.

**Kısa özet:**

- Şu an RLS açık ancak `dev_all_*` policy'leri anon erişimine açık → **gerçek çocuk verisi toplanmamalı**
- Pilot test öncesi: Supabase Auth entegrasyonu, `dev_all_*` policy'lerinin silinmesi, RLS sıkılaştırma
- `.env` dosyası `.gitignore`'da — key'leri asla commit etme

---

## Yol Haritası

**Kısa vade**
- [ ] RLS policy sıkılaştırma (parent_email tabanlı)
- [ ] Tablet-spesifik 2-column layout
- [ ] Round-by-round telemetri (JSONB kolonu)

**Orta vade (6–12 ay)**
- [ ] Klinik validasyon çalışması (30–50 çocuk pilot)
- [ ] Çocuk doktoru paneli
- [ ] Çoklu seans karşılaştırma (longitudinal tracking)
- [ ] App Store yayını (iOS + Android)

**Uzun vade**
- [ ] KVKK tam uyum
- [ ] Çoklu dil desteği (EN, AR)
- [ ] Anlaşmalı klinikler ile B2B entegrasyon

---

## Bilimsel Referanslar

- Conners, C.K. (1985). *The Continuous Performance Test.*
- Baddeley, A., & Hitch, G. (1974). *Working memory.* Psychology of Learning and Motivation, 8, 47–89.
- Repp, B.H. (2005). *Sensorimotor synchronization: A review of the tapping literature.* Psychonomic Bulletin & Review, 12(6), 969–992.
- Grant, D.A., & Berg, E.A. (1948). *A behavioral analysis of degree of reinforcement and ease of shifting to new responses in a Weigl-type card-sorting problem.* Journal of Experimental Psychology, 38(4), 404–411.

---

## Lisans

Bu proje Base 41 Hackathon kapsamında geliştirilmiştir. Klinik kullanım için lisanslı sağlık profesyoneli denetimi zorunludur.

---

*All Craft Vision — Base 41 Hackathon | Sağlık (HealthTech) Kategorisi | Mayıs 2026*
