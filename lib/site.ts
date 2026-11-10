// Edit this file to make the template yours.
export const site = {
  name: "Fieldbook",
  description: "A docs site you can read, search and ask questions of. Built with Next.js and MDX.",
  // Used for absolute links in llms.txt. Set NEXT_PUBLIC_SITE_URL, or Vercel fills it in.
  url: siteUrl(),
  // "Edit this page" links point here. Remove it to hide them.
  repo: "https://github.com/fengyiqicoder/nextjs-ai-docs",
  branch: "main",
};

// The Ask AI box. See content/guides/ask-ai.mdx.
export const DEMO_KEY = "ot_demo000000000000000000000";
export const askAi = {
  key: process.env.NEXT_PUBLIC_ONETAG_KEY || DEMO_KEY,
  ref: "nextjs-ai-docs",
  label: "Ask the docs",
};

function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return "https://" + vercel;
  return "";
}
