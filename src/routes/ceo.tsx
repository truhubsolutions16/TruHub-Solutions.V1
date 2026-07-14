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
        title: "CEO | Bharani Kumar.G | TruHub Solutions",
      },
      {
        name: "description",
        content:
          "Meet Bharani Kumar.G, Chief Executive Officer (CEO) of TruHub Solutions. Discover his leadership, vision, and commitment to delivering innovative technology solutions.",
      },
      {
        name: "keywords",
        content:
          "Bharani Kumar.G, CEO, Chief Executive Officer, TruHub Solutions, Technology Leader, Business Executive",
      },
      {
        property: "og:title",
        content: "CEO | Bharani Kumar.G | TruHub Solutions",
      },
      {
        property: "og:description",
        content:
          "Meet Bharani Kumar.G, CEO of TruHub Solutions.",
      },
      {
        property: "og:image",
        content: "https://truhubsolutions.in/ceo-truhub.webp",
      },
      {
        property: "og:url",
        content: "https://truhubsolutions.in/ceo",
      },
      {
        property: "og:type",
        content: "profile",
      },
    ],
  }),

  component: CEOPage,
});

function CEOPage() {
  return <CEO />;
}
