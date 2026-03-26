// components/Nav.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Rankings" },
  { href: "/matches", label: "Matches" },
  { href: "/tierlist", label: "Tier List" },
  { href: "/stats", label: "Stats" },
  { href: "/blog", label: "Blog" },
  { href: "/league", label: "League" },
  { href: "/rules", label: "Rules" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const linkClass = (href) =>
    `px-4 py-2 font-condensed text-sm font-medium tracking-widest uppercase rounded-md transition-all ${
      pathname === href
        ? "text-gold bg-gold/10"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gold/5"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-lg font-bold text-gold tracking-[3px] flex items-center gap-3"
        >
          CIV VI LEAGUE
          <span className="text-[10px] text-[var(--text-muted)] font-condensed tracking-[4px] uppercase">
            Competitive
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}

          {session ? (
            <div className="flex items-center gap-2 ml-4">
              {session.user.isAdmin && (
                <Link href="/admin" className={linkClass("/admin")}>
                  Admin
                </Link>
              )}
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 text-xs font-condensed tracking-wider uppercase text-[var(--text-muted)] border border-[var(--border)] rounded-md hover:border-[var(--red)] hover:text-[var(--red)] transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <a
              href="https://discord.gg/WtNeHbXbjj"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 px-5 py-2 bg-[#5865F2] text-white font-condensed text-sm font-semibold tracking-widest uppercase rounded-md hover:bg-[#4752C4] transition-all"
            >
              Discord
            </a>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden border border-[var(--border)] text-[var(--text-secondary)] px-2 py-1.5 rounded-md text-lg"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)]/98 p-4 flex flex-col gap-1 fade-in">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(href)}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://discord.gg/WtNeHbXbjj"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 px-5 py-2 bg-[#5865F2] text-white font-condensed text-sm font-semibold tracking-widest uppercase rounded-md text-center"
            onClick={() => setOpen(false)}
          >
            Discord
          </a>
        </div>
      )}
    </nav>
  );
}
