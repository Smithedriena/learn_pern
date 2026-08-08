from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

app = FastAPI(title="CodeQuest API")
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
    doc = entry.model_dump()
    # upsert by nickname (case-insensitive)
    await db.leaderboard.update_one(
        {"nickname_lower": entry.nickname.lower()},
        {"$set": {**doc, "nickname_lower": entry.nickname.lower()}},
        upsert=True,
    )
    return entry


@api.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 25):
    cursor = db.leaderboard.find({}, {"_id": 0, "nickname_lower": 0}).sort("xp", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    return items


@api.post("/mentor/chat", response_model=MentorResponse)
async def mentor_chat(payload: MentorRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="Mentor unavailable: missing key")
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
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
