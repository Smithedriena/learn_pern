import React from "react";
import { Link } from "react-router-dom";
import { CHALLENGES, TRACKS } from "@/data/curriculum";
import { useGame } from "@/context/GameContext";

export default function Dashboard() {
  const { completed } = useGame();

  return (
    <div data-testid="dashboard-page" className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-black tracking-tight">Skill Tracks</h1>
        <p className="text-white/60 mt-1">Choose a discipline. Every challenge you clear earns XP + progresses your badge tree.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TRACKS.map((t) => {
          const tChallenges = CHALLENGES.filter((c) => c.trackId === t.id);
          const done = tChallenges.filter((c) => completed.includes(c.id)).length;
          const pct = Math.round((done / tChallenges.length) * 100);

          return (
            <div
              key={t.id}
              data-testid={`dashboard-track-${t.id}`}
              className="cq-card p-6"
              style={{ borderColor: `${t.color}33` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-md flex items-center justify-center font-display font-black"
                    style={{ backgroundColor: t.color, color: "#050505" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="cq-badge" style={{ color: t.color, borderColor: `${t.color}55` }}>
                      {t.tag}
                    </div>
                    <div className="font-display text-2xl font-bold mt-1">{t.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-white/60">{done}/{tChallenges.length}</div>
                  <div className="font-display text-lg font-bold" style={{ color: t.color }}>{pct}%</div>
                </div>
              </div>

              <div className="cq-xpbar mt-4">
                <span style={{ width: `${pct}%`, background: t.color, boxShadow: `0 0 12px ${t.color}80` }} />
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2">
                {tChallenges.map((c, i) => {
                  const isDone = completed.includes(c.id);
                  return (
                    <Link
                      key={c.id}
                      data-testid={`dashboard-node-${c.id}`}
                      to={`/challenge/${c.id}`}
                      title={c.title}
                      className={`h-11 rounded-md border flex items-center justify-center font-mono text-xs transition ${
                        isDone
                          ? "text-black font-bold"
                          : "text-white/60 hover:text-white bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      style={isDone ? { background: t.color, borderColor: t.color, boxShadow: `0 0 14px ${t.color}80` } : {}}
                    >
                      {isDone ? "✓" : i + 1}
                    </Link>
                  );
                })}
              </div>

              <Link
                data-testid={`dashboard-enter-${t.id}`}
                to={`/learn/${t.id}`}
                className="cq-btn cq-btn-ghost mt-5"
                style={{ borderColor: `${t.color}66`, color: t.color }}
              >
                Enter {t.name} →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
