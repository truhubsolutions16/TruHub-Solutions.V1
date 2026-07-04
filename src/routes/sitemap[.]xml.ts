import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://truhubsolutions.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
        ];
        try {
          const sb = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          });
          const { data } = await sb.from("blog_posts").select("slug,published_at,updated_at").eq("published", true);
          for (const p of data ?? []) {
            entries.push({
              path: `/blog/${p.slug}`,
              lastmod: (p.updated_at ?? p.published_at ?? undefined)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        } catch (e) {
          console.warn("[sitemap] failed to load blog posts", e);
        }
        const urls = entries.map(
          (e) =>
            `  <url><loc>${BASE_URL}${e.path}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}${e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ""}${e.priority ? `<priority>${e.priority}</priority>` : ""}</url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

