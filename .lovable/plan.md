
# Enterprise Admin Upgrade — Build Plan

Scope is huge, so I'll ship in **4 reviewable phases**. Each phase leaves the frontend untouched, ships working DB + UI, and is independently testable. Approve this plan and I start Phase 1 immediately; each subsequent phase starts on your "next" reply.

Frontend/public site is off-limits everywhere. All work lives under `/admin`, new DB tables, and a tiny tracking beacon.

---

## Phase 1 — Analytics + Admin Dashboard redesign

**DB (new tables, all admin-only RLS via `has_role('admin')`):**
- `analytics_events` — event_type, path, session_id, visitor_id, referrer, device, browser, os, country, city, screen_w, screen_h, duration_ms, scroll_depth, meta jsonb, created_at. Indexed on (created_at), (event_type, created_at), (session_id).
- `analytics_sessions` — visitor_id, session_id, started_at, ended_at, page_count, is_bounce, entry_path, exit_path, source.

**Tracking beacon:** `src/lib/analytics/track.ts` (tiny, no deps). Public server route `POST /api/public/track` validates + inserts via service role. Client hook wired in `__root.tsx` fires: page_view, session_start, scroll_depth (25/50/75/100), cta_click (data-cta attr), outbound_click, form_submit. `visitor_id` in localStorage, `session_id` in sessionStorage (30 min idle).

**Admin UI (`/admin` → Overview tab redesigned + new Analytics tab):**
- KPI cards: Visitors / Unique / Returning / Sessions / Avg Duration / Bounce / Conversions / Live
- Charts (recharts, already installed): area (daily visitors), bar (top pages / sources), pie (devices / browsers / OS), line (conversion trend)
- Tables: Top Pages, Exit Pages, Traffic Sources, Countries/Cities, Screen sizes
- Live visitors polled every 10s (active in last 5 min)
- Date range picker (7d / 30d / 90d / custom)
- Geographic map: lightweight svg world using country counts (no external map lib)

**Dashboard widgets (dark, current tokens):** Visitors, Leads, Blogs, Services, Portfolio, Testimonials, Storage used, Recent Inquiries, Recent Activity, Quick Actions, System Health (DB ping + latest migration time).

---

## Phase 2 — Lead Management + Activity Logs + Security Center

**Leads (extend `contact_submissions`):**
- Add columns: `status` (enum), `priority` (enum), `lead_score` int, `follow_up_at`, `assigned_to` uuid, `source` text, `notes` text.
- New table `lead_timeline` (lead_id, actor, event_type, payload, created_at) — auto-logged on every change via trigger.
- New table `lead_attachments` (lead_id, file_path, uploaded_by).
- Admin UI: Kanban + table view, inline edit, filters (date/status/priority/service/source), bulk actions (change status, assign, delete), CSV + XLSX export (via `xlsx`), full-text search.

**Activity Logs:**
- New table `activity_logs` (user_id, action, module, entity_id, old_data jsonb, new_data jsonb, ip, user_agent, created_at).
- Server-side helper `logActivity()` called from every admin mutation (blog, portfolio, services, settings, media, auth events).
- Admin UI: filterable log viewer with diff render for old→new.

**Security Center:**
- New tables: `login_history` (user_id, ip, ua, success, created_at), `admin_sessions` (id, user_id, ua, ip, last_seen, revoked).
- Track login/logout/failed attempts in `login_history` from admin auth flow.
- Simple in-app rate limit: >5 failed attempts / 15min from same IP → block via check in admin gate.
- Session list w/ "revoke" button (marks row revoked; admin gate checks it).
- Password strength meter on any password change form.
- 2FA-ready: add `two_factor_secret`, `two_factor_enabled` columns on `profiles` (nullable, unused until real TOTP added — real TOTP deferred as it needs `otpauth` + QR flow; architecture ready).
- Auto-logout after 30 min idle in admin.
- Security dashboard: last 10 logins, failed count today, active sessions, weak points checklist.

---

## Phase 3 — Settings + SEO Management + Media Library

