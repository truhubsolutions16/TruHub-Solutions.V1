// Client-side analytics beacon. Fires page views, sessions, scroll, clicks.
// Zero deps, keeps a stable visitor id in localStorage and a 30-min session in sessionStorage.

const VKEY = "th_vid";
const SKEY = "th_sid";
const SSTART = "th_sstart";
const SLAST = "th_slast";
const SPAGES = "th_spages";
const SENTRY = "th_sentry";
const RETURNING = "th_ret";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function uid() {
  return (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}
function detectBrowser(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}
function detectOS(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iOS/.test(ua)) return "iOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}
function detectSource(ref: string): string {
  if (!ref) return "direct";
  try {
    const u = new URL(ref);
    const h = u.hostname.toLowerCase();
    if (h.includes("google")) return "google";
    if (h.includes("bing")) return "bing";
    if (h.includes("duckduckgo")) return "duckduckgo";
    if (h.includes("facebook")) return "facebook";
    if (h.includes("instagram")) return "instagram";
    if (h.includes("linkedin")) return "linkedin";
    if (h.includes("twitter") || h.includes("x.com")) return "twitter";
    if (h.includes("youtube")) return "youtube";
    if (h.includes("t.co")) return "twitter";
    if (h.includes(location.hostname)) return "internal";
    return h;
  } catch { return "direct"; }
}

function ensureVisitor(): { visitorId: string; isReturning: boolean } {
  const existing = localStorage.getItem(VKEY);
  if (existing) return { visitorId: existing, isReturning: !!localStorage.getItem(RETURNING) };
  const id = uid();
  localStorage.setItem(VKEY, id);
  return { visitorId: id, isReturning: false };
}

function ensureSession(path: string, referrer: string): { sessionId: string; started: boolean } {
  const now = Date.now();
  const sid = sessionStorage.getItem(SKEY);
  const last = Number(sessionStorage.getItem(SLAST) ?? 0);
  if (sid && now - last < SESSION_TIMEOUT_MS) {
    sessionStorage.setItem(SLAST, String(now));
    return { sessionId: sid, started: false };
  }
  const newSid = uid();
  sessionStorage.setItem(SKEY, newSid);
  sessionStorage.setItem(SSTART, String(now));
  sessionStorage.setItem(SLAST, String(now));
  sessionStorage.setItem(SPAGES, "0");
  sessionStorage.setItem(SENTRY, path);
  // Mark returning for future sessions
  localStorage.setItem(RETURNING, "1");
  return { sessionId: newSid, started: true };
}

type EventPayload = {
  event_type: string;
  path?: string;
  meta?: Record<string, unknown>;
  scroll_depth?: number;
  duration_ms?: number;
};

async function sendBeacon(body: unknown) {
  try {
    const url = "/api/public/track";
    const data = JSON.stringify(body);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
      keepalive: true,
    });
  } catch { /* swallow */ }
}

export function track(event: EventPayload) {
  if (typeof window === "undefined") return;
  const path = event.path ?? location.pathname + location.search;
  const referrer = document.referrer || "";
  const { visitorId, isReturning } = ensureVisitor();
  const { sessionId, started } = ensureSession(path, referrer);

  const base = {
    event_type: event.event_type,
    path,
    session_id: sessionId,
    visitor_id: visitorId,
    referrer,
    source: detectSource(referrer),
    device: detectDevice(),
    browser: detectBrowser(),
    os: detectOS(),
    screen_w: window.screen?.width,
    screen_h: window.screen?.height,
    duration_ms: event.duration_ms,
    scroll_depth: event.scroll_depth,
    meta: event.meta ?? {},
    user_agent: navigator.userAgent,
    is_returning: isReturning,
    session_started: started,
  };
  void sendBeacon(base);
}

// Public helpers -----------------------------------------------------------
let scrollBuckets = new Set<number>();
let lastPath = "";
let pageStart = Date.now();

export function trackPageView(path?: string) {
  if (typeof window === "undefined") return;
  const p = path ?? location.pathname + location.search;
  if (p === lastPath) return;
  // Send previous page duration when navigating
  if (lastPath) {
    track({ event_type: "page_leave", path: lastPath, duration_ms: Date.now() - pageStart });
  }
  lastPath = p;
  pageStart = Date.now();
  scrollBuckets = new Set();
  track({ event_type: "page_view", path: p });
  // Bump page count on session
  const n = Number(sessionStorage.getItem(SPAGES) ?? 0) + 1;
  sessionStorage.setItem(SPAGES, String(n));
}

export function initAnalyticsListeners() {
  if (typeof window === "undefined") return () => {};
  // Skip admin routes entirely
  if (location.pathname.startsWith("/admin")) return () => {};

  const onScroll = () => {
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const pct = Math.min(100, Math.round((window.scrollY / total) * 100));
    for (const bucket of [25, 50, 75, 100]) {
      if (pct >= bucket && !scrollBuckets.has(bucket)) {
        scrollBuckets.add(bucket);
        track({ event_type: "scroll", scroll_depth: bucket });
      }
    }
  };

  const onClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest?.("[data-cta], a, button") as HTMLElement | null;
    if (!target) return;
    const cta = target.getAttribute("data-cta");
    if (cta) {
      track({ event_type: "cta_click", meta: { cta, text: target.textContent?.trim().slice(0, 80) } });
      return;
    }
    if (target.tagName === "A") {
      const href = (target as HTMLAnchorElement).href;
      try {
        const u = new URL(href, location.href);
        if (u.origin !== location.origin) {
          track({ event_type: "outbound_click", meta: { href } });
        }
      } catch { /* ignore */ }
    }
  };

  const onSubmit = (e: SubmitEvent) => {
    const form = e.target as HTMLFormElement | null;
    if (!form) return;
    track({ event_type: "form_submit", meta: { form: form.getAttribute("name") || form.id || "unknown" } });
  };

  const onHide = () => {
    if (lastPath) {
      track({ event_type: "page_leave", path: lastPath, duration_ms: Date.now() - pageStart });
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", onClick, true);
  document.addEventListener("submit", onSubmit, true);
  window.addEventListener("pagehide", onHide);

  return () => {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("submit", onSubmit, true);
    window.removeEventListener("pagehide", onHide);
  };
}
