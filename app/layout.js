// app/layout.js
// ─── ROOT LAYOUT ────────────────────────────────────────────────────────────
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "Civ VI League — Competitive Civilization VI",
  description:
    "The premier competitive Civilization VI league. Ranked divisions, ELO matchmaking, seasonal tournaments, and a thriving strategy community.",
  openGraph: {
    title: "Civ VI League",
    description: "Build your empire. Prove your dominance.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          {/* Hex pattern background */}
          <svg
            className="fixed inset-0 w-full h-full z-0 opacity-[0.03] pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="hex"
                width="56"
                height="100"
                patternUnits="userSpaceOnUse"
                patternTransform="scale(2)"
              >
                <path
                  d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
                  fill="none"
                  stroke="#C5A44E"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>

          <Nav />
          <main className="relative z-10 min-h-[70vh]">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
