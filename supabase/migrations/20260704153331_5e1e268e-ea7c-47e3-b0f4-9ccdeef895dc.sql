
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can read own roles" ON public.user_roles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'employee';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'member';

CREATE TABLE public.hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow TEXT NOT NULL DEFAULT 'TruHub Solutions',
  headline TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta_primary_label TEXT NOT NULL DEFAULT 'Start Your Project',
  cta_secondary_label TEXT NOT NULL DEFAULT 'Explore Portfolio',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_content TO anon, authenticated;
GRANT ALL ON public.hero_content TO authenticated, service_role;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hero read" ON public.hero_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "hero admin write" ON public.hero_content FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_hero_upd BEFORE UPDATE ON public.hero_content
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT NOT NULL, body TEXT NOT NULL,
  stat_projects INT NOT NULL DEFAULT 120,
  stat_clients INT NOT NULL DEFAULT 80,
  stat_satisfaction INT NOT NULL DEFAULT 99,
  stat_support TEXT NOT NULL DEFAULT '24/7',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_content TO anon, authenticated;
GRANT ALL ON public.about_content TO authenticated, service_role;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about read" ON public.about_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "about admin write" ON public.about_content FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_about_upd BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.founder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, title TEXT NOT NULL,
  photo_url TEXT, vision TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.founder TO anon, authenticated;
GRANT ALL ON public.founder TO authenticated, service_role;
ALTER TABLE public.founder ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder read" ON public.founder FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "founder admin write" ON public.founder FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_founder_upd BEFORE UPDATE ON public.founder
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'sparkles',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO authenticated, service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services read" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_services_upd BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, price TEXT NOT NULL, tagline TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  cta_label TEXT NOT NULL DEFAULT 'Get Started',
  highlighted BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_plans TO anon, authenticated;
GRANT ALL ON public.pricing_plans TO authenticated, service_role;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing read" ON public.pricing_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pricing admin write" ON public.pricing_plans FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pricing_upd BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.additional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, price TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.additional_services TO anon, authenticated;
GRANT ALL ON public.additional_services TO authenticated, service_role;
ALTER TABLE public.additional_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addons read" ON public.additional_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "addons admin write" ON public.additional_services FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_addons_upd BEFORE UPDATE ON public.additional_services
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, category TEXT NOT NULL, technology TEXT NOT NULL,
  description TEXT NOT NULL, image_url TEXT, live_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_items TO anon, authenticated;
GRANT ALL ON public.portfolio_items TO authenticated, service_role;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio read" ON public.portfolio_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "portfolio admin write" ON public.portfolio_items FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_portfolio_upd BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, role TEXT, avatar_url TEXT,
  quote TEXT NOT NULL, rating INT NOT NULL DEFAULT 5,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO authenticated, service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials read" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "testimonials admin write" ON public.testimonials FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_testimonials_upd BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL, answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO authenticated, service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs read" ON public.faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_faqs_upd BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL, phone TEXT NOT NULL, whatsapp TEXT NOT NULL, address TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contact_info TO anon, authenticated;
GRANT ALL ON public.contact_info TO authenticated, service_role;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_info read" ON public.contact_info FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "contact_info admin write" ON public.contact_info FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_contact_info_upd BEFORE UPDATE ON public.contact_info
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DO $$ BEGIN CREATE TYPE public.lead_status AS ENUM ('new','contacted','qualified','proposal','won','lost','archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.lead_priority AS ENUM ('low','medium','high','urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
  business_name TEXT, project_details TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  status public.lead_status NOT NULL DEFAULT 'new',
  priority public.lead_priority NOT NULL DEFAULT 'medium',
  lead_score integer NOT NULL DEFAULT 0,
  follow_up_at timestamptz,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text, notes text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit" ON public.contact_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (length(btrim(name)) BETWEEN 1 AND 120
    AND length(btrim(email)) BETWEEN 5 AND 254
    AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    AND length(btrim(project_details)) BETWEEN 5 AND 5000
    AND (phone IS NULL OR length(phone) <= 40)
    AND (business_name IS NULL OR length(business_name) <= 200)
    AND is_read = false);
