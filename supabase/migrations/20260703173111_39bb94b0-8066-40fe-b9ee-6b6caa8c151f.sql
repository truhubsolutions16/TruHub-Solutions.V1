
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
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));

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
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));

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
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));

INSERT INTO public.section_meta (section, eyebrow, heading, subheading) VALUES
  ('services', 'Services', 'Everything you need to grow online', 'Twelve services. One partner. Built for founders who want it done right.'),
  ('why', 'Why Choose Us', 'Crafted for teams that ship', NULL),
  ('pricing', 'Pricing', 'Transparent pricing. Premium value.', 'Choose a plan, or ask us for a custom quote.'),
  ('portfolio', 'Portfolio', 'Selected work', NULL),
  ('founder', 'Meet the Founder', 'The mind behind the mission', NULL),
  ('process', 'How we work', 'A simple, transparent journey', 'Six friendly steps from your first idea to a launched, growing product — no jargon, no surprises.'),
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
