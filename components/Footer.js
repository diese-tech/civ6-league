// components/Footer.js
export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border)] mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-display text-sm text-gold mb-1">CIV VI LEAGUE</div>
          <div className="text-xs text-[var(--text-muted)]">
            The premier competitive Civilization VI community.
          </div>
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Civ VI League · All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
