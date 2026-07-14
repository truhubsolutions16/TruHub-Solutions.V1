import { createFileRoute } from "@tanstack/react-router";
import { CEO } from "@/components/site/ceo";

export const Route = createFileRoute("/ceo")({
  head: () => ({
  links: [
  {
    rel: "canonical",
    href: "https://truhubsolutions.in/ceo",
  },
],
meta: [
  {
    property: "og:title",
    content: "CEO | Bharani Kumar.G | TruHub Solutions",
  },
  {
    property: "og:description",
    content: "Meet the CEO of TruHub Solutions.",
  },
  {
    property: "og:image",
    content: "https://truhubsolutions.in/ceo-truhub.webp",
  },
  {
    property: "og:url",
    content: "https://truhubsolutions.in/ceo",
  },
],
  }),
  component: CEOPage,
});

function CEOPage() {
  return <CEO />;
}
