import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/legal-layout";

const SITE_URL = "https://truhubsolutions.lovable.app";
const TITLE = "Cookie Policy — TruHub Solutions";
const DESC = "How TruHub Solutions uses cookies and similar technologies.";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE_URL}/cookies` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/cookies` }],
  }),
  component: CookiePage,
});

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-white mt-8">{children}</h2>;
}

function CookiePage() {
  return (
    <LegalLayout title="Cookie Policy" updated="July 2026">
      <p>
        This Cookie Policy explains how TruHub Solutions uses cookies and similar technologies when you visit
        our website.
      </p>

      <H>1. What are cookies?</H>
      <p>
        Cookies are small text files placed on your device that help websites function, remember preferences,
        and understand how visitors use the site.
      </p>

      <H>2. Types of cookies we use</H>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Essential</strong> — required for authentication, security and core functionality.</li>
        <li><strong>Preference</strong> — remember settings such as theme or language.</li>
        <li><strong>Analytics</strong> — first-party analytics to understand traffic, page performance and improve the site.</li>
      </ul>

      <H>3. Third-party services</H>
      <p>
        Some pages may load resources from trusted providers (fonts, embedded videos, payment providers) that
        may set their own cookies subject to their own policies.
      </p>

      <H>4. Managing cookies</H>
      <p>
        You can control cookies through your browser settings. Blocking essential cookies may prevent parts of
        the site from working correctly.
      </p>

      <H>5. Changes</H>
      <p>We may update this policy from time to time. The revised date is shown at the top.</p>

      <H>6. Contact</H>
      <p>
        Questions? Email <a href="mailto:truhub.solutions@gmail.com" className="text-[#38BDF8]">truhub.solutions@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
