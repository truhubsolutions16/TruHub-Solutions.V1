import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { FloatingWhatsApp } from "@/components/site/whatsapp";
import { ChatWidget } from "@/components/site/chat-widget";
import { getBlogPost } from "@/lib/cms.functions";

const SITE_URL = "https://truhubsolutions.lovable.app";

function postQuery(slug: string) {
  return queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const p = await getBlogPost({ data: { slug } });
      if (!p) throw notFound();
      return p;
    },
  });
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQuery(params.slug)),
  head: ({ params, loaderData }) => {
    const p = loaderData as { title?: string; excerpt?: string | null; seo_title?: string | null; seo_description?: string | null; cover_url?: string | null; published_at?: string | null } | undefined;
    const title = p?.seo_title || p?.title || "Post — TruHub";
    const desc = p?.seo_description || p?.excerpt || "Insights from TruHub Solutions.";
    const url = `${SITE_URL}/blog/${params.slug}`;
    const meta = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
    ];
    if (p?.cover_url) {
      meta.push({ property: "og:image", content: p.cover_url });
      meta.push({ name: "twitter:image", content: p.cover_url });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p?.title,
          description: desc,
          image: p?.cover_url ?? undefined,
          datePublished: p?.published_at ?? undefined,
          author: { "@type": "Organization", name: "TruHub Solutions" },
        }),
      }],
    };
  },
  component: BlogPost,
  errorComponent: ({ error }) => <div className="grid min-h-screen place-items-center text-white">Failed to load post: {error.message}</div>,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background text-white">
      <div className="text-center">
        <h1 className="font-display text-3xl">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-[#38BDF8]">Back to blog</Link>
      </div>
    </div>
  ),
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(postQuery(slug));
  return (
    <div className="relative min-h-screen bg-background text-white">
      <Navbar />
      <main className="container-x pt-32 pb-24">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"><ArrowLeft size={14} /> All posts</Link>
        <article className="mx-auto mt-6 max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-gradient sm:text-5xl">{p.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
            {p.published_at && <span>{new Date(p.published_at).toLocaleDateString()}</span>}
            {p.tags?.map((t) => <span key={t} className="rounded-full border border-white/10 px-2 py-0.5">{t}</span>)}
          </div>
          {p.cover_url && <img src={p.cover_url} alt={p.title} className="mt-8 w-full rounded-2xl border border-white/10 object-cover" />}
          <div className="prose prose-invert mt-10 max-w-none prose-headings:font-display prose-a:text-[#38BDF8]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.body_md}</ReactMarkdown>
          </div>
        </article>
      </main>
      <Footer email="truhub.solutions@gmail.com" phone="+91 7989367882" />
      <FloatingWhatsApp />
      <ChatWidget />
    </div>
  );
}
