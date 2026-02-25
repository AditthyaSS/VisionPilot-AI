import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import agent
from models import CommandRequest

app = FastAPI(title="VisionPilot AI Backend", version="1.0.0")

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ─────────────────────────────────────────────────────────────────
class ScreenshotUpdate(BaseModel):
    screenshot: str  # base64


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "healthy", "agent_state": agent.state}


@app.post("/execute")
async def execute(req: CommandRequest):
    """Reset agent, start processing in the background, return immediately."""
    agent.reset()
    asyncio.create_task(
        agent.process_command(req.command, req.screenshot)
    )
    return {"status": "started", "message": "Agent activated"}


@app.get("/status")
async def status():
    """Return the current agent status (poll this every 2s from frontend)."""
    return agent.get_status()


@app.post("/interrupt")
async def interrupt():
    """Immediately halt the agent."""
    agent.interrupt()
    return {"status": "interrupted"}


@app.post("/update-screenshot")
async def update_screenshot(body: ScreenshotUpdate):
    """Called by the local executor to push a fresh screenshot."""
    agent.screenshot = body.screenshot
    return {"status": "ok"}


# ─── Entry point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
