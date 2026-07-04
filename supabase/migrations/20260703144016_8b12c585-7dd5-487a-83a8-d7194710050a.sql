
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate public schema policies
DROP POLICY IF EXISTS "hero admin write" ON public.hero_content;
CREATE POLICY "hero admin write" ON public.hero_content FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "about admin write" ON public.about_content;
CREATE POLICY "about admin write" ON public.about_content FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "founder admin write" ON public.founder;
CREATE POLICY "founder admin write" ON public.founder FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "services admin write" ON public.services;
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "pricing admin write" ON public.pricing_plans;
CREATE POLICY "pricing admin write" ON public.pricing_plans FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "addons admin write" ON public.additional_services;
CREATE POLICY "addons admin write" ON public.additional_services FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "portfolio admin write" ON public.portfolio_items;
CREATE POLICY "portfolio admin write" ON public.portfolio_items FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "testimonials admin write" ON public.testimonials;
CREATE POLICY "testimonials admin write" ON public.testimonials FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "faqs admin write" ON public.faqs;
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "contact_info admin write" ON public.contact_info;
CREATE POLICY "contact_info admin write" ON public.contact_info FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "admins read submissions" ON public.contact_submissions;
CREATE POLICY "admins read submissions" ON public.contact_submissions FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "admins update submissions" ON public.contact_submissions;
CREATE POLICY "admins update submissions" ON public.contact_submissions FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "admins delete submissions" ON public.contact_submissions;
CREATE POLICY "admins delete submissions" ON public.contact_submissions FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(),'admin'));

-- Recreate storage.objects media policies
DROP POLICY IF EXISTS "media admin insert" ON storage.objects;
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "media admin update" ON storage.objects;
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND private.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'media' AND private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "media admin delete" ON storage.objects;
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND private.has_role(auth.uid(),'admin'));

-- Drop the public wrapper so it can no longer be called through the API
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- Replace the always-true INSERT policy with a validated version
DROP POLICY IF EXISTS "anyone can submit" ON public.contact_submissions;
CREATE POLICY "anyone can submit" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 120
    AND length(btrim(email)) BETWEEN 5 AND 254
    AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    AND length(btrim(project_details)) BETWEEN 5 AND 5000
    AND (phone IS NULL OR length(phone) <= 40)
    AND (business_name IS NULL OR length(business_name) <= 200)
    AND is_read = false
  );
