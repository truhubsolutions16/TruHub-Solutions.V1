import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { subscribeToCmsUpdates } from "@/lib/cms-broadcast";
import { siteContentQuery, useSiteContent } from "@/hooks/use-cms";
import { getSiteSettings } from "@/lib/cms.functions";
import { SiteLoader } from "@/components/site/loader";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Founder } from "@/components/site/founder";
import { Services, WhyChooseUs } from "@/components/site/services";
import { Pricing } from "@/components/site/pricing";
import { Portfolio } from "@/components/site/portfolio";
import { Process } from "@/components/site/process";
import { FAQ } from "@/components/site/faq";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { FloatingWhatsApp } from "@/components/site/whatsapp";
import { ChatWidget } from "@/components/site/chat-widget";
import { WHY_CHOOSE_US, PROCESS_STEPS } from "@/lib/site-data";


const SITE_URL = "https://truhubsolutions.lovable.app";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  head: ({ loaderData }) => {
    const faqs = (loaderData as { faqs?: Array<{ question: string; answer: string }> } | undefined)?.faqs ?? [];
    const scripts: Array<{ type: string; children: string }> = [];
    if (faqs.length > 0) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      });
    }
    return {
      meta: [{ property: "og:url", content: `${SITE_URL}/` }],
      links: [{ rel: "canonical", href: `${SITE_URL}/` }],
      scripts,
    };
  },
  component: Index,
});

const FALLBACK = {
  hero: {
    headline: "We Build Digital Experiences That Grow Businesses.",
    subtitle:
      "Premium websites, branding, AI automation and digital solutions crafted to help businesses grow online.",
    cta_primary_label: "Start Your Project",
    cta_secondary_label: "Explore Portfolio",
  },
  about: {
    heading: "A luxury technology studio for ambitious brands.",
    body: "TruHub Solutions crafts premium digital experiences that convert.",
  },
  founder: {
    name: "Jayanth Gone",
    title: "Founder & Chairman",
    vision:
      "To turn every business we touch into a category-defining digital brand — with design that inspires, technology that scales, and craft that lasts.",
    skills: ["Web Development", "UI/UX Design", "Branding", "Digital Solutions"],
    photo_url: null,
  },
  contact: { email: "truhub.solutions@gmail.com", phone: "+91 7989367882", whatsapp: "917989367882" },
};

function Index() {
  const qc = useQueryClient();
  useEffect(
    () => subscribeToCmsUpdates(() => qc.invalidateQueries({ queryKey: ["site-content"] })),
    [qc],
  );
  const { data } = useSiteContent();
  const { data: settings } = useQuery({ queryKey: ["site-settings"], queryFn: () => getSiteSettings() });
  const hero = data?.hero ?? FALLBACK.hero;
  const about = data?.about ?? FALLBACK.about;
  const founder = data?.founder ?? FALLBACK.founder;
  const contact = data?.contact ?? FALLBACK.contact;
  const meta = data?.meta ?? {};
  const whyItems = (data?.whyChooseUs && data.whyChooseUs.length > 0)
    ? data.whyChooseUs.map((w) => ({ title: w.title, desc: w.description }))
    : WHY_CHOOSE_US;
  const processItems = (data?.processSteps && data.processSteps.length > 0)
    ? data.processSteps.map((s) => ({ title: s.title, desc: s.description, duration: s.duration ?? undefined }))
    : PROCESS_STEPS;

  return (
    <div className="relative min-h-screen bg-background text-white">
      <SiteLoader />
      <Navbar />
      <main>
        <Hero
          headline={hero.headline}
          subtitle={hero.subtitle}
          ctaPrimary={hero.cta_primary_label}
          ctaSecondary={hero.cta_secondary_label}
        />
        <About
          heading={about.heading}
          body={about.body}
          meta={meta.about}
        />
        <Services items={data?.services ?? []} meta={meta.services} />

        <WhyChooseUs items={whyItems} meta={meta.why} />
        <Pricing plans={data?.plans ?? []} addons={data?.addons ?? []} meta={meta.pricing} addonsMeta={meta.addons} />
        <Portfolio items={data?.portfolio ?? []} meta={meta.portfolio} />
        <Founder
          name={founder.name}
          title={founder.title}
          vision={founder.vision}
          skills={founder.skills}
          photoUrl={founder.photo_url}
          meta={meta.founder}
        />
        <Process steps={processItems} meta={meta.process} />
        <FAQ items={data?.faqs ?? []} meta={meta.faq} />

        <Contact email={contact.email} phone={contact.phone} meta={meta.contact} />
      </main>
      <Footer email={contact.email} phone={contact.phone} />
      {(settings?.whatsapp_enabled ?? true) && <FloatingWhatsApp number={contact.whatsapp} />}
      <ChatWidget />
    </div>
  );
}
