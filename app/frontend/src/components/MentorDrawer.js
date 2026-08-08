import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useGame } from "@/context/GameContext";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api`;

export default function MentorDrawer({ track, lessonTitle, code }) {
  const { nickname } = useGame();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey, I'm ARC — your mentor. Ask me for a hint, or paste an error." },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const sessionIdRef = useRef(
    `${nickname || "guest"}-${Math.random().toString(36).slice(2, 10)}`
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/mentor/chat`, {
        session_id: sessionIdRef.current,
        message: text,
        lesson_title: lessonTitle,
        track,
        code,
      }, { timeout: 45000 });
      setMessages((m) => [...m, { role: "assistant", text: res.data.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Mentor is briefly offline. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        data-testid="mentor-fab"
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-40 cq-btn cq-btn-cyan"
      >
        <Bot size={16} />
        <span>ARC Mentor</span>
      </button>

      {open && (
        <div
          data-testid="mentor-drawer"
          className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[92vw] h-[520px] max-h-[75vh] cq-card flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-2">
              <span className="cq-dot bg-[#00F0FF]" />
              <span className="font-display text-sm font-bold">ARC Mentor</span>
              <span className="cq-badge">Claude Sonnet 4.6</span>
            </div>
            <button
              data-testid="mentor-close"
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white"
              aria-label="Close mentor"
            >
              <X size={16} />
            </button>
          </div>

          <div
            ref={scrollRef}
            data-testid="mentor-messages"
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-[#39FF14]/15 border border-[#39FF14]/30 text-white"
                    : "bg-white/5 border border-white/10 text-white/85"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                <span className="cq-dot bg-[#00F0FF]" /> thinking…
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
            <input
              data-testid="mentor-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask ARC anything…"
              className="flex-1 bg-black/50 border border-white/15 focus:border-[#00F0FF] outline-none rounded-lg px-3 py-2 text-sm text-white font-mono"
            />
            <button
              data-testid="mentor-send"
              onClick={send}
              disabled={loading || !input.trim()}
              className="cq-btn cq-btn-cyan !py-2 !px-3"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
