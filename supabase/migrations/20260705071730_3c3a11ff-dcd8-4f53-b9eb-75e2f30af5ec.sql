
-- 1) team_members: remove PII from public exposure via a safe view
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;

CREATE OR REPLACE VIEW public.team_members_public
WITH (security_invoker = true) AS
SELECT id, name, title, tagline, description, photo_url, sort_order, is_active
FROM public.team_members
WHERE is_active = true;

-- Re-add a public SELECT policy so the view (running as the invoker) can read safe rows.
CREATE POLICY "Public can view active team members (safe cols)"
ON public.team_members
FOR SELECT
USING (is_active = true);

REVOKE ALL ON public.team_members FROM anon;
GRANT SELECT (id, name, title, tagline, description, photo_url, sort_order, is_active)
  ON public.team_members TO anon;
GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- 2) not_found_log: replace permissive WITH CHECK (true) with a bounded check
DROP POLICY IF EXISTS "not_found_log public insert" ON public.not_found_log;

CREATE POLICY "not_found_log public insert"
ON public.not_found_log
FOR INSERT
WITH CHECK (
  path IS NOT NULL
  AND length(path) <= 2048
  AND (referrer IS NULL OR length(referrer) <= 2048)
  AND (user_agent IS NULL OR length(user_agent) <= 1024)
);
