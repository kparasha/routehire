"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/",
    label: "Home",
    match: (p: string) => p === "/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/intake",
    label: "Seekers",
    match: (p: string) => p.startsWith("/intake"),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 19.5c1.2-3.2 3.6-4.8 7-4.8s5.8 1.6 7 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/hauler",
    label: "Hiring",
    match: (p: string) => p === "/hauler" || (p.startsWith("/hauler") && !p.startsWith("/hauler/mcp")),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 7h16v12H4V7Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/hauler/mcp",
    label: "MCP",
    match: (p: string) => p.startsWith("/hauler/mcp"),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M8 8h8v8H8V8Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function SiteNav() {
  const pathname = usePathname() || "/";

  return (
    <nav className="top" aria-label="Primary">
      <Link className={`brand${pathname === "/" ? " active" : ""}`} href="/">
        WasteHire
      </Link>
      {links.slice(1).map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "nav-link active" : "nav-link"}
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
