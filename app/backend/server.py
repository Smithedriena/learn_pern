from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
import aiosqlite
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

DB_PATH = ROOT_DIR / "codequest.db"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")


# ---------- Database setup ----------
async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS leaderboard (
                id TEXT PRIMARY KEY,
                nickname TEXT NOT NULL,
                nickname_lower TEXT NOT NULL UNIQUE,
                xp INTEGER NOT NULL DEFAULT 0,
                level INTEGER NOT NULL DEFAULT 1,
                streak INTEGER NOT NULL DEFAULT 0,
                badges INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL
            )
            """
        )
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="CodeQuest API", lifespan=lifespan)
api = APIRouter(prefix="/api")


# ---------- Models ----------
class LeaderboardEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nickname: str
    xp: int
    level: int
    streak: int = 0
    badges: int = 0
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LeaderboardSubmit(BaseModel):
    nickname: str
    xp: int
    level: int
    streak: int = 0
    badges: int = 0


@api.post("/mentor/chat", response_model=MentorResponse)
async def mentor_chat(payload: MentorRequest):
    # Offline rule-based mentor — no API keys, no internet required
    msg = payload.message.lower()
    track = (payload.track or "").lower()
    code_snippet = (payload.code or "")[:500]

    # Context-aware responses
    responses = []

    # Generic encouragement
    if any(w in msg for w in ["hello", "hi", "hey"]):
        responses.append("Hey! I'm ARC — your offline coding mentor. Ask me about React, TypeScript, Node.js, or SQL!")
    
    # Hints based on track
    elif "react" in track or "react" in msg:
        if "state" in msg or "usestate" in msg:
            responses.append("In React, `useState` returns `[value, setter]`. Call the setter to trigger a re-render.")
        elif "effect" in msg or "useeffect" in msg:
            responses.append("`useEffect(() => { ... }, [deps])` runs after render. Return a cleanup function if you subscribe to anything.")
        elif "list" in msg or "map" in msg:
            responses.append("Use `.map()` to transform arrays into JSX. Don't forget a stable `key` prop on each item!")
        else:
            responses.append("React components are just functions that return JSX. Props flow down, state is local.")

    elif "typescript" in track or "ts" in msg or "type" in msg:
        if "generic" in msg:
            responses.append("Generics let you write `function id<T>(x: T): T { return x; }` — reusable across types.")
        elif "union" in msg or "narrow" in msg:
            responses.append("Use `typeof` or discriminant properties (`kind: 'circle'`) to narrow unions safely.")
        else:
            responses.append("TypeScript adds types to JS. Start with `: type` annotations, then let inference do the rest.")

    elif "node" in track or "server" in msg or "async" in msg:
        if "promise" in msg or "await" in msg:
            responses.append("`async` functions always return a Promise. Use `await` to unwrap values inside async code.")
        elif "json" in msg or "parse" in msg:
            responses.append("Wrap `JSON.parse` in `try/catch` — invalid JSON throws synchronously.")
        else:
            responses.append("Node.js runs JS outside the browser. Use `fs` for files, `http` for servers, and `async/await` for flow control.")

    elif "postgres" in track or "sql" in msg or "query" in msg:
        if "join" in msg:
            responses.append("`INNER JOIN` returns rows where both tables match the ON condition. Use table aliases to keep it readable.")
        elif "index" in msg:
            responses.append("Indexes speed up reads (especially B-trees) but slow down writes because the index must be updated too.")
        elif "count" in msg or "sum" in msg:
            responses.append("Aggregate functions like `COUNT(*)` collapse rows. Use `GROUP BY` if you need counts per category.")
        else:
            responses.append("SQL reads like English: `SELECT cols FROM table WHERE condition ORDER BY col;`")

    # Code-specific hints
    elif "error" in msg or "bug" in msg or "fix" in msg:
        responses.append("Read the error top-to-bottom. The first line usually tells you exactly what broke and where.")
    elif "hint" in msg or "help" in msg or "stuck" in msg:
        responses.append("Try breaking the problem into two parts: what goes in, and what must come out. Write pseudo-code first.")
    elif "answer" in msg or "solution" in msg:
        responses.append("I want you to level up — so here's the concept, not just the code: think about the data transformation. Want me to spell it out?")
    else:
        responses.append("Good question. Try writing out what you expect line-by-line, then run it. Errors are just the compiler teaching you.")

    reply = " ".join(responses) if responses else "Keep going — you're closer than you think. Break the problem into smaller steps."

    return MentorResponse(reply=reply)

# ---------- Routes ----------
@api.get("/")
async def root():
    return {"message": "CodeQuest API online", "status": "ok"}


@api.post("/leaderboard/submit", response_model=LeaderboardEntry)
async def submit_score(payload: LeaderboardSubmit):
    if not payload.nickname.strip():
        raise HTTPException(status_code=400, detail="Nickname required")
    entry = LeaderboardEntry(
        nickname=payload.nickname.strip()[:24],
        xp=max(0, payload.xp),
        level=max(1, payload.level),
        streak=max(0, payload.streak),
        badges=max(0, payload.badges),
    )
    async with aiosqlite.connect(DB_PATH) as db:
        # upsert by nickname (case-insensitive)
        await db.execute(
            """
            INSERT INTO leaderboard (id, nickname, nickname_lower, xp, level, streak, badges, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(nickname_lower) DO UPDATE SET
                id = excluded.id,
                nickname = excluded.nickname,
                xp = excluded.xp,
                level = excluded.level,
                streak = excluded.streak,
                badges = excluded.badges,
                updated_at = excluded.updated_at
            """,
            (
                entry.id,
                entry.nickname,
                entry.nickname.lower(),
                entry.xp,
                entry.level,
                entry.streak,
                entry.badges,
                entry.updated_at,
            ),
        )
        await db.commit()
    return entry


@api.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 25):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, nickname, xp, level, streak, badges, updated_at FROM leaderboard ORDER BY xp DESC LIMIT ?",
            (limit,),
        )
        rows = await cursor.fetchall()
    return [dict(r) for r in rows]


@api.post("/mentor/chat", response_model=MentorResponse)
async def mentor_chat(payload: MentorRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="Mentor unavailable: set EMERGENT_LLM_KEY to enable")
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as e:
        logging.exception("emergentintegrations import failed")
        raise HTTPException(status_code=500, detail=f"Mentor library unavailable: {e}")

    context_bits = []
    if payload.track:
        context_bits.append(f"Track: {payload.track}")
    if payload.lesson_title:
        context_bits.append(f"Lesson: {payload.lesson_title}")
    if payload.code:
        context_bits.append(f"Current learner code:\n```\n{payload.code[:2500]}\n```")
    context = "\n".join(context_bits) if context_bits else "(no lesson context)"

    system = (
        "You are 'ARC', a warm, energetic AI coding mentor inside a gamified IDE that teaches "
        "React, TypeScript, Node.js and PostgreSQL. Give short, targeted hints — never dump the full "
        "solution unless the learner explicitly asks for it. Prefer 2-4 sentence answers. "
        "Use small code snippets in fenced blocks when needed. Be encouraging and gamer-friendly "
        "(occasional 'nice run!', 'level up incoming' — but keep it professional). "
        "If the learner asks for the answer, give it, then explain the key concept in one line.\n\n"
        f"Context:\n{context}"
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=payload.session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-6")

    try:
        reply = await chat.send_message(UserMessage(text=payload.message))
    except Exception as e:
        logging.exception("mentor chat failed")
        raise HTTPException(status_code=500, detail=f"Mentor error: {e}")

    return MentorResponse(reply=str(reply))


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