CREATE POLICY "admins read submissions" ON public.contact_submissions FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update submissions" ON public.contact_submissions FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete submissions" ON public.contact_submissions FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.lead_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL, message text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_timeline TO authenticated;
GRANT ALL ON public.lead_timeline TO service_role;
ALTER TABLE public.lead_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage lead_timeline" ON public.lead_timeline FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE INDEX idx_lead_timeline_lead ON public.lead_timeline(lead_id, created_at DESC);

CREATE TABLE public.section_meta (
  section text PRIMARY KEY,
  eyebrow text, heading text, subheading text, extra text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.section_meta TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.section_meta TO authenticated;
GRANT ALL ON public.section_meta TO service_role;
ALTER TABLE public.section_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read section_meta" ON public.section_meta FOR SELECT USING (true);
CREATE POLICY "admin write section_meta" ON public.section_meta FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

CREATE TABLE public.why_choose_us (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.why_choose_us TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.why_choose_us TO authenticated;
GRANT ALL ON public.why_choose_us TO service_role;
ALTER TABLE public.why_choose_us ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read why_choose_us" ON public.why_choose_us FOR SELECT USING (true);
CREATE POLICY "admin write why_choose_us" ON public.why_choose_us FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

CREATE TABLE public.process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text NOT NULL, duration text,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.process_steps TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.process_steps TO authenticated;
GRANT ALL ON public.process_steps TO service_role;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read process_steps" ON public.process_steps FOR SELECT USING (true);
CREATE POLICY "admin write process_steps" ON public.process_steps FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, title text NOT NULL, excerpt text, cover_url text,
  body_md text NOT NULL DEFAULT '', tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false, published_at timestamptz,
  seo_title text, seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins manage all posts" ON public.blog_posts FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX blog_posts_published_idx ON public.blog_posts (published, published_at DESC);

CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  chatbot_enabled boolean NOT NULL DEFAULT true,
  chatbot_kb_extra text NOT NULL DEFAULT '',
  notification_email text,
  whatsapp_enabled boolean NOT NULL DEFAULT true,
  logo_url text, favicon_url text, footer_html text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ga4_id text, gtm_id text, meta_pixel_id text,
  theme_colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_css text, custom_js text,
  maintenance_mode boolean NOT NULL DEFAULT false,
  announcement text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins update site settings" ON public.site_settings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.analytics_events (
  id bigserial PRIMARY KEY, event_type text NOT NULL, path text,
  session_id text, visitor_id text, referrer text, source text,
  device text, browser text, os text, country text, city text,
  screen_w int, screen_h int, duration_ms int, scroll_depth int,
  meta jsonb DEFAULT '{}'::jsonb, ip_hash text, user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ae_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_ae_type_created ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX idx_ae_session ON public.analytics_events(session_id);
CREATE INDEX idx_ae_visitor ON public.analytics_events(visitor_id);
CREATE INDEX idx_ae_path ON public.analytics_events(path);
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read analytics_events" ON public.analytics_events FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

CREATE TABLE public.analytics_sessions (
  session_id text PRIMARY KEY, visitor_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  page_count int NOT NULL DEFAULT 0, is_bounce boolean NOT NULL DEFAULT true,
  entry_path text, exit_path text, source text, referrer text,
  device text, browser text, os text, country text, city text,
  is_returning boolean NOT NULL DEFAULT false
);
CREATE INDEX idx_as_started ON public.analytics_sessions(started_at DESC);
CREATE INDEX idx_as_last_seen ON public.analytics_sessions(last_seen_at DESC);
CREATE INDEX idx_as_visitor ON public.analytics_sessions(visitor_id);
GRANT SELECT ON public.analytics_sessions TO authenticated;
GRANT ALL ON public.analytics_sessions TO service_role;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read analytics_sessions" ON public.analytics_sessions FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text, action text NOT NULL,
  entity_type text, entity_id text,
  old_data jsonb, new_data jsonb,
  ip_address text, user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view activity_logs" ON public.activity_logs FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert activity_logs" ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_actor ON public.activity_logs(actor_id, created_at DESC);

CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text, success boolean NOT NULL, failure_reason text,
  ip_address text, user_agent text, country text, city text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.login_history TO authenticated;
GRANT ALL ON public.login_history TO service_role;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view login_history" ON public.login_history FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin'));
CREATE POLICY "Auth users insert own login_history" ON public.login_history FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE INDEX idx_login_history_created ON public.login_history(created_at DESC);
CREATE INDEX idx_login_history_email ON public.login_history(email, created_at DESC);

CREATE TABLE public.admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  two_factor_secret text, last_password_change_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.admin_profiles TO authenticated;
GRANT ALL ON public.admin_profiles TO service_role;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own admin_profile" ON public.admin_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "Users update own admin_profile" ON public.admin_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users insert own admin_profile" ON public.admin_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_admin_profiles_updated_at BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.page_seo (
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
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER page_seo_updated BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text NOT NULL UNIQUE, to_path text NOT NULL,
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
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER redirects_updated BEFORE UPDATE ON public.redirects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL, storage_path text,
  folder text NOT NULL DEFAULT 'general',
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  mime_type text, size_bytes bigint, width int, height int, alt_text text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_files TO authenticated;
GRANT ALL ON public.media_files TO service_role;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_files admin read" ON public.media_files FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "media_files admin write" ON public.media_files FOR ALL
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER media_files_updated BEFORE UPDATE ON public.media_files
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.not_found_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL, referrer text, user_agent text,
  hit_count int NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX not_found_log_path_idx ON public.not_found_log(path);
GRANT INSERT ON public.not_found_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.not_found_log TO authenticated;
GRANT ALL ON public.not_found_log TO service_role;
ALTER TABLE public.not_found_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "not_found_log public insert" ON public.not_found_log FOR INSERT WITH CHECK (true);
CREATE POLICY "not_found_log admin read" ON public.not_found_log FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "not_found_log admin manage" ON public.not_found_log FOR ALL
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, stage text NOT NULL DEFAULT 'kickoff',
  progress smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'active',
  summary text, notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX projects_client_idx ON public.projects(client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects client read own" ON public.projects FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "projects staff read all" ON public.projects FOR SELECT
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));
CREATE POLICY "projects admin write" ON public.projects FOR ALL
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "projects employee update" ON public.projects FOR UPDATE
  USING (private.has_role(auth.uid(), 'employee')) WITH CHECK (private.has_role(auth.uid(), 'employee'));
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL, url text NOT NULL, storage_path text,
  size_bytes bigint, mime_type text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_files_project_idx ON public.project_files(project_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_files TO authenticated;
GRANT ALL ON public.project_files TO service_role;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_files client read own" ON public.project_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.client_id = auth.uid()));
CREATE POLICY "project_files staff read all" ON public.project_files FOR SELECT
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));
CREATE POLICY "project_files admin write" ON public.project_files FOR ALL
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number text, amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'unpaid',
  due_date date, paid_at timestamptz,
  invoice_url text, notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX invoices_client_idx ON public.invoices(client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices client read own" ON public.invoices FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "invoices staff read all" ON public.invoices FOR SELECT
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));
CREATE POLICY "invoices admin write" ON public.invoices FOR ALL
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.project_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL DEFAULT 'member', body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_messages_project_idx ON public.project_messages(project_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_messages TO authenticated;
GRANT ALL ON public.project_messages TO service_role;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm client read own" ON public.project_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.client_id = auth.uid()));
CREATE POLICY "pm client insert own" ON public.project_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.client_id = auth.uid()));
CREATE POLICY "pm staff read all" ON public.project_messages FOR SELECT
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee'));
CREATE POLICY "pm staff insert" ON public.project_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid()
    AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'employee')));
