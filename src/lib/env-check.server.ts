// Server-only env var validation. Import from src/server.ts so missing config
// fails loudly at boot instead of surfacing as a generic "Something went wrong"
// SSR error page on the first request.
//
// Runs once per Worker/Node instance (module-scope). Safe to import from
// server.ts because this file is *.server.ts and the bundler prevents it
// from being pulled into any client chunk.

type EnvSpec = {
  name: string;
  required: boolean;
  hint: string;
};

// Client-visible VITE_* vars are validated by the Vite build itself
// (they're inlined at build time), so we only guard runtime server vars here.
const ENV_SPECS: EnvSpec[] = [
  { name: "SUPABASE_URL", required: true, hint: "Backend URL (same as VITE_SUPABASE_URL)" },
  { name: "SUPABASE_PUBLISHABLE_KEY", required: true, hint: "Publishable/anon key for the Data API" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: false, hint: "Only needed for admin server functions" },
  { name: "ADMIN_ACCESS_CODE", required: false, hint: "Required for /admin gate — set if you use the admin panel" },
  { name: "LOVABLE_API_KEY", required: false, hint: "Only needed if you use Lovable AI Gateway server-side" },
];

let validated = false;

export function validateServerEnv(): void {
  if (validated) return;
  validated = true;

  const missing: EnvSpec[] = [];
  const warnings: EnvSpec[] = [];

  for (const spec of ENV_SPECS) {
    const value = process.env[spec.name];
    if (!value || value.trim() === "") {
      if (spec.required) missing.push(spec);
      else warnings.push(spec);
    }
  }

  for (const spec of warnings) {
    console.warn(`[env] Optional env var not set: ${spec.name} — ${spec.hint}`);
  }

  if (missing.length > 0) {
    const lines = missing.map((s) => `  - ${s.name}: ${s.hint}`).join("\n");
    const message =
      `Missing required server environment variable(s):\n${lines}\n\n` +
      `On Vercel: Project → Settings → Environment Variables. ` +
      `See VERCEL_DEPLOYMENT.md for the full checklist.`;
    console.error(`[env] ${message}`);
    throw new Error(message);
  }
}
