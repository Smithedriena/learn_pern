import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useGame } from "@/context/GameContext";
import { Trophy, Flame, RefreshCw } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Leaderboard() {
  const { nickname } = useGame();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API}/leaderboard`, { params: { limit: 25 } });
      setRows(res.data || []);
    } catch (e) {
      setErr("Couldn't load the leaderboard. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div data-testid="leaderboard-page" className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight flex items-center gap-3">
            <Trophy className="text-[#FFE800]" size={32} /> Global Leaderboard
          </h1>
          <p className="text-white/60 mt-1">Top 25 questers by XP. Complete challenges to climb.</p>
        </div>
        <button data-testid="refresh-leaderboard-btn" onClick={load} className="cq-btn cq-btn-ghost">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="cq-card overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/10 bg-black/40 text-xs font-mono uppercase tracking-widest text-white/50">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Callsign</div>
          <div className="col-span-2 text-right">XP</div>
          <div className="col-span-1 text-right">Lvl</div>
          <div className="col-span-2 text-right">Streak</div>
          <div className="col-span-1 text-right">Badges</div>
        </div>

        {loading && <div className="p-6 text-white/60 font-mono text-sm">Loading rankings…</div>}
        {err && <div className="p-6 text-[#FF003C] font-mono text-sm">{err}</div>}
        {!loading && !err && rows.length === 0 && (
          <div className="p-8 text-center text-white/60">
            <div className="text-3xl mb-2">🕳️</div>
            <div className="font-display font-bold">No entries yet</div>
            <div className="text-sm mt-1">Be the first — complete a challenge to appear here.</div>
          </div>
        )}

        {rows.map((r, i) => {
          const isMe = r.nickname.toLowerCase() === (nickname || "").toLowerCase();
          const rankColor = i === 0 ? "#FFE800" : i === 1 ? "#e5e7eb" : i === 2 ? "#FF7A00" : "rgba(255,255,255,0.4)";
          return (
            <div
              key={r.id + r.nickname}
              data-testid={`leaderboard-row-${i}`}
              className={`grid grid-cols-12 items-center px-5 py-3 border-b border-white/5 text-sm ${
                isMe ? "bg-[#39FF14]/10" : "hover:bg-white/[0.02]"
              }`}
            >
              <div className="col-span-1 font-display font-black text-xl" style={{ color: rankColor }}>{i + 1}</div>
              <div className="col-span-5 font-mono truncate">
                {r.nickname}
                {isMe && <span className="cq-badge ml-2 bg-[#39FF14]/20 border-[#39FF14]/40 text-[#39FF14]">you</span>}
              </div>
              <div className="col-span-2 text-right font-display font-bold text-[#FFE800]">{r.xp}</div>
              <div className="col-span-1 text-right font-mono">{r.level}</div>
              <div className="col-span-2 text-right font-mono flex items-center justify-end gap-1">
                <Flame size={12} className="text-[#FF5722]" /> {r.streak}
              </div>
              <div className="col-span-1 text-right font-mono">{r.badges}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
