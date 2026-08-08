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


class MentorRequest(BaseModel):
    session_id: str
    message: str
    lesson_title: Optional[str] = None
    track: Optional[str] = None
    code: Optional[str] = None


class MentorResponse(BaseModel):
    reply: str


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
