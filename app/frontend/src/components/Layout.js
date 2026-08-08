import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Flame, Trophy, User, Home, Sparkles, Zap } from "lucide-react";

export default function Layout({ children }) {
  const { nickname, xp, level, into, needed, streak, badges, avatar } = useGame();
  const navigate = useNavigate();
  const pct = useMemo(() => Math.min(100, Math.round((into / needed) * 100)), [into, needed]);

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition ${
      isActive
        ? "bg-white text-black"
        : "text-white/70 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="App relative z-0">
      <header
        data-testid="top-hud"
        className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-5 py-3 flex items-center gap-4">
          <button
            data-testid="brand-home-btn"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#39FF14] text-black font-black">
              CQ
            </span>
            <span className="font-display text-lg font-bold tracking-tight group-hover:text-[#39FF14] transition-colors">
              CodeQuest
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            <NavLink data-testid="nav-home" to="/" end className={linkClass}><Home size={12} className="inline mr-1"/>Home</NavLink>
            <NavLink data-testid="nav-learn" to="/learn" className={linkClass}><Sparkles size={12} className="inline mr-1"/>Tracks</NavLink>
            <NavLink data-testid="nav-sandbox" to="/sandbox" className={linkClass}><Zap size={12} className="inline mr-1"/>Sandbox</NavLink>
            <NavLink data-testid="nav-leaderboard" to="/leaderboard" className={linkClass}><Trophy size={12} className="inline mr-1"/>Leaderboard</NavLink>
            <NavLink data-testid="nav-profile" to="/profile" className={linkClass}><User size={12} className="inline mr-1"/>Profile</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div
              data-testid="hud-streak"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5"
              title={`${streak}-day streak`}
            >
              <Flame size={14} className="text-[#FF5722]" />
              <span className="font-mono text-xs">{streak}</span>
            </div>

            <div
              data-testid="hud-level"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"
            >
              <span className="font-display text-xs text-white/60">LVL</span>
              <span className="font-display text-sm font-bold">{level}</span>
              <div className="cq-xpbar w-24"><span style={{ width: `${pct}%` }} /></div>
              <span className="font-mono text-[10px] text-white/60">{into}/{needed}</span>
            </div>

            <div
              data-testid="hud-xp"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#FFE800]/30 bg-[#FFE800]/10"
            >
              <span className="font-display text-xs text-[#FFE800]">XP</span>
              <span className="font-mono text-xs">{xp}</span>
            </div>

            <button
              data-testid="hud-profile-btn"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
              title={nickname || "Guest"}
            >
              <span className="text-lg">{avatar || "🎮"}</span>
              <span className="hidden md:inline font-mono text-xs max-w-[110px] truncate">
                {nickname || "guest"}
              </span>
              <span className="hidden md:inline font-mono text-[10px] text-white/50">·{badges.length}🏆</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        {children}
      </main>

      <footer className="relative z-10 mx-auto max-w-7xl px-5 py-10 text-center text-xs text-white/40 font-mono">
        <span className="cq-dot bg-[#39FF14] mr-2 align-middle"/> ARC Mentor online · Progress saved locally · v0.1
      </footer>
    </div>
  );
}
