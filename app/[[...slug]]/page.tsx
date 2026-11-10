import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allDocs, findDoc, headings, neighbours } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { site } from "@/lib/site";

type Params = { slug?: string[] };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return allDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const doc = findDoc((await params).slug);
  if (!doc) return {};
  return {
    title: doc.slug.length ? doc.title : { absolute: site.name },
    description: doc.description || site.description,
    alternates: site.url ? { canonical: doc.href } : undefined,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const doc = findDoc((await params).slug);
  if (!doc) notFound();
  const toc = headings(doc.body);
  const { prev, next } = neighbours(doc);
  const content = await renderMdx(doc.body);

  return (
    <>
      <main id="content" className="page">
        <article data-pagefind-body>
          <p className="crumb" data-pagefind-ignore>
            {doc.section}
          </p>
          <h1>{doc.title}</h1>
          {doc.description && <p className="lede">{doc.description}</p>}
          <div className="prose">{content}</div>
        </article>
        <footer className="page-foot">
          <p className="foot-ask">
            Still stuck?{" "}
            <button type="button" className="linkish" data-ask-ai>
              Ask the docs a question
            </button>{" "}
            and get an answer with links to the pages it used.
          </p>
          <nav className="pager" aria-label="Previous and next page">
            {prev ? (
              <Link href={prev.href} rel="prev">
                <span>Previous</span>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={next.href} rel="next" className="pager-next">
                <span>Next</span>
                {next.title}
              </Link>
            )}
          </nav>
          {site.repo && (
            <a className="edit" href={`${site.repo}/edit/${site.branch}/${doc.file}`} target="_blank" rel="noreferrer">
              Edit this page on GitHub
            </a>
          )}
        </footer>
      </main>
      <aside className="toc" aria-label="On this page">
        {toc.length > 1 && (
          <>
            <p className="toc-title">On this page</p>
            <ul>
              {toc.map((h) => (
                <li key={h.id} className={h.depth === 3 ? "toc-sub" : undefined}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </>
  );
}
