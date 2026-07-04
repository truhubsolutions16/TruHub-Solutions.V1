
CREATE TABLE public.analytics_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  path text,
  session_id text,
  visitor_id text,
  referrer text,
  source text,
  device text,
  browser text,
  os text,
  country text,
  city text,
  screen_w int,
  screen_h int,
  duration_ms int,
  scroll_depth int,
  meta jsonb DEFAULT '{}'::jsonb,
  ip_hash text,
  user_agent text,
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

CREATE POLICY "admins read analytics_events" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.analytics_sessions (
  session_id text PRIMARY KEY,
  visitor_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  page_count int NOT NULL DEFAULT 0,
  is_bounce boolean NOT NULL DEFAULT true,
  entry_path text,
  exit_path text,
  source text,
  referrer text,
  device text,
  browser text,
  os text,
  country text,
  city text,
  is_returning boolean NOT NULL DEFAULT false
);
CREATE INDEX idx_as_started ON public.analytics_sessions(started_at DESC);
CREATE INDEX idx_as_last_seen ON public.analytics_sessions(last_seen_at DESC);
CREATE INDEX idx_as_visitor ON public.analytics_sessions(visitor_id);

GRANT SELECT ON public.analytics_sessions TO authenticated;
GRANT ALL ON public.analytics_sessions TO service_role;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read analytics_sessions" ON public.analytics_sessions
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
