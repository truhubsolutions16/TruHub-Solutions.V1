import { createFileRoute } from "@tanstack/react-router";
import { Founder } from "@/components/site/founder";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      {
        title: "Founder | Jayanth Gone | TruHub Solutions",
      },
      {
        name: "description",
        content:
          "Meet Jayanth Gone, Founder of TruHub Solutions. Learn about his vision, leadership, and journey in building innovative technology solutions.",
      },
      {
        name: "keywords",
        content:
          "Jayanth Gone, Founder, TruHub Solutions, Technology Entrepreneur, Software Company Founder",
      },
    ],
  }),
  component: FounderPage,
});

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
