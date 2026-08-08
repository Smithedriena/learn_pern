import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { TRACKS } from "@/data/curriculum";
import MentorDrawer from "@/components/MentorDrawer";
import { Play, Terminal } from "lucide-react";

const STARTERS = {
  react: `// React sandbox — free play\n// Try helpers, transformations, whatever you want.\nfunction titleCase(str) {\n  return str.replace(/\\w\\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());\n}\nconsole.log(titleCase("hello world"));\n`,
  typescript: `// TypeScript-flavored JS sandbox\nconst pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);\nconst up = (s) => s.toUpperCase();\nconst excl = (s) => s + "!";\nconsole.log(pipe(up, excl)("neon"));\n`,
  nodejs: `// Node.js style sandbox — no real IO, just JS logic\nasync function fetchLike() {\n  return { ok: true, data: [1,2,3] };\n}\n(async () => {\n  const r = await fetchLike();\n  console.log("response:", r);\n})();\n`,
  postgres: `-- SQL sandbox (evaluated as text — no live DB in preview)\n-- Practice queries; the mentor can review them.\nSELECT users.name, COUNT(orders.id) AS orders\nFROM users\nLEFT JOIN orders ON orders.user_id = users.id\nGROUP BY users.name\nORDER BY orders DESC;\n`,
};

const monacoLang = (trackId) => {
  if (trackId === "typescript") return "typescript";
  if (trackId === "postgres") return "sql";
  return "javascript";
};

export default function Sandbox() {
  const { trackId } = useParams();
  const navigate = useNavigate();

  const activeTrack = TRACKS.find((t) => t.id === trackId) || TRACKS[0];
  const [code, setCode] = useState(STARTERS[activeTrack.id]);
  const [logs, setLogs] = useState([]);

  const switchTrack = (id) => {
    navigate(`/sandbox/${id}`);
    setCode(STARTERS[id]);
    setLogs([]);
  };

  const run = () => {
    if (activeTrack.id === "postgres") {
      setLogs([{ kind: "info", text: "SQL sandbox is text-only in preview — send to ARC for review." }]);
      return;
    }
    const captured = [];
    const push = (kind, args) => captured.push({ kind, text: args.map(stringify).join(" ") });
    const proxy = {
      log: (...a) => push("log", a),
      error: (...a) => push("error", a),
      warn: (...a) => push("warn", a),
      info: (...a) => push("info", a),
    };
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", code);
      const maybe = fn(proxy);
      if (maybe && typeof maybe.then === "function") {
        maybe.then(() => setLogs([...captured]), (err) => setLogs([...captured, { kind: "error", text: String(err) }]));
        setLogs([...captured, { kind: "info", text: "…awaiting async" }]);
      } else {
        setLogs(captured);
      }
    } catch (err) {
      setLogs([...captured, { kind: "error", text: String(err) }]);
    }
  };

  return (
    <div data-testid={`sandbox-page-${activeTrack.id}`} className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">
            Free-play <span className="neon-yellow">Sandbox</span>
          </h1>
          <p className="text-white/60 mt-1">No tests, no XP — pure experimentation. Ask ARC to review anything you write.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              data-testid={`sandbox-track-${t.id}`}
              onClick={() => switchTrack(t.id)}
              className={`cq-btn ${activeTrack.id === t.id ? "cq-btn-primary" : "cq-btn-ghost"}`}
              style={activeTrack.id === t.id ? { background: t.color, borderColor: t.color } : { borderColor: `${t.color}55`, color: t.color }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="cq-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2">
            <span className="cq-dot bg-[#39FF14]" />
            <span className="font-mono text-xs uppercase tracking-widest text-white/60">
              {activeTrack.name.toLowerCase()}.sandbox
            </span>
          </div>
          <button data-testid="sandbox-run-btn" onClick={run} className="cq-btn cq-btn-primary !py-1.5 !px-3">
            <Play size={12} /> Run
          </button>
        </div>
        <Editor
          height="380px"
          language={monacoLang(activeTrack.id)}
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "JetBrains Mono, monospace",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
          }}
        />
      </div>

      <div className="cq-card p-4">
        <div className="flex items-center gap-2 mb-2 text-white/70">
          <Terminal size={14} />
          <span className="font-mono text-xs uppercase tracking-widest">console</span>
        </div>
        <div data-testid="sandbox-console" className="font-mono text-xs bg-black/50 rounded-lg p-3 min-h-[100px] border border-white/10">
          {logs.length === 0 && <span className="text-white/40">// no output yet — hit Run</span>}
          {logs.map((l, i) => (
            <div key={i} className={
              l.kind === "error" ? "text-[#FF003C]" :
              l.kind === "warn" ? "text-[#FFE800]" :
              l.kind === "info" ? "text-[#00F0FF]" : "text-white/85"
            }>
              &gt; {l.text}
            </div>
          ))}
        </div>
      </div>

      <MentorDrawer track={activeTrack.name} lessonTitle="Sandbox" code={code} />
    </div>
  );
}

function stringify(v) {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}

try {
    const fn = new Function("console", code);

    function stringify(v) {
        if (typeof v === "string") return v;
        try { return JSON.stringify(v); } catch (_) { return String(v); }
    }

