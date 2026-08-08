import React from "react";
import { Link } from "react-router-dom";
import { TRACKS } from "@/data/curriculum";
import { useGame } from "@/context/GameContext";
import { Trophy, Zap, Sparkles, Rocket, Flame, Bot } from "lucide-react";

const HERO_BG =
  "https://images.unsplash.com/photo-1725785023594-ced2636e7717?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGRpZ2l0YWwlMjBuZW9uJTIwM2R8ZW58MHx8fHwxNzg2MTQ4MDExfDA&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  const { nickname, xp, level, badges, streak } = useGame();

  return (
    <div data-testid="landing-page" className="space-y-14">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10">
        <img
          src={HERO_BG}
          alt="neon"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/60 to-transparent" />
        <div className="relative px-8 py-16 md:px-14 md:py-24 max-w-3xl">
          <div className="cq-badge mb-4 border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14]">
            <span className="cq-dot bg-[#39FF14]" /> INTERACTIVE · GAMIFIED · IDE
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
            Learn <span className="neon-green">React</span>, <span className="neon-cyan">TypeScript</span>,
            <br />
            <span className="neon-yellow">Node.js</span> & <span className="neon-red">PostgreSQL</span>
            <br />
            like a game.
          </h1>
          <p className="mt-5 text-white/70 text-lg max-w-xl leading-relaxed">
            Level up through hands-on challenges in a real in-browser IDE. Earn XP, unlock badges,
            keep your streak alive, and get instant hints from ARC — your AI mentor.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link data-testid="cta-start" to="/learn" className="cq-btn cq-btn-primary">
              <Rocket size={16} /> {xp > 0 ? "Continue Quest" : "Start Quest"}
            </Link>
            <Link data-testid="cta-sandbox" to="/sandbox" className="cq-btn cq-btn-ghost">
              <Zap size={16} /> Free-play Sandbox
            </Link>
            <Link data-testid="cta-leaderboard" to="/leaderboard" className="cq-btn cq-btn-ghost">
              <Trophy size={16} /> Leaderboard
            </Link>
          </div>

          {nickname && (
            <div className="mt-6 inline-flex items-center gap-3 text-sm text-white/60 font-mono">
              <span>welcome back, <span className="text-white">{nickname}</span></span>
              <span>·</span>
              <span>lvl {level}</span>
              <span>·</span>
              <span>{xp} xp</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Flame size={12} className="text-[#FF5722]" />{streak}d</span>
              <span>·</span>
              <span>{badges.length} 🏆</span>
            </div>
          )}
        </div>
      </section>

      {/* TRACKS */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight">
            Pick your <span className="neon-cyan">track</span>
          </h2>
          <div className="text-xs font-mono text-white/50 hidden md:block">4 tracks · 20 challenges · unlimited replays</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRACKS.map((t) => (
            <Link
              key={t.id}
              data-testid={`track-card-${t.id}`}
              to={`/learn/${t.id}`}
              className="cq-card p-5 hover:-translate-y-1 transition-transform group"
              style={{ borderColor: `${t.color}40` }}
            >
              <div
                className="h-10 w-10 rounded-md mb-4 flex items-center justify-center font-display font-black"
                style={{ backgroundColor: t.color, color: "#050505" }}
              >
                {t.name[0]}
              </div>
              <div className="cq-badge mb-2" style={{ color: t.color, borderColor: `${t.color}55` }}>
                {t.tag}
              </div>
              <h3 className="font-display text-xl font-bold">{t.name}</h3>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">{t.blurb}</p>
              <div className="mt-4 text-xs font-mono text-white/40 group-hover:text-white transition-colors">
                Enter →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cq-card p-6 md:col-span-2">
          <Sparkles className="text-[#FFE800] mb-3" />
          <h3 className="font-display text-2xl font-bold">Real in-browser IDE</h3>
          <p className="text-white/60 mt-2">
            Monaco editor with syntax highlighting, live console output, and instant test grading.
            No installs, no setup — just code and ship.
          </p>
        </div>
        <div className="cq-card p-6">
          <Bot className="text-[#00F0FF] mb-3" />
          <h3 className="font-display text-xl font-bold">ARC Mentor</h3>
          <p className="text-white/60 text-sm mt-2">
            AI hints powered by Claude — always one tap away.
          </p>
        </div>
        <div className="cq-card p-6">
          <Flame className="text-[#FF5722] mb-3" />
          <h3 className="font-display text-xl font-bold">Streaks</h3>
          <p className="text-white/60 text-sm mt-2">
            Come back daily. Keep the fire burning. Miss a day, streak resets.
          </p>
        </div>
        <div className="cq-card p-6 md:col-span-2">
          <Trophy className="text-[#39FF14] mb-3" />
          <h3 className="font-display text-2xl font-bold">Climb the global leaderboard</h3>
          <p className="text-white/60 mt-2">
            Every challenge earns XP. Rise through the ranks. Unlock badges as you go.
          </p>
        </div>
      </section>
    </div>
  );
}
