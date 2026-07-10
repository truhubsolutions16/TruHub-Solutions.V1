import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { CookieConsent } from "../components/site/cookie-consent";

import appCss from "../styles.css?url";


const SITE_TITLE =
"TruHub Solutions | Website Development | Branding | Digital Marketing | Business Software | UI/UX";

const SITE_DESC =
"TruHub Solutions provides Website Development, Branding, UI/UX Design, SEO, Digital Marketing, AI Automation and Custom Software Solutions to help startups and businesses grow faster.";
const OG_IMAGE =
  "https://truhubsolutions.in/og-image.webp";
function NotFoundComponent() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    (async () => {
      try {
        const { supabase } = await import("../integrations/supabase/client");
        // Check redirect
        const { data: redir } = await supabase
          .from("redirects").select("to_path,status_code")
          .eq("from_path", path).eq("enabled", true).maybeSingle();
        if (redir?.to_path) { window.location.replace(redir.to_path); return; }
        // Log 404
        await supabase.from("not_found_log").insert({
          path, referrer: document.referrer || null, user_agent: navigator.userAgent,
        });
      } catch { /* noop */ }
    })();
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-white/60">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <a href="/" className="btn-primary btn-primary-hover">Go home</a>
        </div>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-white/60">Try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-primary btn-primary-hover"
          >Try again</button>
          <a href="/" className="btn-ghost btn-ghost-hover">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: "TruHub Solutions" },
      { name: "theme-color", content: "#030712" },
      { name: "color-scheme", content: "dark" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "TruHub Solutions" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preload", as: "image", href: "/truhub-logo.webp", fetchpriority: "high" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
  rel: "canonical",
  href: "https://truhubsolutions.in",
},
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  scripts: [
  // Organization Schema
  {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",

      name: "TruHub Solutions",
      url: "https://truhubsolutions.in",
      logo: "https://truhubsolutions.in/truhub-logo.webp",

      description:
       "TruHub Solutions provides Website Development, Branding, UI/UX Design, SEO, Digital Marketing, AI Automation and Custom Software Solutions to help startups and businesses grow faster.",

      slogan: "Build. Grow. Succeed.",

      email: "info@truhubsolutions.in",
      telephone: "+91 7989367882",

      founder: {
        "@type": "Person",
        name: "Jayanth Gone",
        jobTitle: "Founder & Chairman",
      },

      sameAs: [
        // Add your official social media URLs here when available
        // "https://www.linkedin.com/company/truhub-solutions",
        // "https://www.instagram.com/truhubsolutions",
        // "https://www.facebook.com/truhubsolutions"
      ],
    }),
  },

  // Founder Schema
  {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",

      name: "Jayanth Gone",
      jobTitle: "Founder & Chairman",

      image: "https://truhubsolutions.in/founder-jayanth.webp",

      url: "https://truhubsolutions.in",

      worksFor: {
        "@type": "Organization",
        name: "TruHub Solutions",
      },
    }),
  },

  // CEO Schema
  {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",

      name: "Bharani Kumar.G",
      jobTitle: "Chief Executive Officer",

      image: "https://truhubsolutions.in/image.png",

      url: "https://truhubsolutions.in",

      worksFor: {
        "@type": "Organization",
        name: "TruHub Solutions",
      },
    }),
  },

  // Website Schema
  {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",

      name: "TruHub Solutions",
      url: "https://truhubsolutions.in",

      potentialAction: {
        "@type": "SearchAction",
        target: "https://truhubsolutions.in/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    }),
  },
],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cleanup = () => {};
    (async () => {
      const { initAnalyticsListeners, trackPageView } = await import("../lib/analytics/track");
      cleanup = initAnalyticsListeners();
      trackPageView();
      const unsub = router.subscribe("onResolved", () => {
        trackPageView();
      });
      const prev = cleanup;
      cleanup = () => { prev(); unsub(); };
    })();
    return () => cleanup();
  }, [router]);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster theme="dark" position="bottom-center" richColors closeButton />
      <CookieConsent />
    </QueryClientProvider>
  );
}
