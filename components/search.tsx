"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

interface Result {
  url: string;
  title: string;
  excerpt: string;
}

interface Pagefind {
  search: (q: string) => Promise<{ results: { data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }> }[] }>;
}

let loading: Promise<Pagefind | null> | null = null;

// Pagefind writes its index to out/pagefind/ after `next build`, so it is loaded from the
// built site at run time, not bundled. In `next dev` it does not exist yet.
function loadPagefind(): Promise<Pagefind | null> {
  if (!loading) {
    const url = "/pagefind/pagefind.js";
    loading = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url).catch(() => null);
  }
  return loading;
}

export function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  // "/" focuses the search box, like most docs sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "/" && !(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    let stale = false;
    const timer = setTimeout(async () => {
      const pf = await loadPagefind();
      if (stale) return;
      if (!pf) {
        setMissing(true);
        return;
      }
      const found = await pf.search(q);
      const data = await Promise.all(found.results.slice(0, 8).map((r) => r.data()));
      if (!stale) setResults(data.map((d) => ({ url: d.url, title: d.meta.title || d.url, excerpt: d.excerpt })));
    }, 120);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="search" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <label className="sr-only" htmlFor={listId + "-input"}>
        Search the docs
      </label>
      <input
        ref={input}
        id={listId + "-input"}
        type="search"
        placeholder="Search"
        autoComplete="off"
        value={query}
        aria-controls={open && query.trim() ? listId : undefined}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />
      <kbd aria-hidden="true">/</kbd>
      {open && query.trim() && (
        <div className="search-results" id={listId} role="region" aria-live="polite">
          {missing && <p className="search-empty">Search works on the built site. Run npm run build, then npm start.</p>}
          {results && results.length === 0 && (
            <p className="search-empty">
              Nothing matches. Try fewer words, or{" "}
              <button type="button" className="linkish" data-ask-ai>
                ask the docs
              </button>
              .
            </p>
          )}
          {results && results.length > 0 && (
            <ul>
              {results.map((r) => (
                <li key={r.url}>
                  <Link href={r.url} onClick={() => setOpen(false)}>
                    <span className="result-title">{r.title}</span>
                    <span className="result-excerpt" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
