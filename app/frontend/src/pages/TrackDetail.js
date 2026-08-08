import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { CHALLENGES, TRACKS } from "@/data/curriculum";
import { useGame } from "@/context/GameContext";
import { Code2, HelpCircle, Database, Lock } from "lucide-react";

const kindIcon = (k) => {
  if (k === "quiz") return <HelpCircle size={14} />;
  if (k === "sql") return <Database size={14} />;
  return <Code2 size={14} />;
};

export default function TrackDetail() {
  const { trackId } = useParams();
  const track = TRACKS.find((t) => t.id === trackId);
  const { completed } = useGame();

  if (!track) return <Navigate to="/learn" replace />;
  const list = CHALLENGES.filter((c) => c.trackId === trackId);

  return (
    <div data-testid={`track-page-${trackId}`} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="cq-badge" style={{ color: track.color, borderColor: `${track.color}66` }}>
            {track.tag}
          </div>
          <h1 className="font-display text-4xl font-black mt-2">{track.name} <span style={{color: track.color}}>Path</span></h1>
          <p className="text-white/60 mt-1">{track.blurb}</p>
        </div>
        <Link data-testid="track-sandbox-link" to={`/sandbox/${track.id}`} className="cq-btn cq-btn-ghost" style={{ borderColor: `${track.color}66`, color: track.color }}>
          Free-play Sandbox →
        </Link>
      </div>

      <div className="space-y-3">
        {list.map((c, i) => {
          const done = completed.includes(c.id);
          const prev = i === 0 || completed.includes(list[i - 1].id);
          return (
            <Link
              key={c.id}
              data-testid={`challenge-row-${c.id}`}
              to={prev ? `/challenge/${c.id}` : "#"}
              onClick={(e) => { if (!prev) e.preventDefault(); }}
              className={`cq-card p-4 flex items-center gap-4 group transition ${
                prev ? "hover:-translate-y-0.5 hover:border-white/20" : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className="h-11 w-11 rounded-md flex items-center justify-center font-display font-black text-lg"
                style={{
                  background: done ? track.color : "rgba(255,255,255,0.04)",
                  color: done ? "#050505" : "#fff",
                  border: `1px solid ${done ? track.color : "rgba(255,255,255,0.1)"}`,
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-lg">{c.title}</span>
                  <span className="cq-badge" style={{ color: track.color, borderColor: `${track.color}55` }}>
                    {kindIcon(c.kind)} {c.kind.toUpperCase()}
                  </span>
                  <span className="cq-badge">{c.difficulty}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-black text-[#FFE800] text-lg">+{c.xp}</div>
                <div className="font-mono text-[10px] text-white/50 uppercase tracking-widest">xp</div>
              </div>
              {!prev && <Lock size={16} className="text-white/40" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
