import Link from "next/link";

export default function NotFound() {
  return (
    <main id="content" className="page">
      <article>
        <h1>This page is not in the docs</h1>
        <p className="lede">The address may be old, or the page was moved.</p>
        <div className="prose">
          <p>
            Search with the box at the top, <button type="button" className="linkish" data-ask-ai>ask the docs</button>, or go back to the{" "}
            <Link href="/">start page</Link>.
          </p>
        </div>
      </article>
    </main>
  );
}
