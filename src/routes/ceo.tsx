import { createFileRoute } from "@tanstack/react-router";
import { CEO } from "@/components/site/ceo";

export const Route = createFileRoute("/ceo")({
  head: () => ({
    meta: [
      {
        title: "CEO | Bharani Kumar.G | TruHub Solutions",
      },
      {
        name: "description",
        content:
          "Meet Bharani Kumar.G, CEO of TruHub Solutions. Discover his leadership and business strategy behind the company's growth.",
      },
      {
        name: "keywords",
        content:
          "CEO, Bharani Kumar.G, TruHub Solutions, Technology CEO, Business Leader",
      },
    ],
  }),
  component: CEOPage,
});

function CEOPage() {
  return <CEO />;
}
