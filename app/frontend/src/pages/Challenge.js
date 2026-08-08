import React, { useMemo, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { CHALLENGES, TRACKS, checkSql } from "@/data/curriculum";
import { useGame } from "@/context/GameContext";
import Markdown from "@/components/Markdown";
import MentorDrawer from "@/components/MentorDrawer";
import { CheckCircle2, XCircle, Play, Lightbulb, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const monacoLang = (trackId) => {
  if (trackId === "typescript") return "typescript";
  if (trackId === "postgres") return "sql";
  return "javascript";
};

export default function Challenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const challenge = CHALLENGES.find((c) => c.id === id);
  const { completed, completeChallenge } = useGame();

  const [code, setCode] = useState(challenge?.starter || "");
  const [output, setOutput] = useState(null); // { pass, results: [{i,pass,got,expected}], error }
  const [selectedOption, setSelectedOption] = useState(null);
  const [hintIdx, setHintIdx] = useState(-1);
  const [running, setRunning] = useState(false);

  const track = useMemo(
    () => TRACKS.find((t) => t.id === challenge?.trackId),
    [challenge]
  );

  const trackList = useMemo(
    () => (challenge ? CHALLENGES.filter((c) => c.trackId === challenge.trackId) : []),
    [challenge]
  );
  const idxInTrack = trackList.findIndex((c) => c.id === challenge?.id);
  const next = trackList[idxInTrack + 1];
  const prev = trackList[idxInTrack - 1];

  if (!challenge) return <Navigate to="/learn" replace />;

  const isDone = completed.includes(challenge.id);

  const resetCode = () => { setCode(challenge.starter || ""); setOutput(null); };

  const runCode = async () => {
    setRunning(true);
    setOutput(null);
    try {
      if (challenge.kind === "quiz") {
        const pass = selectedOption === challenge.answer;
        setOutput({
          pass,
          results: [{ i: 1, pass, got: challenge.options[selectedOption] ?? "(no answer)", expected: challenge.options[challenge.answer] }],
        });
        if (pass && !isDone) completeChallenge(challenge.id);
      } else if (challenge.kind === "sql") {
        const pass = checkSql(code, challenge.solutions);
        setOutput({
          pass,
          results: [{ i: 1, pass, got: code.trim() || "(empty)", expected: challenge.solutions[0] }],
        });
        if (pass && !isDone) completeChallenge(challenge.id);
      } else {
        // Code challenge — run in browser Function sandbox
        const results = [];
        let allPass = true;
        for (let i = 0; i < challenge.tests.length; i++) {
          const t = challenge.tests[i];
          try {
            // Build a function scope: user code declares `function entry(...) {...}` OR arrow.
            // eslint-disable-next-line no-new-func
            const runner = new Function(
              "__args",
              `${code}\nreturn (typeof ${challenge.entry} === "function") ? ${challenge.entry}(...__args) : undefined;`
            );
            let got = runner(t.input);
            if (t.async) got = await Promise.resolve(got);
            const pass = deepEqual(got, t.expected);
            if (!pass) allPass = false;
            results.push({ i: i + 1, pass, got: safeStr(got), expected: safeStr(t.expected) });
          } catch (err) {
            allPass = false;
            results.push({ i: i + 1, pass: false, got: `error: ${err.message}`, expected: safeStr(t.expected) });
          }
        }
        setOutput({ pass: allPass, results });
        if (allPass && !isDone) completeChallenge(challenge.id);
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div data-testid={`challenge-page-${challenge.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* LEFT: description */}
      <div className="cq-card p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Link to={`/learn/${track.id}`} className="cq-badge hover:text-white" style={{ color: track.color, borderColor: `${track.color}55` }}>
            ← {track.name}
          </Link>
          <span className="cq-badge">{challenge.difficulty}</span>
          <span className="cq-badge">+{challenge.xp} XP</span>
          {isDone && <span className="cq-badge bg-[#39FF14]/15 border-[#39FF14]/40 text-[#39FF14]">Cleared</span>}
        </div>

        <h1 className="font-display text-3xl font-black tracking-tight">{challenge.title}</h1>
        <div className="mt-4">
          <Markdown text={challenge.lesson} />
        </div>

        {challenge.kind === "quiz" && (
          <div className="mt-4 space-y-2">
            {challenge.options.map((opt, i) => (
              <button
                key={i}
                data-testid={`quiz-option-${i}`}
                onClick={() => setSelectedOption(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition font-mono text-sm ${
                  selectedOption === i
                    ? "border-[#00F0FF] bg-[#00F0FF]/10 text-white"
                    : "border-white/10 bg-white/5 hover:bg-white/10 text-white/85"
                }`}
              >
                <span className="text-white/50 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-2 flex-wrap">
          <button
            data-testid="hint-btn"
            onClick={() => setHintIdx((v) => Math.min(v + 1, (challenge.hints?.length || 0) - 1))}
            className="cq-btn cq-btn-ghost"
            disabled={!challenge.hints?.length}
          >
            <Lightbulb size={14} /> Reveal hint
          </button>
          {hintIdx >= 0 && (
            <div
              data-testid="hint-text"
              className="w-full mt-2 rounded-lg border border-[#FFE800]/30 bg-[#FFE800]/5 px-4 py-3 text-sm text-white/85"
            >
              💡 {challenge.hints[hintIdx]}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: editor + tests */}
      <div className="flex flex-col gap-4">
        {challenge.kind !== "quiz" && (
          <div className="cq-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="cq-dot bg-[#39FF14]" />
                <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                  {challenge.kind === "sql" ? "sql console" : `${monacoLang(track.id)}.editor`}
                </span>
              </div>
              <button data-testid="reset-code-btn" onClick={resetCode} className="text-white/60 hover:text-white text-xs font-mono flex items-center gap-1">
                <RotateCcw size={12} /> reset
              </button>
            </div>
            <Editor
              height="320px"
              language={monacoLang(track.id)}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        )}

        <div className="cq-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-bold text-sm uppercase tracking-widest text-white/70">Test Cases</div>
            <button
              data-testid="run-btn"
              disabled={running}
              onClick={runCode}
              className="cq-btn cq-btn-primary"
            >
              <Play size={14} /> {running ? "Running…" : "Run & Submit"}
            </button>
          </div>

          {!output && <div className="text-white/50 text-sm font-mono">Press <kbd className="cq-badge">Run</kbd> to grade your solution.</div>}

          {output && (
            <div data-testid="test-output" className="space-y-2">
              <div className={`flex items-center gap-2 font-display font-bold ${output.pass ? "text-[#39FF14]" : "text-[#FF003C]"}`}>
                {output.pass ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {output.pass ? "All tests passed! +XP awarded." : "Some tests failed"}
              </div>
              <div className="space-y-1 font-mono text-xs">
                {output.results.map((r) => (
                  <div key={r.i} className={`px-3 py-2 rounded border ${r.pass ? "border-[#39FF14]/30 bg-[#39FF14]/5" : "border-[#FF003C]/30 bg-[#FF003C]/5"}`}>
                    <div className={r.pass ? "text-[#39FF14]" : "text-[#FF003C]"}>Test {r.i} · {r.pass ? "PASS" : "FAIL"}</div>
                    <div className="text-white/60">got: <span className="text-white/85">{r.got}</span></div>
                    <div className="text-white/60">expected: <span className="text-white/85">{r.expected}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            data-testid="prev-challenge-btn"
            disabled={!prev}
            onClick={() => prev && navigate(`/challenge/${prev.id}`)}
            className="cq-btn cq-btn-ghost"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            data-testid="next-challenge-btn"
            disabled={!next}
            onClick={() => next && navigate(`/challenge/${next.id}`)}
            className="cq-btn cq-btn-ghost"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <MentorDrawer track={track.name} lessonTitle={challenge.title} code={code} />
    </div>
  );
}

function safeStr(v) {
  try {
    if (typeof v === "string") return JSON.stringify(v);
    return JSON.stringify(v);
  } catch { return String(v); }
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => deepEqual(x, b[i]));
  }
  if (typeof a === "object") {
    const ak = Object.keys(a), bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => deepEqual(a[k], b[k]));
  }
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) < 1e-9;
  }
  return false;
}

// Build a function scope: user code declares `function entry(...) {...}` OR arrow.
const runner = new Function(


    function safeStr(v) {
        try {
            if (typeof v === "string") return JSON.stringify(v);
            return JSON.stringify(v);
        } catch (_e) { return String(v); }
    }