CREATE POLICY "pm admin manage" ON public.project_messages FOR ALL
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TABLE public.backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'manual',
  storage_path text, size_bytes bigint, tables_count int, rows_count int, notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backups TO authenticated;
GRANT ALL ON public.backups TO service_role;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backups admin only" ON public.backups FOR ALL
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

INSERT INTO public.hero_content (headline, subtitle) VALUES
('We Build Digital Experiences That Grow Businesses.',
 'Premium websites, branding, AI automation and digital solutions crafted to help businesses grow online.');

INSERT INTO public.about_content (heading, body) VALUES
('A luxury technology studio for ambitious brands.',
 'TruHub Solutions is a full-service digital agency crafting premium websites, brands and AI-powered experiences. We combine design excellence with engineering rigor to help founders and businesses grow online — fast.');

INSERT INTO public.founder (name, title, vision, skills) VALUES
('Jayanth Gone', 'Founder & Chairman',
 'To turn every business we touch into a category-defining digital brand — with design that inspires, technology that scales, and craft that lasts.',
 ARRAY['Web Development','UI/UX Design','Branding','Digital Solutions']);

INSERT INTO public.contact_info (email, phone, whatsapp) VALUES
('truhub.solutions@gmail.com', '+91 7989367882', '917989367882');

INSERT INTO public.services (title, description, icon, sort_order) VALUES
('Website Development','Custom-built, blazing-fast websites engineered to convert.','code',1),
('Landing Pages','High-converting landing pages designed to sell.','rocket',2),
('Business Websites','Professional websites that establish authority.','briefcase',3),
('Portfolio Websites','Elegant portfolios that showcase your best work.','image',4),
('UI/UX Design','Interfaces that feel effortless and look world-class.','palette',5),
('SEO','Rank higher. Get found. Grow organic traffic.','search',6),
('Branding','Distinctive brand identities with lasting impact.','sparkles',7),
('WhatsApp Automation','Automate customer conversations at scale.','message-circle',8),
('AI Chatbots','Intelligent chatbots trained on your business.','bot',9),
('Website Maintenance','Keep your site secure, fast and up to date.','wrench',10),
('Hosting & Domain','Premium hosting and domain setup, handled for you.','globe',11),
('Performance Optimization','Lightning-fast load times. 95+ Lighthouse scores.','zap',12);

