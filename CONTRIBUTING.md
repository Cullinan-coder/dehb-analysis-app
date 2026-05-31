# Katkı Rehberi

DEHB Platform'a katkıda bulunduğun için teşekkürler. Bu doküman; geliştirme ortamının nasıl kurulacağını, kod stilini ve PR akışını açıklar.

## Geliştirme Ortamı

### Gereksinimler

- Node.js **20+** (bkz. `.nvmrc`)
- npm 10+
- Expo CLI (`npm install -g expo-cli`)
- Supabase hesabı (lokal geliştirme için ücretsiz tier yeterli)
- iOS Simulator (macOS) veya Android Emulator (Android Studio) — opsiyonel, web'de de çalışır

### Kurulum

```bash
git clone https://github.com/Cullinan-coder/dehb-analysis-app.git
cd dehb-analysis-app
npm ci
cp .env.example .env
# .env'de EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY doldur
npm run start
```

### Veritabanı Kurulumu

İlk kurulumda `supabase/migrations/0001_initial_schema.sql` dosyasını Supabase SQL editöründe çalıştır. Webhook ayarı için `README.md` → "Veritabanı Şeması" bölümüne bak.

## Klasör Yapısı

Her bilişsel oyun **3 katman** olarak ayrılmıştır:

```
src/games/<oyun>/
├── types.ts             # Tip tanımları
├── logic.ts             # Saf TypeScript — React bağımlılığı YOK
└── <Oyun>Scene.tsx      # Görsel katman
```

`logic.ts` saf fonksiyonlardan oluşur (`generateRound`, `calculatePerformance`, vs.). Bu sayede unit test yazımı kolay olur ve UI değişiklikleri lojiği etkilemez. **Yeni oyun eklerken bu yapıya uy.**

## Kod Stili

- **TypeScript strict mode açık** — `any` kullanmaktan kaçın
- **Türkçe yorumlar tercih edilir** (klinik domain bilgisi Türkçe yazılmış)
- **Yorumlar `WHY` anlatır, `WHAT` değil** — kod ne yaptığını zaten söylüyor
- **`expo lint`** ve **`tsc --noEmit`** PR öncesi temiz olmalı

```bash
npm run lint
npm run typecheck
```

## Commit Mesajları

Conventional Commits formatını tercih ediyoruz (zorunlu değil, ama PR review'unu hızlandırır):

```
feat: add cognitive flexibility task
fix: correct perseveration scoring edge case
docs: update README scoring formula
refactor: extract bubble spawn logic
chore: bump expo to 55.0.25
```

İlgili tipler: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`.

## Pull Request Akışı

1. Issue açıp tartış (büyük değişiklikler için).
2. `main`'den dallan: `git checkout -b feat/<kısa-açıklama>`
3. Küçük, atomik commit'ler at.
4. `npm run lint && npm run typecheck` — yeşil olmalı.
5. PR aç, template'i doldur.
6. CI yeşil olmadan merge yok.

## Klinik Doğrulama Gereksinimleri

Bu proje bir **klinik araç**tır. Yeni oyun veya skor değişikliği önerirken:

- Hangi nöropsikolojik paradigmayı temel aldığını belirt (referansla)
- Adaptasyon kararlarını gerekçelendir (örn. round sayısı neden 10)
- DEHB'ye özgü davranışsal marker'lara nasıl katkı sunduğunu açıkla

Gerekçelendirmesiz "şu skor artsın" tarzı PR'lar reddedilir — ölçüm geçerliliğini bozar.

## Davranış Kuralları

Saygılı, yapıcı, çocuk-merkezli iletişim. Tartışma teknik konular üzerinden yürür, kişiselleştirilmez.

## Sorular

GitHub Issues üzerinden ulaşabilirsin.
