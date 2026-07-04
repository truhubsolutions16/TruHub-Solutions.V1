
-- =========================
-- ROLES + has_role()
-- =========================
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

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "users can read own roles" ON public.user_roles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- shared updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Helper: standard policies for public-read / admin-write tables
-- (applied per-table below)

-- =========================
-- HERO
-- =========================
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
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_hero_upd BEFORE UPDATE ON public.hero_content
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- ABOUT
-- =========================
CREATE TABLE public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
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
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_about_upd BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- FOUNDER
-- =========================
CREATE TABLE public.founder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  photo_url TEXT,
  vision TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.founder TO anon, authenticated;
GRANT ALL ON public.founder TO authenticated, service_role;
ALTER TABLE public.founder ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder read" ON public.founder FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "founder admin write" ON public.founder FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_founder_upd BEFORE UPDATE ON public.founder
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- SERVICES
-- =========================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
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
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_services_upd BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- PRICING
-- =========================
CREATE TABLE public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  tagline TEXT,
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
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pricing_upd BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- ADDITIONAL SERVICES
-- =========================
CREATE TABLE public.additional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.additional_services TO anon, authenticated;
GRANT ALL ON public.additional_services TO authenticated, service_role;
ALTER TABLE public.additional_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addons read" ON public.additional_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "addons admin write" ON public.additional_services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_addons_upd BEFORE UPDATE ON public.additional_services
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- PORTFOLIO
-- =========================
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  technology TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  live_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_items TO anon, authenticated;
GRANT ALL ON public.portfolio_items TO authenticated, service_role;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio read" ON public.portfolio_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "portfolio admin write" ON public.portfolio_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_portfolio_upd BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- TESTIMONIALS
-- =========================
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  quote TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO authenticated, service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials read" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "testimonials admin write" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_testimonials_upd BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- FAQS
-- =========================
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO authenticated, service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs read" ON public.faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_faqs_upd BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- CONTACT INFO
-- =========================
CREATE TABLE public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contact_info TO anon, authenticated;
GRANT ALL ON public.contact_info TO authenticated, service_role;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_info read" ON public.contact_info FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "contact_info admin write" ON public.contact_info FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_contact_info_upd BEFORE UPDATE ON public.contact_info
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- CONTACT SUBMISSIONS
-- =========================
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  project_details TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit" ON public.contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read submissions" ON public.contact_submissions FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update submissions" ON public.contact_submissions FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete submissions" ON public.contact_submissions FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- =========================
-- SEED CONTENT
-- =========================
INSERT INTO public.hero_content (headline, subtitle) VALUES
('We Build Digital Experiences That Grow Businesses.',
 'Premium websites, branding, AI automation and digital solutions crafted to help businesses grow online.');

INSERT INTO public.about_content (heading, body) VALUES
('A luxury technology studio for ambitious brands.',
 'TruHub Solutions is a full-service digital agency crafting premium websites, brands and AI-powered experiences. We combine design excellence with engineering rigor to help founders and businesses grow online — fast.');

INSERT INTO public.founder (name, title, vision, skills, photo_url) VALUES
('Jayanth Gone', 'Founder & Chairman',
 'To turn every business we touch into a category-defining digital brand — with design that inspires, technology that scales, and craft that lasts.',
 ARRAY['Web Development','UI/UX Design','Branding','Digital Solutions'],
 NULL);

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
('Extra Page','₹500',1),
('Logo Design','₹1500',2),
('Business Email Setup','₹1000',3),
('Google Business Profile','₹2000',4),
('Hosting','₹2000/year',5),
('Domain','Actual Cost',6),
('Social Media Setup','₹2500',7);

INSERT INTO public.faqs (question, answer, sort_order) VALUES
('How long does a project take?','Most websites launch in 7–21 days depending on scope and revisions.',1),
('Do you offer maintenance?','Yes. Every plan includes free maintenance, and Pro includes lifetime maintenance.',2),
('Can you redesign my existing website?','Absolutely — we handle full redesigns, migrations and performance overhauls.',3),
('Do you build custom AI features?','Yes. We build AI chatbots, WhatsApp automations, and custom AI workflows.',4),
('What is included in SEO?','On-page SEO, technical SEO, schema, site speed and Google indexing setup.',5),
('Do you provide invoices?','Yes, GST-compliant invoices are provided for every project.',6);

INSERT INTO public.testimonials (name, role, quote, rating, sort_order) VALUES
('Ananya R.','Founder, Bloom Studio','TruHub delivered a website that genuinely feels premium. Bookings doubled in the first month.',5,1),
('Rohit M.','CEO, NorthOak Realty','The team is fast, thoughtful and highly design-driven. Best investment we made this year.',5,2),
('Priya S.','Marketing Lead, Kavya Foods','Our new site loads instantly and ranks on page one. Truly world-class work.',5,3);
