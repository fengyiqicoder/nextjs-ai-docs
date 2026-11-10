"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavGroup {
  section: string;
  links: { href: string; title: string }[];
}

export function Nav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const current = pathname.endsWith("/") ? pathname : pathname + "/";
  return (
    <nav aria-label="Documentation">
      {groups.map((group) => (
        <div className="nav-group" key={group.section}>
          <p className="nav-section">{group.section}</p>
          <ul>
            {group.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={link.href === current ? "page" : undefined}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
