import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Search } from "@/components/search";
import { ThemeToggle, themeScript } from "@/components/theme-toggle";
import { sidebar } from "@/lib/content";
import { askAi, site } from "@/lib/site";
import "./globals.css";

const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body", display: "swap" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: site.url ? new URL(site.url) : undefined,
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { types: { "text/plain": "/llms.txt" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9eef3" },
    { media: "(prefers-color-scheme: dark)", color: "#121a2b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const groups = sidebar().map((g) => ({ section: g.section, links: g.docs.map((d) => ({ href: d.href, title: d.title })) }));
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <header className="top">
          <Link href="/" className="wordmark">
            {site.name}
          </Link>
          <div className="top-tools">
            <Search />
            <button type="button" className="ask-button" data-ask-ai aria-label={askAi.label}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-5 4v-4h.5A2.5 2.5 0 0 1 4 13.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span>{askAi.label}</span>
            </button>
            <ThemeToggle />
          </div>
        </header>
        <div className="frame">
          <details className="menu">
            <summary>Menu</summary>
            <Nav groups={groups} />
          </details>
          <aside className="sidebar">
            <Nav groups={groups} />
          </aside>
          {children}
        </div>
        {/* The Ask AI box. It answers from this site's Pagefind index, built by scripts/postbuild.mjs. */}
        <Script
          src="https://onetagai.com/ask-docs.js"
          strategy="afterInteractive"
          data-key={askAi.key}
          data-ref={askAi.ref}
          data-label={askAi.label}
          data-position="none"
          data-button="[data-ask-ai]"
        />
      </body>
    </html>
  );
}
