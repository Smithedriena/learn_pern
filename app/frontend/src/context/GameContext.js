import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { BADGES, CHALLENGES, levelFromXp } from "@/data/curriculum";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_KEY = "codequest.progress.v1";

const defaultState = {
  nickname: "",
  xp: 0,
  completed: [], // challenge ids
  badges: [], // badge ids
  streak: 0,
  lastActive: null, // yyyy-mm-dd
  avatar: "🎮",
};

const GameCtx = createContext(null);

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export function GameProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultState, ...JSON.parse(raw) };
    } catch {}
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const derived = useMemo(() => {
    const lvl = levelFromXp(state.xp);
    return { ...lvl };
  }, [state.xp]);

  const syncLeaderboard = useCallback(async (s) => {
    if (!s.nickname) return;
    try {
      await axios.post(`${API}/leaderboard/submit`, {
        nickname: s.nickname,
        xp: s.xp,
        level: levelFromXp(s.xp).level,
        streak: s.streak,
        badges: s.badges.length,
      });
    } catch (e) {
      // silent fail
    }
  }, []);

  const setNickname = useCallback((nickname, avatar) => {
    setState((s) => {
      const next = { ...s, nickname: nickname.slice(0, 24), avatar: avatar || s.avatar };
      syncLeaderboard(next);
      return next;
    });
  }, [syncLeaderboard]);

  const touchStreak = useCallback(() => {
    setState((s) => {
      const t = today();
      if (s.lastActive === t) return s;
      let streak = s.streak;
      if (s.lastActive === yesterday()) streak = s.streak + 1;
      else streak = 1;
      const next = { ...s, streak, lastActive: t };
      return next;
    });
  }, []);

  const checkBadges = useCallback((s) => {
    const lvl = levelFromXp(s.xp).level;
    const context = { ...s, level: lvl };
    const newlyEarned = [];
    for (const b of BADGES) {
      if (!s.badges.includes(b.id) && b.condition(context)) {
        newlyEarned.push(b);
      }
    }
    return newlyEarned;
  }, []);

  const completeChallenge = useCallback((challengeId) => {
    setState((s) => {
      if (s.completed.includes(challengeId)) return s;
      const ch = CHALLENGES.find((c) => c.id === challengeId);
      if (!ch) return s;

      const t = today();
      let streak = s.streak;
      if (s.lastActive === t) streak = Math.max(1, s.streak);
      else if (s.lastActive === yesterday()) streak = s.streak + 1;
      else streak = 1;

      const prevLevel = levelFromXp(s.xp).level;
      const nextXp = s.xp + ch.xp;
      const nextLevel = levelFromXp(nextXp).level;

      const draft = {
        ...s,
        xp: nextXp,
        completed: [...s.completed, challengeId],
        streak,
        lastActive: t,
      };
      const newBadges = checkBadges(draft);
      const finalBadges = [...s.badges, ...newBadges.map((b) => b.id)];
      const next = { ...draft, badges: finalBadges };

      // side-effects
      toast.success(`+${ch.xp} XP · ${ch.title}`, { description: "Nice run! Progress saved." });
      newBadges.forEach((b) => toast(`🏆 Badge unlocked: ${b.name}`, { description: b.desc }));
      if (nextLevel > prevLevel) {
        setTimeout(() => {
          toast(`⚡ LEVEL UP! You reached Level ${nextLevel}`, {
            description: "New arenas within reach.",
          });
          try {
            import("canvas-confetti").then(({ default: confetti }) => {
              confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors: ["#39FF14", "#00F0FF", "#FFE800", "#FF003C"] });
            });
          } catch {}
        }, 200);
      }

      syncLeaderboard(next);
      return next;
    });
  }, [checkBadges, syncLeaderboard]);

  const reset = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    ...state,
    ...derived,
    setNickname,
    completeChallenge,
    touchStreak,
    reset,
  };

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

