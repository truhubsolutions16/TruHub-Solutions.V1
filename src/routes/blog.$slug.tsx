import { createFileRoute } from "@tanstack/react-router";
import { blogPosts } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="p-20 text-center">
        <h1>Blog Not Found</h1>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl py-20">

      <img
        src={post.cover_url}
        alt={post.title}
        className="rounded-xl mb-8"
      />

      <h1 className="text-5xl font-bold mb-4">

        {post.title}

      </h1>

      <p className="text-white/60 mb-10">

        {post.excerpt}

      </p>

      <article className="prose prose-invert">

        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
          }}
        >
          {post.body}
        </pre>

      </article>

    </main>
  );
}
