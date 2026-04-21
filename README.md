# VisionPilot AI 🧠

<p align="center">
  <img src="images/gemini-color.png" alt="Gemini Logo" width="80" />
</p>

> **An AI that sees your screen, understands your intent, and acts like a human.**

Built with **Gemini 2.5 Flash** · React + Vite · FastAPI · pyautogui

---

## ✨ Features

| | Feature |
|---|---|
|  | **Vision** — captures and analyzes your screen |
|  | **Reasoning** — Gemini breaks your command into executable steps |
|  | **Action** — pyautogui executes mouse/keyboard actions |
| 🔁 | **Interruption** — stop and redirect the agent mid-task |
| 🎙️ | **Voice Input** — speak your command; it transcribes live and sends automatically |


---

## 🎙️ Voice Input

Click the **microphone button** next to the command input field to speak your command.
Speech is transcribed live using the **Web Speech API** (built into Chrome/Edge — no extra setup needed).
When you stop talking, the command is sent to the agent automatically.

> **Note:** Voice input requires a Chromium-based browser (Chrome or Edge) and microphone permission.

---


## 🏗️ Architecture

```
┌──────────────┐     POST /execute      ┌──────────────────┐
│   Frontend   │ ─────────────────────► │  FastAPI Backend  │
│  (React/Vite)│ ◄── GET /status (2s) ─ │  + Gemini Client  │
└──────────────┘                        └────────┬─────────┘
                                                 │ screenshots
                                        ┌────────▼─────────┐
                                        │  Local Executor   │
                                        │ (pyautogui + mss) │
                                        └──────────────────┘
```

---

## 🚀 Quick Start

### 1. Frontend

```bash
cd frontend
npm install
npm run dev        # → http://localhost:3000
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### 3. Local Executor (optional — for real screen control)

```bash
cd executor
pip install -r requirements.txt
python executor.py
```

---

## 🔑 Environment Variables

| File | Variable | Description |
|------|----------|-------------|
| `backend/.env` | `GEMINI_API_KEY` | Your [Google AI Studio](https://aistudio.google.com/) key |
| `frontend/.env` | `VITE_API_URL` | Backend URL (default: `http://localhost:8000`) |

---

## 🌐 Deployment

### Backend → Google Cloud Run

```bash
cd backend
gcloud run deploy visionpilot-backend \
  --source . --platform managed \
  --region us-central1 --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

### Frontend → Vercel

```bash
cd frontend
echo "VITE_API_URL=https://your-cloud-run-url.run.app" > .env.production
npx vercel --prod
```

---

## ⚠️ Safety Notes

- `pyautogui.FAILSAFE = True` — move mouse to top-left corner to abort the executor
- Never run the executor as root/admin
- Add CORS restrictions and rate-limiting before production deployment
- Never commit `.env` files (they're in `.gitignore`)

---

*VisionPilot AI · Built with Gemini · "Not just an app — a brain."*
