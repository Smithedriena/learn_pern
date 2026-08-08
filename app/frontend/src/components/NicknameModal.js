import React, { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";

const AVATARS = ["🎮", "🕹️", "🚀", "⚡", "🧙", "🦾", "🐉", "🛸", "🧠", "🐺"];

export default function NicknameModal() {
  const { nickname, setNickname } = useGame();
  const [open, setOpen] = useState(!nickname);
  const [value, setValue] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);

  useEffect(() => { setOpen(!nickname); }, [nickname]);

  if (!open) return null;

  const submit = () => {
    if (!value.trim()) return;
    setNickname(value.trim(), avatar);
    setOpen(false);
  };

  return (
    <div
      data-testid="nickname-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
    >
      <div className="cq-card w-full max-w-md p-7 relative">
        <div className="absolute -top-3 left-6 cq-badge bg-[#39FF14] text-black border-[#39FF14]">
          New Player
        </div>
        <h2 className="font-display text-2xl font-black tracking-tight mt-2">
          Choose your <span className="neon-green">callsign</span>
        </h2>
        <p className="text-white/60 text-sm mt-1">
          Your progress is saved locally. Your callsign appears on the global leaderboard.
        </p>

        <input
          data-testid="nickname-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          maxLength={24}
          placeholder="e.g. NeonNinja"
          className="mt-5 w-full bg-black/50 border border-white/15 focus:border-[#39FF14] outline-none rounded-lg px-4 py-3 font-mono text-sm text-white"
        />

        <div className="mt-4">
          <div className="text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Avatar</div>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                data-testid={`avatar-${a}`}
                onClick={() => setAvatar(a)}
                className={`h-10 w-10 text-xl rounded-md border transition ${
                  avatar === a
                    ? "border-[#39FF14] bg-[#39FF14]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button
          data-testid="nickname-submit"
          disabled={!value.trim()}
          onClick={submit}
          className="cq-btn cq-btn-primary mt-6 w-full justify-center"
        >
          Enter the Quest →
        </button>
      </div>
    </div>
  );
}
