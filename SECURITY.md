# Security Notes

## ⚠️ Geliştirme Aşaması — RLS Durumu

Şu anda Supabase'deki **tüm tablolarda** RLS açık ama policy'ler **anon role'üne tüm erişimi açıyor** (`dev_all_<tablo>` adlı policy'ler). Bu yalnızca geliştirme aşaması için kabul edilebilirdir.

### Pilot Test Öncesi ZORUNLU Yapılacaklar

Pilot testten (gerçek çocuk/ebeveynle kullanım) **önce** şu işlemler tamamlanmalıdır:

1. **Supabase Auth entegrasyonu**
   - Ebeveyn email/şifre veya magic link ile giriş
   - Çocuk profili ebeveynin `auth.uid()` ile ilişkilendirilir
2. **`dev_all_*` policy'lerinin silinmesi**
3. **Yeni RLS policy'leri**:
   - `children`: sadece `auth.uid()` `parents.user_id`'ye eşit olan ebeveyn kendi çocuğunu görebilir
   - `sessions`, `behavioral_events`, `tasks`, `skill_gaps`, `curriculum_state`, `reports`: aynı `child_id` zinciri üzerinden filtrelenir
   - `parents`: kullanıcı sadece kendi ebeveyn satırını görebilir
   - `teachers`: ayrı bir teacher rolü, sadece atandığı `class_child_ids` listesindeki çocukları okuyabilir
   - `automation_logs`: sadece `service_role` erişebilir (anon ve authenticated rolleri yok)
4. **API key rotasyonu**: Geliştirme sırasında sızmış olabilecek tüm key'ler döndürülmeli (Supabase anon key, Gemini key)
5. **COPPA/KVKK kontrol listesi**: Ebeveyn onay akışı, veri saklama süreleri, dışa aktarma/silme talepleri

### Hassas Veri Kuralları

- API key'leri **asla** `.env` dışında bir yere yazma
- Chat'lere, screenshot'lara, GitHub commit'lerine, log dosyalarına key yapıştırma
- `.env` dosyası `.gitignore`'da olmalı (kontrol edildi ✅)

### Mevcut Tehdit Modeli (Faz 1)

- Anon key uygulamaya gömülecek → tersine mühendislikle çıkarılabilir
- Şu an anon key + Supabase URL'i bilen biri tüm verileri okuyabilir/yazabilir
- Bu yüzden Faz 1'de **gerçek çocuk verisi toplanmamalı**, sadece test verisi kullanılmalı
