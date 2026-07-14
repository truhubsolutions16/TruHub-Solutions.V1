import { createFileRoute } from "@tanstack/react-router";
import { Founder } from "@/components/site/founder";

export const Route = createFileRoute("/founder")({
  head: () => ({
  links: [
  {
    rel: "canonical",
    href: "https://truhubsolutions.in/founder",
  },
],
meta: [
  {
    property: "og:title",
    content: "Founder | Jayanth Gone | TruHub Solutions",
  },
  {
    property: "og:description",
    content: "Meet the Founder of TruHub Solutions.",
  },
  {
    property: "og:image",
    content: "https://truhubsolutions.in/Founder-TruHub-Solutions.webp",
  },
  {
    property: "og:url",
    content: "https://truhubsolutions.in/founder",
  },
],
  }),

function FounderPage() {
  return (
    <Founder
      name="Jayanth Gone"
      title="Founder & Chairman"
      vision="Your vision here..."
      skills={[
        "Web Development",
        "AI Solutions",
        "Business Strategy",
        "Software Engineering",
      ]}
    />
  );
}
