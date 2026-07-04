// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Nitro preset resolution order:
//   1. Inside a Lovable build → forced to Cloudflare (this override is ignored). ✅
//   2. Outside Lovable → NITRO_PRESET env var wins (Vercel/Netlify auto-set it).
//   3. Falls back to the `preset` value below.
// Setting `preset: "vercel"` hard-pins the target when you run `bun run build`
// from Vercel's build step so SSR bundles into `.vercel/output/` correctly.
const nitroPreset = process.env.NITRO_PRESET ?? (process.env.VERCEL ? "vercel" : undefined);

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: nitroPreset ? { preset: nitroPreset } : undefined,
  vite: {
    build: {
      // Raise the "chunk > 500 kB" warning threshold. This is cosmetic only —
      // it doesn't change bundle output, just quiets the build log.
      chunkSizeWarningLimit: 1500,
    },
  },
});

