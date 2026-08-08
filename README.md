# CodeQuest — Offline PERN Learning Arena

A gamified, progressive IDE for learning React, TypeScript, Node.js and PostgreSQL. Runs entirely offline.

## Quick Start

```bash
# 1. Clone
git clone https://github.com/smithedriena/learn_pern.git
cd learn_pern/app

# 2. Backend (Python)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# 3. Frontend (new terminal)
cd ../frontend
npm install --legacy-peer-deps
npm start
