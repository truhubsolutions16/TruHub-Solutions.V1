
DROP POLICY IF EXISTS "Anyone inserts login_history" ON public.login_history;
CREATE POLICY "Auth users insert own login_history" ON public.login_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

REVOKE EXECUTE ON FUNCTION public.tg_lead_timeline_changes() FROM PUBLIC, anon, authenticated;
