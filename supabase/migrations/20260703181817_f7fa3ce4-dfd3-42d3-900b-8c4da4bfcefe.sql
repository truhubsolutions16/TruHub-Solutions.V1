ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS footer_html text,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ga4_id text,
  ADD COLUMN IF NOT EXISTS gtm_id text,
  ADD COLUMN IF NOT EXISTS meta_pixel_id text,
  ADD COLUMN IF NOT EXISTS theme_colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_css text,
  ADD COLUMN IF NOT EXISTS custom_js text,
  ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS announcement text;

CREATE TABLE IF NOT EXISTS public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  title text, description text, og_image text, canonical text,
  noindex boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_seo TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_seo TO authenticated;
GRANT ALL ON public.page_seo TO service_role;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_seo public read" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "page_seo admin write" ON public.page_seo FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text NOT NULL UNIQUE,
  to_path text NOT NULL,
  status_code smallint NOT NULL DEFAULT 301,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.redirects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redirects TO authenticated;
GRANT ALL ON public.redirects TO service_role;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "redirects public read" ON public.redirects FOR SELECT USING (enabled);
CREATE POLICY "redirects admin write" ON public.redirects FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text,
  folder text NOT NULL DEFAULT 'general',
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  mime_type text, size_bytes bigint, width int, height int,
  alt_text text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_files TO authenticated;
GRANT ALL ON public.media_files TO service_role;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_files admin read" ON public.media_files FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "media_files admin write" ON public.media_files FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.not_found_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text, user_agent text,
  hit_count int NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS not_found_log_path_idx ON public.not_found_log(path);
GRANT INSERT ON public.not_found_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.not_found_log TO authenticated;
GRANT ALL ON public.not_found_log TO service_role;
ALTER TABLE public.not_found_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "not_found_log public insert" ON public.not_found_log FOR INSERT WITH CHECK (true);
CREATE POLICY "not_found_log admin read" ON public.not_found_log FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "not_found_log admin manage" ON public.not_found_log FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS page_seo_updated ON public.page_seo;
CREATE TRIGGER page_seo_updated BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
DROP TRIGGER IF EXISTS redirects_updated ON public.redirects;
CREATE TRIGGER redirects_updated BEFORE UPDATE ON public.redirects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
DROP TRIGGER IF EXISTS media_files_updated ON public.media_files;
CREATE TRIGGER media_files_updated BEFORE UPDATE ON public.media_files
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
