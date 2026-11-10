// Runs after `next build` (see package.json). Adds to the static export in out/:
//   - out/pagefind/            the search index, used by the search box and the Ask AI box
//   - out/llms.txt             an index of every page, for AI tools (llmstxt.org)
//   - out/llms-full.txt        every page as Markdown in one file
// Neither step needs a key or the network.
import { generate } from "static-llms-txt";
import * as pagefind from "pagefind";

const OUT = "out";
const DEMO_KEY = "ot_demo000000000000000000000";

const site = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "")).replace(/\/$/, "");

// 1. Search index
const { index, errors } = await pagefind.createIndex({});
if (!index) throw new Error("Pagefind could not start: " + errors.join(", "));
const added = await index.addDirectory({ path: OUT });
if (added.errors.length) throw new Error("Pagefind: " + added.errors.join(", "));
await index.writeFiles({ outputPath: OUT + "/pagefind" });
await pagefind.close();
console.log(`Pagefind: indexed ${added.page_count} pages into ${OUT}/pagefind/`);

// 2. llms.txt and llms-full.txt
const result = generate(OUT, {
  site: site || undefined,
  content: "article",
  remove: ["[data-pagefind-ignore]", ".page-foot"],
  exclude: ["404/**", "404.html", "_not-found/**"],
  cleanUrls: true,
});
console.log(`llms.txt: ${result.pages.length} pages, wrote ${result.written.join(", ") || "nothing"}${result.skipped?.length ? ", skipped " + result.skipped.join(", ") : ""}`);
if (!site) console.log("llms.txt: links are relative. Set NEXT_PUBLIC_SITE_URL to make them absolute (Vercel does this for you).");

// 3. One warning when there is no key
const key = process.env.NEXT_PUBLIC_ONETAG_KEY;
if (!key || key === DEMO_KEY) {
  console.warn(
    [
      "",
      "[nextjs-ai-docs] No NEXT_PUBLIC_ONETAG_KEY set. The Ask AI box uses the demo key, which only answers on localhost.",
      "Get a free key (public by design, 1,000,000 tokens a month, hard cap, no bill) and set NEXT_PUBLIC_ONETAG_KEY:",
      '  curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d \'{"email":"you@example.com"}\'',
      "",
    ].join("\n"),
  );
}
