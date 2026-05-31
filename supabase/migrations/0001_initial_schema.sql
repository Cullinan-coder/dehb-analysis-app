-- DEHB Platform — initial schema
--
-- İki tablo: çocuk/veli kimliği (children) ve oyun skorları (child_scores).
-- child_scores satırı sırayla doldurulur (game1..game5); son UPDATE
-- Supabase Database Webhook'unu tetikler ve Puq.ai pipeline'ına gider.

-- ---------------------------------------------------------------------------
-- children
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.children (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  child_name   TEXT        NOT NULL,
  age          INTEGER     NOT NULL CHECK (age BETWEEN 4 AND 18),
  parent_name  TEXT        NOT NULL,
  parent_email TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.children IS 'Onboarding sırasında oluşturulan çocuk + veli kayıtları.';
COMMENT ON COLUMN public.children.parent_email IS 'Klinik raporun gönderileceği e-posta. Şifre/hesap yoktur.';

-- ---------------------------------------------------------------------------
-- child_scores
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.child_scores (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id   BIGINT      NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  age        INTEGER     NOT NULL,
  game1      INTEGER,    -- Letter Hunt   (max 200, ağırlık × 2)
  game2      INTEGER,    -- Bubbles       (max 400, ağırlık × 4)
  game3      INTEGER,    -- Robot Factory (max 600, ağırlık × 6)
  game4      INTEGER,    -- Rhythm        (max 800, ağırlık × 8)
  game5      INTEGER,    -- Flexibility   (max 1000, ağırlık × 10)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id)
);

COMMENT ON TABLE  public.child_scores IS 'Bir çocuğa ait 5 oyunun ağırlıklı final skorları. Sırayla UPDATE edilir.';
COMMENT ON COLUMN public.child_scores.game5 IS 'Son slot — UPDATE webhook''u tetikler.';

CREATE INDEX IF NOT EXISTS child_scores_child_id_idx
  ON public.child_scores(child_id);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS child_scores_set_updated_at ON public.child_scores;
CREATE TRIGGER child_scores_set_updated_at
  BEFORE UPDATE ON public.child_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- DİKKAT: Aşağıdaki policy'ler GELİŞTİRME içindir. Production öncesi:
-- 1) Supabase Auth entegre et (parent magic link veya email/password)
-- 2) `dev_all_*` policy'lerini DROP et
-- 3) auth.uid() tabanlı yeni policy'ler ekle (bkz. SECURITY.md)
ALTER TABLE public.children     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY dev_all_children
  ON public.children
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY dev_all_child_scores
  ON public.child_scores
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
