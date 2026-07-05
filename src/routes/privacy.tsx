import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/legal-layout";

const SITE_URL = "https://truhubsolutions.lovable.app";
const TITLE = "Privacy Policy — TruHub Solutions";
const DESC = "How TruHub Solutions collects, uses, and protects your personal information.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE_URL}/privacy` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
  }),
  component: PrivacyPage,
});

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-white mt-8">{children}</h2>;
}

function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <p>
        TruHub Solutions ("we", "our", "us") respects your privacy and is committed to protecting the personal
        information you share with us. This Privacy Policy explains what we collect, how we use it, and the
        choices you have.
      </p>

      <H>1. Information we collect</H>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Contact details</strong> you submit via forms — name, email, phone, company, project details.</li>
        <li><strong>Account data</strong> if you sign in — email, authentication identifiers.</li>
        <li><strong>Usage data</strong> — pages visited, referrers, device/browser, approximate location (from IP), collected via first-party analytics.</li>
        <li><strong>Cookies</strong> and similar technologies (see our Cookie Policy).</li>
      </ul>

      <H>2. How we use your information</H>
      <ul className="list-disc pl-6 space-y-2">
        <li>To respond to inquiries and deliver services you request.</li>
        <li>To send project updates, invoices, and transactional emails.</li>
        <li>To improve our website, services and security.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <H>3. Legal basis</H>
      <p>
        We process personal data on the basis of your consent, to perform a contract with you, our legitimate
        interests in operating the business, or to comply with law.
      </p>

      <H>4. Sharing</H>
      <p>
        We do not sell personal data. We share limited data only with trusted service providers who help us
        operate — hosting, email delivery, analytics, payments — under confidentiality obligations.
      </p>

      <H>5. Data retention</H>
      <p>
        We retain personal data only as long as needed for the purposes described, or as required by law. You
        may request deletion at any time.
      </p>

      <H>6. Your rights</H>
      <p>
        You may request access, correction, deletion, or export of your data, and object to certain processing.
        Contact us at <a href="mailto:truhub.solutions@gmail.com" className="text-[#38BDF8]">truhub.solutions@gmail.com</a>.
      </p>

      <H>7. Security</H>
      <p>
        We apply industry-standard security controls including encryption in transit, access controls, and
        regular reviews. No system is 100% secure — please use strong passwords and report concerns to us.
      </p>

      <H>8. International transfers</H>
      <p>
        Your data may be processed in countries other than your own. We rely on appropriate safeguards where
        required.
      </p>

      <H>9. Children</H>
      <p>Our services are not directed to children under 13, and we do not knowingly collect their data.</p>

      <H>10. Changes</H>
      <p>We may update this policy. Material changes will be posted here with a new "last updated" date.</p>

      <H>11. Contact</H>
      <p>
        TruHub Solutions · <a href="mailto:truhub.solutions@gmail.com" className="text-[#38BDF8]">truhub.solutions@gmail.com</a> ·
        {" "}<a href="tel:+917989367882" className="text-[#38BDF8]">+91 7989367882</a>
      </p>
    </LegalLayout>
  );
}
