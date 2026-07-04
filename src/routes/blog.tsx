import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { FloatingWhatsApp } from "@/components/site/whatsapp";
import { ChatWidget } from "@/components/site/chat-widget";
import { listBlogPosts } from "@/lib/cms.functions";

const SITE_URL = "https://truhubsolutions.lovable.app";

const postsQuery = queryOptions({
  queryKey: ["blog-posts"],
  queryFn: () => listBlogPosts(),
});

export const Route = createFileRoute("/blog")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  head: () => ({
    meta: [
      { title: "Blog — TruHub Solutions" },
      { name: "description", content: "Insights on web design, AI automation, branding and digital growth from the TruHub team." },
      { property: "og:title", content: "TruHub Blog" },
      { property: "og:description", content: "Insights on web design, AI automation, branding and digital growth." },
      { property: "og:url", content: `${SITE_URL}/blog` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(postsQuery);
  return (
    <div className="relative min-h-screen bg-background text-white">
      <Navbar />
      <main className="container-x pt-32 pb-24">
        <div className="mb-12 text-center">
          <div className="inline-block rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-widest text-[#38BDF8]">Blog</div>
          <h1 className="mt-4 font-display text-4xl font-bold text-gradient sm:text-5xl">Insights & Ideas</h1>
          <p className="mt-3 text-white/60">Practical thinking on design, code, AI and growth.</p>
        </div>
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center text-white/40">
            No posts yet — check back soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-[#38BDF8]/40 hover:bg-white/[0.04]"
              >
                {p.cover_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-white/60 line-clamp-3">{p.excerpt}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/40">
                    {p.published_at && <span>{new Date(p.published_at).toLocaleDateString()}</span>}
                    {p.tags?.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full border border-white/10 px-2 py-0.5">{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer email="truhub.solutions@gmail.com" phone="+91 7989367882" />
      <FloatingWhatsApp />
      <ChatWidget />
    </div>
  );
}
