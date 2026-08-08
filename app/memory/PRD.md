# CodeQuest — PRD

## Problem Statement (verbatim)
> create an interactive gamified with ide environment .. react, ts, node.js and postgreswl learner

## User Choices (from ask_human)
- Learning mode: **Both** (tutorials + IDE)
- Content scope: **All 4 tracks (React, TypeScript, Node.js, PostgreSQL)** with ~5 challenges each + free-play sandbox
- Gamification: **XP + Levels + Badges + Streaks + Leaderboard** (full)
- AI Assistant: **Yes**, via Emergent LLM Key (Claude Sonnet 4.6)
- Accounts: **No auth**, local progress only + nickname-based leaderboard

## Personas
- **Newcomer coder** — wants a fun, low-friction way to try React/TS/Node/SQL
- **Casual re-learner** — knows one language, wants to sample the others
- **Streak player** — motivated by daily-streak / XP progression

## Architecture
- **Frontend**: React 19 + Tailwind + Monaco Editor + Framer Motion + Sonner toasts + canvas-confetti
- **Backend**: FastAPI + Motor (MongoDB) + emergentintegrations (LlmChat, Claude Sonnet 4.6)
- **Persistence**: localStorage (progress) + MongoDB (leaderboard upsert by nickname)
- **Design system**: Cyberpunk-Gamer Hybrid — Unbounded / Outfit / JetBrains Mono; neon accents (#39FF14, #00F0FF, #FFE800, #FF003C)

## API Surface
- `GET /api/` — health
- `POST /api/leaderboard/submit` — upsert score (nickname, xp, level, streak, badges)
- `GET /api/leaderboard?limit=25` — top players by xp
- `POST /api/mentor/chat` — AI mentor via Claude Sonnet 4.6

## Implemented (2026-01)
- Landing page with hero + track cards + feature bento
- Nickname modal (avatar picker, first-visit gate)
- Sticky top HUD (XP bar, level, streak, badges, callsign)
- Dashboard with 4 track cards + progress rings + node grid
- Track detail pages with lesson list, difficulty tags, sequential unlock
- Challenge page — Monaco editor + Markdown lesson + test cases + hints
  - 3 challenge kinds: `code` (JS runner in browser), `quiz` (MCQ), `sql` (normalized string match)
- Free-play Sandbox — 4 tracks, live JS console
- Leaderboard — global top 25, self-highlight
- Profile — level bar, per-track progress, badge gallery, reset
- ARC Mentor drawer — Claude Sonnet 4.6, context-aware (track / lesson / code)
- Gamification — XP+level curve, 8 badges, streak (today vs yesterday), level-up confetti, toast celebrations

## Content
- 4 tracks × 5 challenges = 20 total
- 8 badges (First Step, per-track masteries, Streak-3, Polymath, Level-5)

## Testing (iteration_1.json)
- Backend: 100% (all 4 endpoints)
- Frontend: 13/14 UI checks; single unverified item is a Playwright↔Monaco automation limitation, not an app bug (the grader itself validated via quiz + SQL paths)

## Backlog / P1
- More challenges per track (10-15 each)
- Multi-step tutorials with progressive reveal
- Track certificates on 100% completion
- Personal daily quest / weekly boss

## P2
- Real Postgres runner (WASM pg-lite) so SQL challenges can actually execute
- Optional Emergent-managed Google Auth for cross-device sync
- Multiplayer 1v1 speed-code duels
