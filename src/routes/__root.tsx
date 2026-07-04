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

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const SITE_TITLE = "TruHub Solutions — Build. Grow. Succeed.";
const SITE_DESC =
  "TruHub Solutions is a luxury tech agency crafting premium websites, branding, AI automation and digital solutions for ambitious brands.";
const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c71bd585-7f02-4fa8-b82d-d88c06e7398a";

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
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
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
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "TruHub Solutions",
          description: SITE_DESC,
          slogan: "Build. Grow. Succeed.",
          email: "truhub.solutions@gmail.com",
          telephone: "+91 7989367882",
          founder: { "@type": "Person", name: "Jayanth Gone", jobTitle: "Founder & Chairman" },
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
    </QueryClientProvider>
  );
}
