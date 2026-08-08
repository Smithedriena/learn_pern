import React from "react";
import { useGame } from "@/context/GameContext";
import { BADGES, CHALLENGES, TRACKS } from "@/data/curriculum";
import { Flame, Trophy } from "lucide-react";

export default function Profile() {
  const { nickname, avatar, xp, level, into, needed, streak, badges, completed, reset } = useGame();
  const pct = Math.min(100, Math.round((into / needed) * 100));

  const perTrack = TRACKS.map((t) => {
    const all = CHALLENGES.filter((c) => c.trackId === t.id);
    const done = all.filter((c) => completed.includes(c.id)).length;
    return { ...t, done, total: all.length };
  });

  return (
    <div data-testid="profile-page" className="space-y-8">
      <div className="cq-card p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="h-24 w-24 rounded-2xl flex items-center justify-center text-5xl bg-black/60 border border-white/10">
          {avatar || "🎮"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="cq-badge mb-2 border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14]">Player</div>
          <h1 className="font-display text-4xl font-black tracking-tight truncate">{nickname || "Guest"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/60 font-mono">
            <span className="text-white">Level {level}</span> ·
            <span className="text-[#FFE800]">{xp} XP</span> ·
            <span className="flex items-center gap-1"><Flame size={13} className="text-[#FF5722]" /> {streak}d streak</span> ·
            <span className="flex items-center gap-1"><Trophy size={13} className="text-[#FFE800]" /> {badges.length} badges</span>
          </div>
          <div className="mt-3 max-w-md">
            <div className="cq-xpbar"><span style={{ width: `${pct}%` }} /></div>
            <div className="mt-1 font-mono text-[11px] text-white/50">{into} / {needed} XP to level {level + 1}</div>
          </div>
        </div>
        <button
          data-testid="reset-progress-btn"
          onClick={() => { if (window.confirm("Wipe all local progress? This can't be undone.")) reset(); }}
          className="cq-btn cq-btn-ghost text-[#FF003C]"
        >
          Reset progress
        </button>
      </div>

      <section>
        <h2 className="font-display text-2xl font-bold mb-4">Track Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {perTrack.map((t) => {
            const pct = Math.round((t.done / t.total) * 100);
            return (
              <div key={t.id} data-testid={`profile-track-${t.id}`} className="cq-card p-4" style={{ borderColor: `${t.color}33` }}>
                <div className="flex items-center justify-between">
                  <div className="font-display font-bold">{t.name}</div>
                  <div className="font-mono text-xs text-white/60">{t.done}/{t.total}</div>
                </div>
                <div className="cq-xpbar mt-2">
                  <span style={{ width: `${pct}%`, background: t.color, boxShadow: `0 0 12px ${t.color}80` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold mb-4">Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BADGES.map((b) => {
            const earned = badges.includes(b.id);
            return (
              <div
                key={b.id}
                data-testid={`badge-${b.id}`}
                className={`cq-card p-4 text-center transition ${earned ? "" : "opacity-40"}`}
                style={earned ? { borderColor: "#FFE800", boxShadow: "0 0 18px rgba(255,232,0,0.25)" } : {}}
              >
                <div className="text-4xl mb-2">{earned ? "🏆" : "🔒"}</div>
                <div className="font-display font-bold text-sm">{b.name}</div>
                <div className="text-white/60 text-xs mt-1">{b.desc}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
