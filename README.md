# DEHB Platform

DEHB'li çocuklar için tablet odaklı, okuma-yazma oyunlaştırma platformu.

## Stack

- React Native + Expo SDK 55 (Expo Router)
- TypeScript
- Supabase (database + auth + realtime)
- Zustand (state)
- React Native Skia (oyun motoru) — planlanan
- Gemini Flash (AI karar motoru) — planlanan

## Geliştirme

```bash
npm install
npx expo start
```

## Yapı

- `src/app/` — Expo Router ekranları (file-based routing)
- `src/components/` — UI bileşenleri
- `src/stores/` — Zustand store'ları
- `src/services/` — Supabase ve dış servis client'ları
- `src/hooks/` — özel React hook'ları
- `src/constants/` — tema, renkler, sabitler

## Durum

Sprint 0 — temel altyapı kurulumu aşamasında.
