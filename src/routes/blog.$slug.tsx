import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getBlogPost } from "@/lib/cms.functions";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: () => getBlogPost({ data: { slug } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(postQuery(params.slug)),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();

  const { data: post } = useSuspenseQuery(postQuery(slug));
 
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1>Blog Not Found</h1>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container mx-auto max-w-4xl py-24">

        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            className="rounded-xl mb-8 w-full"
          />
        )}

        <h1 className="text-5xl font-bold mb-6">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-white/60 mb-10">
            {post.excerpt}
          </p>
        )}

    <article className="prose prose-invert max-w-none whitespace-pre-wrap">
        {post.body_md}
      </article>
      </main>

      <Footer
        email="info@truhubsolutions.in"
        phone="+91 7989367882"
      />
    </>
  );
}