INSERT INTO public.pricing_plans (name, price, tagline, features, cta_label, highlighted, sort_order) VALUES
('Basic','₹4,999',NULL,
 ARRAY['Up to 5 Pages','Responsive Design','Contact Form','WhatsApp Integration','Basic SEO','Google Maps','Social Links','SSL Setup','Free Domain Setup Assistance','5 Months FREE Maintenance'],
 'Get Started', false, 1),
('Starter','₹9,999','Most Popular',
 ARRAY['Everything in Basic','Up to 12 Pages','Premium UI','Advanced SEO','Gallery','Blog','Analytics','Lead Forms','Performance Optimization','1 Year FREE Maintenance'],
 'Get Started', true, 2),
('Pro','₹19,999',NULL,
 ARRAY['Everything in Starter','Unlimited Pages','Fully Custom Design','Booking System','Admin Dashboard','Payment Gateway','CRM Integration','Priority Support','Performance Optimization','Lifetime FREE Maintenance','Future Feature Updates'],
 'Contact Sales', false, 3);

INSERT INTO public.additional_services (name, price, sort_order) VALUES
('Extra Page','₹500',1),('Logo Design','₹1500',2),('Business Email Setup','₹1000',3),
('Google Business Profile','₹2000',4),('Hosting','₹2000/year',5),
('Domain','Actual Cost',6),('Social Media Setup','₹2500',7);

