// app/matches/MatchesClient.js
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function MatchesClient({ matches }) {
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    if (tab === "all") return matches;
    return matches.filter((m) => m.status === tab);
  }, [matches, tab]);

  const counts = {
    all: matches.length,
    completed: matches.filter((m) => m.status === "completed").length,
  };

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-1">Matches</h1>
      <div className="w-10 h-0.5 bg-gold mb-8" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {[
          ["all", "All"],
          ["completed", "Completed"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-5 py-2.5 font-condensed text-xs font-medium tracking-wider uppercase rounded-md border transition-all ${
              tab === k
                ? "text-gold bg-gold/[0.08] border-gold/20"
                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
            }`}
          >
            {l} ({counts[k]})
          </button>
        ))}
      </div>

      {/* Match List */}
      <div className="space-y-3">
        {filtered.map((m) => {
          const isFFA = m.players && m.players.length > 0;

          if (isFFA) {
            return (
              <div
                key={m.id}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:border-[var(--border-bright)] transition-colors overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <span className="font-condensed text-xs font-semibold tracking-wider uppercase text-gold">
                    FFA · {m.players.length} Players
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {fmt(m.completedAt || m.scheduledAt)}
                  </span>
                </div>

                {/* Placement list */}
                <div className="px-5 pb-4 space-y-1.5">
                  {m.players.map((mp, idx) => {
                    const isWinner = mp.placement === 1;
                    const gain = mp.ratingGain ?? 0;
                    return (
                      <div
                        key={mp.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                          isWinner
                            ? "bg-gold/[0.06] border border-gold/15"
                            : "bg-[var(--bg-secondary)]/50"
                        }`}
                      >
                        {/* Placement */}
                        <span
                          className="font-display text-sm font-bold w-6 text-center"
                          style={{
                            color: isWinner ? "var(--gold)" : "var(--text-muted)",
                          }}
                        >
                          {mp.placement}
                        </span>

                        {/* Player name */}
                        <Link
                          href={`/player/${mp.player.id}`}
                          className="font-condensed text-sm font-semibold hover:text-gold transition-colors flex-1"
                        >
                          {mp.player.username}
                          {isWinner && (
                            <span className="ml-2 text-[10px] text-gold font-semibold tracking-wider uppercase">
                              👑
                            </span>
                          )}
                        </Link>

                        {/* Leader/Civ */}
                        {mp.leader && (
                          <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                            {mp.leader}
                          </span>
                        )}

                        {/* Rating change */}
                        <span
                          className={`font-mono text-xs font-semibold ${
                            gain > 0
                              ? "text-[var(--green)]"
                              : gain < 0
                              ? "text-[var(--red)]"
                              : "text-[var(--text-muted)]"
                          }`}
                        >
                          {gain > 0 ? "+" : ""}
                          {gain}
                        </span>

                        {/* Rating after */}
                        <span className="font-mono text-xs text-[var(--text-muted)] w-12 text-right">
                          {mp.ratingAfter}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Legacy 1v1 display (old matches before FFA migration)
          const p1Won = m.result?.startsWith("1");
          const isDraw = m.result === "draw";
          return (
            <div
              key={m.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:border-[var(--border-bright)] transition-colors overflow-hidden"
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-5 md:gap-8">
                {/* Player 1 */}
                <div className="flex flex-col gap-1">
                  {m.player1 ? (
                    <Link
                      href={`/player/${m.player1.id}`}
                      className="font-condensed text-base font-semibold hover:text-gold transition-colors"
                    >
                      {m.player1.username}
                    </Link>
                  ) : (
                    <span className="text-[var(--text-muted)]">Unknown</span>
                  )}
                  <span className="text-xs text-[var(--text-muted)]">
                    {m.player1Civ || "TBD"}
                  </span>
                  {m.status === "completed" && (
                    <span
                      className={`font-mono text-xs ${
                        p1Won
                          ? "text-[var(--green)]"
                          : isDraw
                          ? "text-[var(--text-muted)]"
                          : "text-[var(--red)]"
                      }`}
                    >
                      {p1Won ? "Winner" : isDraw ? "Draw" : "Defeat"}
                    </span>
                  )}
                </div>

                {/* Center */}
                <div className="flex flex-col items-center gap-1">
                  {m.status === "completed" ? (
                    <span className="font-display text-xl font-bold text-gold">
                      {isDraw ? "½–½" : m.result}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[11px] font-condensed font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20">
                      {m.status}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {fmt(m.scheduledAt)}
                  </span>
                </div>

                {/* Player 2 */}
                <div className="flex flex-col gap-1 items-end text-right">
                  {m.player2 ? (
                    <Link
                      href={`/player/${m.player2.id}`}
                      className="font-condensed text-base font-semibold hover:text-gold transition-colors"
                    >
                      {m.player2.username}
                    </Link>
                  ) : (
                    <span className="text-[var(--text-muted)]">Unknown</span>
                  )}
                  <span className="text-xs text-[var(--text-muted)]">
                    {m.player2Civ || "TBD"}
                  </span>
                  {m.status === "completed" && (
                    <span
                      className={`font-mono text-xs ${
                        !p1Won && !isDraw
                          ? "text-[var(--green)]"
                          : isDraw
                          ? "text-[var(--text-muted)]"
                          : "text-[var(--red)]"
                      }`}
                    >
                      {!p1Won && !isDraw ? "Winner" : isDraw ? "Draw" : "Defeat"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            No matches found for this filter.
          </div>
        )}
      </div>
    </section>
  );
}