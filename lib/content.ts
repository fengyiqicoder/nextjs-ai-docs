import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const ROOT = path.join(process.cwd(), "content");

export interface Doc {
  slug: string[];           // [] for the home page
  href: string;             // "/" or "/guides/search/"
  file: string;             // path relative to the repo, for "Edit this page"
  title: string;
  description: string;
  section: string;
  order: number;
  body: string;             // MDX without front matter
}

export interface Heading {
  depth: 2 | 3;
  text: string;
  id: string;
}

// Sections appear in the sidebar in this order. Pages name their section in front matter.
export const SECTIONS = ["Start here", "Writing", "Features", "Ship it"];

let cache: Doc[] | null = null;

export function allDocs(): Doc[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const docs = walk(ROOT).map(readDoc);
  docs.sort((a, b) => sectionRank(a.section) - sectionRank(b.section) || a.order - b.order || a.title.localeCompare(b.title));
  cache = docs;
  return docs;
}

export function findDoc(slug: string[] = []): Doc | undefined {
  const key = slug.join("/");
  return allDocs().find((d) => d.slug.join("/") === key);
}

export function sidebar(): { section: string; docs: Doc[] }[] {
  const docs = allDocs();
  const names = [...SECTIONS, ...new Set(docs.map((d) => d.section).filter((s) => !SECTIONS.includes(s)))];
  return names.map((section) => ({ section, docs: docs.filter((d) => d.section === section) })).filter((g) => g.docs.length);
}

export function neighbours(doc: Doc): { prev?: Doc; next?: Doc } {
  const docs = allDocs();
  const i = docs.findIndex((d) => d.href === doc.href);
  return { prev: docs[i - 1], next: docs[i + 1] };
}

// Same ids as rehype-slug gives the rendered headings.
export function headings(body: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_]/g, "");
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return out;
}

function sectionRank(section: string): number {
  const i = SECTIONS.indexOf(section);
  return i === -1 ? SECTIONS.length : i;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.mdx?$/.test(entry.name) ? [full] : [];
  });
}

function readDoc(file: string): Doc {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const rel = path.relative(ROOT, file).replace(/\\/g, "/").replace(/\.mdx?$/, "");
  const parts = rel.split("/");
  if (parts[parts.length - 1] === "index") parts.pop();
  const title = String(data.title || parts[parts.length - 1] || "Home");
  return {
    slug: parts,
    href: parts.length ? "/" + parts.join("/") + "/" : "/",
    file: "content/" + path.relative(ROOT, file).replace(/\\/g, "/"),
    title,
    description: String(data.description || ""),
    section: String(data.section || "Start here"),
    order: Number(data.order ?? 100),
    body: content,
  };
}
