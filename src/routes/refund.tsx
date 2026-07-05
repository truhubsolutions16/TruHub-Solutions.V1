import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/legal-layout";

const SITE_URL = "https://truhubsolutions.lovable.app";
const TITLE = "Refund Policy — TruHub Solutions";
const DESC = "Refund and cancellation policy for TruHub Solutions services.";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE_URL}/refund` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/refund` }],
  }),
  component: RefundPage,
});

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-white mt-8">{children}</h2>;
}

function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" updated="July 2026">
      <p>
        We want every client to be happy with our work. This policy explains how refunds and cancellations are
        handled at TruHub Solutions.
      </p>

      <H>1. Advance payments</H>
      <p>
        Most projects require a 50% advance to reserve our team's time and begin discovery, planning and
        design. This advance is non-refundable once work has commenced, as it covers scoping, research and
        the initial hours of the project.
      </p>

      <H>2. Cancellation before work starts</H>
      <p>
        If you cancel within <strong>48 hours</strong> of paying the advance and before any work has begun, you
        may request a full refund. Requests must be made in writing to
        <a href="mailto:truhub.solutions@gmail.com" className="text-[#38BDF8]"> truhub.solutions@gmail.com</a>.
      </p>

      <H>3. Cancellation after work has started</H>
      <p>
        If you cancel after work has started, we will invoice for the work completed to date and refund any
        remaining unearned balance, if applicable. Delivered assets are handed over on payment.
      </p>

      <H>4. Subscription / retainer services</H>
      <p>
        Monthly retainers may be cancelled with 15 days' written notice. Fees for the current billing period
        are non-refundable, and services continue until the end of that period.
      </p>

      <H>5. Non-refundable items</H>
      <ul className="list-disc pl-6 space-y-2">
        <li>Third-party costs already paid on your behalf (domains, hosting, licenses, ad spend).</li>
        <li>Custom design or development work already delivered and accepted.</li>
        <li>Rush / expedited delivery fees.</li>
      </ul>

      <H>6. How to request a refund</H>
      <p>
        Email <a href="mailto:truhub.solutions@gmail.com" className="text-[#38BDF8]">truhub.solutions@gmail.com</a>
        {" "}with your invoice number and reason. Approved refunds are processed within 7–10 business days to the
        original payment method.
      </p>

      <H>7. Disputes</H>
      <p>
        We prefer to resolve concerns directly and quickly. Please reach out before initiating a chargeback so
        we can help.
      </p>
    </LegalLayout>
  );
}
