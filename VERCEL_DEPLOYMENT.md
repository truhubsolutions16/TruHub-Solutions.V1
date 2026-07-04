# Vercel Deployment Checklist — TruHub Solutions

This app is a TanStack Start SSR app. Lovable's hosting runs it on
Cloudflare Workers automatically. To deploy the **same code** to Vercel,
follow this checklist end-to-end.

> **Recommended:** publish through Lovable instead (one click, all env
> vars auto-wired). Only use Vercel if you have a specific reason to.

---

## 1. Framework preset

In Vercel → **Project → Settings → General**:

- **Framework Preset:** Other
- **Build Command:** `bun run build` (or `npm run build`)
- **Output Directory:** *(leave blank — Nitro writes to `.vercel/output/`)*
- **Install Command:** `bun install` (or `npm install`)
- **Node.js Version:** 20.x or newer

The Vite config auto-detects Vercel (`process.env.VERCEL === "1"`) and
sets Nitro's `preset: "vercel"` so SSR is emitted as Vercel Serverless
Functions. No further build tweaks required.

---

## 2. Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for
**Production, Preview, and Development**.

### Server-only (runtime)

| Variable | Required | Where to find it |
|---|---|---|
| `SUPABASE_URL` | ✅ | Same value as `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | ✅ | Same value as `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Only if you use admin server functions. **Not available from Lovable Cloud** — you must fetch it from your own Supabase project dashboard. |
| `ADMIN_ACCESS_CODE` | ⚠️ | Required only if you use the `/admin` gate. Set any strong string. |
| `LOVABLE_API_KEY` | ⚠️ | Only if you call the Lovable AI Gateway from server code. Provisioned by Lovable — not portable to Vercel unless you have a paid Lovable AI plan and rotate the key manually. |

### Client-visible (build-time, inlined by Vite)

| Variable | Required |
|---|---|
| `VITE_SUPABASE_URL` | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | ✅ |

⚠️ Client vars are **baked into the JS bundle at build time**. If you
change them in Vercel, you must trigger a new deploy for the change to
take effect.

---

## 3. Startup validation

`src/lib/env-check.server.ts` runs at boot inside `src/server.ts`. If any
**required** var is missing, the server throws immediately with a clear
list — you'll see it in Vercel's function logs instead of a mystery 500.
Optional vars log a warning but don't crash.

To test locally before pushing:

```bash
SUPABASE_URL="" bun run build && bun run start
# → [env] Missing required server environment variable(s): ...
```

---

## 4. Post-deploy sanity checks

1. Open the Vercel URL — home page should render (not "Something went
   wrong").
2. Check **Vercel → Deployments → Functions logs** for any `[env]`
   warnings.
3. Try `/admin` — if `ADMIN_ACCESS_CODE` is missing this will fail.
4. Try a form/contact submission — verifies `SUPABASE_*` reach the
   Serverless Function.

---

## 5. Known limitations on Vercel

- **Lovable Cloud secrets** (`SUPABASE_SERVICE_ROLE_KEY`, database
  password, `LOVABLE_API_KEY`) are **not exposed** by Lovable — they only
  work inside Lovable's hosting. If your app depends on any of these,
  either keep hosting on Lovable, or migrate to your own Supabase
  project + your own AI provider.
- Cloudflare-specific bindings (KV, R2, Durable Objects) — this app
  doesn't use any, so nothing to migrate.