**Settings (extend `site_settings`):** website_name, logo_url, favicon_url, footer_html, copyright, social links jsonb, ga4_id, gtm_id, meta_pixel_id, smtp jsonb, theme_colors jsonb (admin only overrides), custom_css text, custom_js text, maintenance_mode bool, announcement jsonb. Injected into `__root.tsx` head at runtime (server-side read).

**SEO:**
- New table `page_seo` (path unique, title, description, keywords, canonical, robots, og jsonb, twitter jsonb, schema_jsonld jsonb).
- New table `redirects` (from_path unique, to_path, status).
- New table `not_found_log` (path, referrer, count, last_seen) — 404 monitor, incremented from `notFoundComponent`.
- Sitemap route already exists — extend to read `page_seo` + `redirects`.
- Admin UI: per-page SEO editor, redirects CRUD, 404 log viewer, broken-link scan (server fn crawls internal links, reports non-200).

**Media Library (extend existing `media` bucket usage):**
- New table `media_files` (path, folder, name, mime, size, tags text[], alt, uploaded_by, replaced_from).
- Folders (virtual, based on `folder` column), tag filter, search, bulk delete/move/rename, preview modal, copy URL, storage usage bar, unused-files detector (not referenced in blog_posts.cover_url / portfolio_items.image_url / services.image_url), replace file (uploads new, keeps path).
- Client-side image compression (browser-image-compression) on upload.

---

## Phase 4 — Backup + Notifications + Admin UX polish

**Backup:**
- New table `backups` (id, kind, size, storage_path, created_by, created_at).
- Server fn `createBackup()` — dumps every CMS table to JSON, writes to private `backups` bucket, records row.
- Server fn `restoreBackup(id)` — reads JSON, upserts by id (destructive-safe: only touches CMS tables, never auth/user_roles).
- Daily cron via `pg_cron` → calls `/api/public/hooks/daily-backup` (secured with `apikey` header per canonical pattern).
- Admin UI: list backups, download JSON, restore w/ confirm dialog.

**Notifications:**
- New table `notifications` (user_id, kind, title, body, link, read_at, created_at).
- Realtime subscription in admin layout — bell icon + unread count + toast on new.
- Auto-created on: new inquiry, failed login, backup success/failure, storage >80%.
- Browser Notifications API opt-in.

**Admin UX polish:**
- Command palette `⌘K` (cmdk, already installed) — jump to any admin tab, search leads/blogs/portfolio.
- Global search bar in admin header.
- Keyboard shortcuts (`g d` dashboard, `g l` leads, etc.).
- Resizable / sortable / filterable tables (already have `@tanstack/react-table` via shadcn), pagination.
- Context menus on rows.
- Empty states + skeletons everywhere.
- Error boundary on `/admin` route.

Admin stays **dark-only**, matches current tokens (`bg-background`, `text-foreground`, etc). No changes to public frontend anywhere.

---

## Technical guardrails (applied every phase)

- **Zero public-frontend changes.** All new code under `src/routes/admin.*`, `src/components/admin/*`, `src/lib/analytics/*`, `src/lib/leads/*`, etc.
- Every new `public.*` table: `CREATE` → `GRANT` (authenticated + service_role, no anon unless read-only public) → RLS ON → policies using `has_role(auth.uid(), 'admin')`.
- All admin mutations via `createServerFn` + `requireSupabaseAuth` + admin role check, wrapped by `logActivity()`.
- Tracking insert is the only public write path — uses service role in the server route, validated + rate-limited by simple in-memory bucket keyed on IP.
- Types regenerated after each migration; UI written after types land.
- Existing routes, components, and data are **not modified** except: `src/routes/admin.tsx` (new tabs added), `src/routes/__root.tsx` (analytics beacon + settings head injection), `contact_submissions` schema (additive columns only).

---

## What starts now

On approval I begin **Phase 1** in the next turn: migrations → tracking beacon → analytics server fns → Analytics tab UI → redesigned Dashboard tab. Estimated single-turn build. I'll ping you to run Phase 2 after review.
