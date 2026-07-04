
DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM ('new','contacted','qualified','proposal','won','lost','archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_priority AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS status public.lead_status NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS priority public.lead_priority NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS lead_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER trg_contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.lead_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  message text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_timeline TO authenticated;
GRANT ALL ON public.lead_timeline TO service_role;
ALTER TABLE public.lead_timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage lead_timeline" ON public.lead_timeline;
CREATE POLICY "Admins manage lead_timeline" ON public.lead_timeline
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_lead_timeline_lead ON public.lead_timeline(lead_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.tg_lead_timeline_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_timeline(lead_id, event_type, message, meta)
    VALUES (NEW.id, 'created', 'Lead created', jsonb_build_object('source', NEW.source));
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.lead_timeline(lead_id, actor_id, event_type, message, meta)
    VALUES (NEW.id, auth.uid(), 'status_change', 'Status changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  IF NEW.priority IS DISTINCT FROM OLD.priority THEN
    INSERT INTO public.lead_timeline(lead_id, actor_id, event_type, message, meta)
    VALUES (NEW.id, auth.uid(), 'priority_change', 'Priority changed', jsonb_build_object('from', OLD.priority, 'to', NEW.priority));
  END IF;
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    INSERT INTO public.lead_timeline(lead_id, actor_id, event_type, message, meta)
    VALUES (NEW.id, auth.uid(), 'assignment', 'Assignee changed', jsonb_build_object('from', OLD.assigned_to, 'to', NEW.assigned_to));
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_lead_timeline_ins ON public.contact_submissions;
CREATE TRIGGER trg_lead_timeline_ins AFTER INSERT ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.tg_lead_timeline_changes();
DROP TRIGGER IF EXISTS trg_lead_timeline_upd ON public.contact_submissions;
CREATE TRIGGER trg_lead_timeline_upd AFTER UPDATE ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.tg_lead_timeline_changes();

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view activity_logs" ON public.activity_logs;
CREATE POLICY "Admins view activity_logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins insert activity_logs" ON public.activity_logs;
CREATE POLICY "Admins insert activity_logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON public.activity_logs(actor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  success boolean NOT NULL,
  failure_reason text,
  ip_address text,
  user_agent text,
  country text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.login_history TO authenticated;
GRANT ALL ON public.login_history TO service_role;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view login_history" ON public.login_history;
CREATE POLICY "Admins view login_history" ON public.login_history
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'::public.app_role));
DROP POLICY IF EXISTS "Anyone inserts login_history" ON public.login_history;
CREATE POLICY "Anyone inserts login_history" ON public.login_history
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_login_history_created ON public.login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON public.login_history(email, created_at DESC);

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  two_factor_secret text,
  last_password_change_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.admin_profiles TO authenticated;
GRANT ALL ON public.admin_profiles TO service_role;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own admin_profile" ON public.admin_profiles;
CREATE POLICY "Users read own admin_profile" ON public.admin_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.has_role(auth.uid(),'admin'::public.app_role));
DROP POLICY IF EXISTS "Users update own admin_profile" ON public.admin_profiles;
CREATE POLICY "Users update own admin_profile" ON public.admin_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users insert own admin_profile" ON public.admin_profiles;
CREATE POLICY "Users insert own admin_profile" ON public.admin_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trg_admin_profiles_updated_at BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
