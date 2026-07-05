import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/legal-layout";

const SITE_URL = "https://truhubsolutions.lovable.app";
const TITLE = "Terms & Conditions — TruHub Solutions";
const DESC = "The terms and conditions that govern the use of TruHub Solutions' website and services.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE_URL}/terms` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
  }),
  component: TermsPage,
});

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-white mt-8">{children}</h2>;
}

function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" updated="July 2026">
      <p>
        By accessing or using the TruHub Solutions website and services ("Services"), you agree to these Terms
        & Conditions. If you do not agree, please do not use the Services.
      </p>

      <H>1. Services</H>
      <p>
        We provide web development, design, branding, AI automation, and related digital services. Specific
        deliverables and timelines will be described in a written proposal or Service Agreement.
      </p>

      <H>2. Client responsibilities</H>
      <ul className="list-disc pl-6 space-y-2">
        <li>Provide accurate information, content, credentials and timely feedback.</li>
        <li>Ensure you own or have licenses for all content you supply.</li>
        <li>Respond to reviews within agreed timelines to avoid schedule delays.</li>
      </ul>

      <H>3. Payments</H>
      <p>
        Unless stated otherwise, we require a 50% advance to begin work and the remaining balance before final
        delivery or handover. Invoices are due on receipt. Late payments may suspend work.
      </p>

      <H>4. Intellectual property</H>
      <p>
        Final deliverables become the client's property upon full payment. Pre-existing tools, frameworks and
        internal code remain the property of TruHub Solutions. We may showcase completed work in our portfolio
        unless you request otherwise in writing.
      </p>

      <H>5. Revisions and scope changes</H>
      <p>
        Reasonable revisions within the agreed scope are included. Additional work, features, or changes to
        scope will be quoted separately.
      </p>

      <H>6. Warranties and disclaimer</H>
      <p>
        We deliver Services with reasonable skill and care. Services are provided "as is" without further
        warranties. We are not responsible for third-party outages, hosting failures outside our control, or
        losses arising from client-supplied content.
      </p>

      <H>7. Limitation of liability</H>
      <p>
        To the maximum extent permitted by law, our aggregate liability for any claim is limited to the amount
        paid by you for the specific Service giving rise to the claim in the preceding 3 months.
      </p>

      <H>8. Termination</H>
      <p>
        Either party may terminate with written notice for material breach. Fees earned up to termination are
        payable, and work completed to date will be handed over.
      </p>

      <H>9. Confidentiality</H>
      <p>Both parties agree to keep non-public business information confidential.</p>

      <H>10. Governing law</H>
      <p>These Terms are governed by the laws of India. Disputes are subject to the courts of Telangana.</p>

      <H>11. Contact</H>
      <p>
        TruHub Solutions · <a href="mailto:truhub.solutions@gmail.com" className="text-[#38BDF8]">truhub.solutions@gmail.com</a>
      </p>
    </LegalLayout>
  );
}
