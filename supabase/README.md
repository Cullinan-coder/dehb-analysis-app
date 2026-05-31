# Supabase

Bu klasör veritabanı şemasını ve kurulum notlarını içerir.

## İlk Kurulum

1. [Supabase](https://supabase.com) üzerinde yeni proje oluştur.
2. **SQL Editor** → `migrations/0001_initial_schema.sql` içeriğini yapıştır → çalıştır.
3. **Settings → API**'dan `Project URL` ve `anon public` key'i al, kök dizindeki `.env`'e yaz:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<proje-id>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

## Database Webhook (Puq.ai için)

Son oyun (game5) tamamlandığında pipeline'ı tetikleyen webhook:

- **Database → Webhooks → Create a new hook**
- Name: `dehb-analysis-trigger`
- Table: `child_scores`
- Events: ☑ **UPDATE**
- HTTP Method: `POST`
- URL: `<puqai-workflow-webhook-url>`
- HTTP Headers: Puq.ai'dan alınan auth header'ı

## Production Öncesi RLS Sıkılaştırma

Mevcut `dev_all_*` policy'leri tüm anon trafiğine açık. **Gerçek çocuk verisi toplamadan önce** bunları silip auth.uid() tabanlı policy'lerle değiştir. Detay için kök dizindeki [`SECURITY.md`](../SECURITY.md).
