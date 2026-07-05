import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function LegalLayout({
  title,
  updated,
  children,
  email = "truhub.solutions@gmail.com",
  phone = "+91 7989367882",
}: {
  title: string;
  updated: string;
  children: ReactNode;
  email?: string;
  phone?: string;
}) {
  return (
    <div className="relative min-h-screen bg-background text-white">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container-x mx-auto max-w-3xl">
          <header className="mb-10 border-b border-white/10 pb-8">
            <div className="mb-3 inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#38BDF8]">
              Legal
            </div>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              <span className="text-gradient">{title}</span>
            </h1>
            <p className="mt-3 text-sm text-white/50">Last updated: {updated}</p>
          </header>
          <article className="prose-legal space-y-6 text-white/75 leading-relaxed">
            {children}
          </article>
        </div>
      </main>
      <Footer email={email} phone={phone} />
    </div>
  );
}
