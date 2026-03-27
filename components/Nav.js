"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut, signIn } from "next-auth/react";

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

function PlayerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults((data.players || []).slice(0, 6));
        setShowResults(true);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowResults(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        className="w-36 lg:w-44 px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-xs text-[var(--text-primary)] outline-none focus:border-gold-dim focus:w-52 transition-all placeholder:text-[var(--text-muted)]"
        placeholder="Search players..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowResults(true)}
      />
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-64 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-2xl z-50 overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => { router.push(`/player/${p.id}`); setShowResults(false); setQuery(""); }}
              className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gold/[0.05] transition-colors border-b border-[var(--border)] last:border-b-0"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-dim/30 to-[var(--bg-card)] flex items-center justify-center font-display text-xs font-bold text-gold-dim border border-[var(--border)]">
                {p.username[0]}
              </div>
              <div>
                <div className="font-condensed text-sm font-semibold">{p.username}</div>
                <div className="font-mono text-[10px] text-[var(--text-muted)]">{p.eloRating} · {p.division}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const linkClass = (href) =>
    `px-3 py-2 font-condensed text-xs font-medium tracking-widest uppercase rounded-md transition-all ${
      pathname === href
        ? "text-gold bg-gold/10"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gold/5"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-bold text-gold tracking-[3px] shrink-0">
          STRATEGY INC
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>{label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <PlayerSearch />
          {session ? (
            <div className="flex items-center gap-2">
              {session.user.isAdmin && (
                <Link href="/admin" className={linkClass("/admin")}>Admin</Link>
              )}
              <Link href={`/player/${session.user.id}`} className="text-xs text-gold font-condensed font-semibold hover:underline">
                {session.user.name}
              </Link>
              <button onClick={() => signOut()} className="px-3 py-1.5 text-xs font-condensed tracking-wider uppercase text-[var(--text-muted)] border border-[var(--border)] rounded-md hover:border-[var(--red)] hover:text-[var(--red)] transition-all">
                Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => signIn("discord")} className="px-4 py-1.5 bg-[#5865F2] text-white font-condensed text-xs font-semibold tracking-widest uppercase rounded-md hover:bg-[#4752C4] transition-all">
                Sign In
              </button>
            </div>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden border border-[var(--border)] text-[var(--text-secondary)] px-2 py-1.5 rounded-md text-lg">
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)]/98 p-4 flex flex-col gap-1 fade-in">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          {session ? (
            <div className="flex items-center gap-2 mt-2">
              <Link href={`/player/${session.user.id}`} onClick={() => setOpen(false)} className="text-sm text-gold font-condensed font-semibold">{session.user.name}</Link>
              <button onClick={() => signOut()} className="px-3 py-1.5 text-xs font-condensed tracking-wider uppercase text-[var(--text-muted)] border border-[var(--border)] rounded-md">Sign Out</button>
            </div>
          ) : (
            <button onClick={() => signIn("discord")} className="mt-2 px-5 py-2 bg-[#5865F2] text-white font-condensed text-sm font-semibold tracking-widest uppercase rounded-md text-center">
              Sign In with Discord
            </button>
          )}
        </div>
      )}
    </nav>
  );
}