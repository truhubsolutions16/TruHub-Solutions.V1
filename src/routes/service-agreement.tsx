import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/legal-layout";

const SITE_URL = "https://truhubsolutions.lovable.app";
const TITLE = "Service Agreement — TruHub Solutions";
const DESC = "Master service agreement between TruHub Solutions and its clients.";

export const Route = createFileRoute("/service-agreement")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE_URL}/service-agreement` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/service-agreement` }],
  }),
  component: ServiceAgreementPage,
});

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-white mt-8">{children}</h2>;
}

function ServiceAgreementPage() {
  return (
    <LegalLayout title="Client Service Agreement" updated="July 2026">
      <p>
        This Service Agreement ("Agreement") is entered into between <strong>TruHub Solutions</strong> ("Service Provider")
        and the client identified in the corresponding proposal or invoice ("Client"). It governs all services
        delivered by TruHub Solutions unless a separately signed statement of work overrides specific terms.
      </p>

      <H>1. Scope of work</H>
      <p>
        The specific deliverables, timelines, technologies, and pricing for each engagement are defined in a
        written proposal or statement of work ("SOW"). Each SOW is incorporated by reference into this
        Agreement.
      </p>

      <H>2. Fees and payment terms</H>
      <ul className="list-disc pl-6 space-y-2">
        <li>50% advance to begin work; 50% due before final delivery unless the SOW states otherwise.</li>
        <li>Invoices are payable within 7 days of issue.</li>
        <li>Late payments over 15 days may pause work and incur a 2% monthly late fee.</li>
      </ul>

      <H>3. Client responsibilities</H>
      <ul className="list-disc pl-6 space-y-2">
        <li>Assign a single point of contact empowered to make decisions.</li>
        <li>Provide content, brand assets, access credentials, and feedback promptly.</li>
        <li>Respond to review milestones within 5 business days to keep the timeline on track.</li>
      </ul>

      <H>4. Change requests</H>
      <p>
        Changes to scope, features, or deliverables outside the original SOW are handled via a written change
        request and quoted separately.
      </p>

      <H>5. Delivery, acceptance and revisions</H>
      <p>
        Deliverables are considered accepted 5 business days after handover unless Client provides written
        feedback within that period. Two rounds of revisions are included per major milestone; additional
        rounds are billable.
      </p>

      <H>6. Intellectual property</H>
      <p>
        Upon full payment, Client owns the final custom deliverables specified in the SOW. TruHub Solutions
        retains ownership of its pre-existing tools, frameworks, libraries and internal methods and grants
        Client a perpetual license to use them as embedded in the deliverables.
      </p>

      <H>7. Confidentiality</H>
      <p>
        Both parties will keep non-public information disclosed during the engagement confidential and use it
        only for purposes of the project.
      </p>

      <H>8. Warranties</H>
      <p>
        We warrant that services will be performed in a professional and workmanlike manner. Except as
        expressly stated, deliverables are provided "as is."
      </p>

      <H>9. Limitation of liability</H>
      <p>
        Neither party is liable for indirect, incidental or consequential damages. Aggregate liability under
        any SOW is capped at fees paid by Client under that SOW in the preceding 3 months.
      </p>

      <H>10. Term and termination</H>
      <p>
        Either party may terminate an active SOW with 15 days' written notice, or immediately for material
        breach uncured after 10 days' notice. Fees for work performed up to termination remain payable.
      </p>

      <H>11. Independent contractor</H>
      <p>
        TruHub Solutions performs services as an independent contractor. Nothing in this Agreement creates a
        partnership, employment or agency relationship.
      </p>

      <H>12. Governing law</H>
      <p>
        This Agreement is governed by the laws of India. Any dispute will be subject to the exclusive
        jurisdiction of the courts of Telangana.
      </p>

      <H>13. Acceptance</H>
      <p>
        Payment of an invoice or written approval of a proposal constitutes acceptance of this Agreement and
        the associated SOW.
      </p>

      <H>Contact</H>
      <p>
        TruHub Solutions · <a href="mailto:truhub.solutions@gmail.com" className="text-[#38BDF8]">truhub.solutions@gmail.com</a> ·
        {" "}<a href="tel:+917989367882" className="text-[#38BDF8]">+91 7989367882</a>
      </p>
    </LegalLayout>
  );
}