INSERT INTO public.faqs (question, answer, sort_order) VALUES
('How long does it take to build my website?','Most premium websites launch in 7–21 days depending on scope. Landing pages ship in under a week; full multi-page sites with custom design typically take 2–3 weeks.',1),
('Do you offer ongoing maintenance and support?','Yes. Every plan includes post-launch support, and we offer monthly care packages that cover updates, backups, security patches, performance monitoring and small design tweaks.',2),
('Can you redesign or migrate my existing website?','Absolutely. We regularly rebuild WordPress, Wix, Shopify and custom sites into faster, more premium experiences — while preserving your SEO, content and brand equity.',3),
('Do you build AI features and automations?','Yes. We integrate AI chatbots, content generation, smart search, workflow automation and custom AI agents into your website or product.',4),
('What does your SEO service include?','Technical SEO (Core Web Vitals, schema, sitemap, indexing), on-page SEO (keywords, meta, content structure) and off-page basics.',5),
('Do you provide GST invoices?','Yes. TruHub Solutions issues proper GST-compliant invoices for every project and retainer.',6),
('How much does a project cost?', 'Pricing depends on scope. Starter websites begin at a fixed package price, while custom design + development, branding and AI builds are quoted after a short discovery call.', 100),
('What are your payment terms?', 'We work on a simple milestone model — 50% to kick off, 25% at design approval and 25% before launch. UPI, bank transfer, Stripe and international cards are all accepted.', 110),
('Who owns the website and the code?', '100% you. Once the final invoice is settled, all source code, design files, content and brand assets are transferred and yours forever.', 120),
('How many revisions do I get?', 'Every project includes generous revision rounds at design and development stages.', 130),
('How will we communicate during the project?', 'You get a dedicated point of contact, a private WhatsApp/email channel, weekly progress updates and a shared board with milestones.', 140),
('What technology do you build with?', 'Modern, production-grade stack: React, Next.js / TanStack, Tailwind, TypeScript, Supabase, Node.js, Framer Motion.', 150);

INSERT INTO public.testimonials (name, role, quote, rating, sort_order) VALUES
('Ananya R.','Founder, Bloom Studio','TruHub delivered a website that genuinely feels premium. Bookings doubled in the first month.',5,1),
('Rohit M.','CEO, NorthOak Realty','The team is fast, thoughtful and highly design-driven. Best investment we made this year.',5,2),
('Priya S.','Marketing Lead, Kavya Foods','Our new site loads instantly and ranks on page one. Truly world-class work.',5,3);

INSERT INTO public.section_meta (section, eyebrow, heading, subheading) VALUES
('services', 'Services', 'Everything you need to grow online', 'Twelve services. One partner. Built for founders who want it done right.'),
('why', 'Why Choose Us', 'Crafted for teams that ship', NULL),
('pricing', 'Pricing', 'Transparent pricing. Premium value.', 'Choose a plan, or ask us for a custom quote.'),
('portfolio', 'Portfolio', 'Selected work', NULL),
('founder', 'Meet the Founder', 'The mind behind the mission', NULL),
('process', 'How we work', 'A simple, transparent journey', 'Six friendly steps from your first idea to a launched, growing product.'),
('faq', 'FAQ', 'Frequently asked questions', NULL),
('about', 'About TruHub', NULL, NULL),
('contact', 'Contact', 'Let''s build something great', 'Tell us about your project. We reply within a few hours.'),
('addons', NULL, 'Additional Services', NULL);

INSERT INTO public.why_choose_us (title, description, sort_order) VALUES
('Fast Development','Ship polished sites in days, not months.',1),
('SEO Optimized','Rank higher with technical + on-page SEO.',2),
('Fully Responsive','Pixel-perfect on every screen size.',3),
('Modern UI','Design that feels premium and expensive.',4),
('Premium Support','Real humans, fast turnarounds.',5),
('Affordable Pricing','World-class quality at Indian pricing.',6),
('Secure by Default','SSL, best practices, hardened stack.',7),
('Future Ready','AI, automation, integrations — built in.',8);

INSERT INTO public.process_steps (title, description, duration, sort_order) VALUES
('Discovery','Deep dive into your business, users and goals.','1–3 days',1),
('Planning','Sitemap, scope, timeline and success metrics.','2–4 days',2),
('Design','High-fidelity UI/UX with your brand voice.','4–7 days',3),
('Development','Clean, performant code — engineered to scale.','5–10 days',4),
('Testing','QA across devices, browsers and edge cases.','2–3 days',5),
('Launch','Go live with monitoring and post-launch support.','1 day',6);

INSERT INTO public.site_settings (id) VALUES (true) ON CONFLICT DO NOTHING;
