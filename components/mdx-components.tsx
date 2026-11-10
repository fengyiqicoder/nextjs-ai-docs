import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

function A({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} {...props} />;
  return <a href={href} target="_blank" rel="noreferrer" {...props} />;
}

// <Note> in MDX: a margin note for things worth knowing but not part of the main path.
function Note({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="note">
      {title && <p className="note-title">{title}</p>}
      {children}
    </aside>
  );
}

// <Steps> in MDX: an ordered list drawn as a sequence of steps.
function Steps({ children }: { children: ReactNode }) {
  return <div className="steps">{children}</div>;
}

export const mdxComponents = { a: A, Note, Steps };
