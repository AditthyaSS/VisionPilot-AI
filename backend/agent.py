import asyncio
from datetime import datetime, timezone
from models import AgentState, ActionStep, AgentStatus
import gemini_client


class VisionPilotAgent:
    def __init__(self):
        self.state: AgentState = AgentState.IDLE
        self.reasoning: str = ""
        self.steps: list[ActionStep] = []
        self.screenshot: str | None = None
        self.logs: list[dict] = []
        self.interrupted: bool = False
        self._task: asyncio.Task | None = None

    # ─── Logging ────────────────────────────────────────────────────────────
    def log(self, message: str, type: str = "info"):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": message,
            "type": type,
        }
        self.logs.append(entry)
        # Keep last 50 entries
        if len(self.logs) > 50:
            self.logs = self.logs[-50:]

    # ─── Reset ──────────────────────────────────────────────────────────────
    def reset(self):
        """Clear state for a fresh command."""
        self.reasoning = ""
        self.steps = []
        self.logs = []
        self.interrupted = False

    # ─── Core processing ────────────────────────────────────────────────────
    async def process_command(self, command: str, screenshot_b64: str = None):
        # 1. LISTENING
        self.state = AgentState.LISTENING
        self.log(f"Received command: \"{command}\"", "action")
        await asyncio.sleep(0.3)

        if self.interrupted:
            return self._handle_interrupt()

        # 2. THINKING — call Gemini
        self.state = AgentState.THINKING
        self.log("Analyzing intent with Gemini...", "thinking")

        result = await asyncio.get_event_loop().run_in_executor(
            None,
            gemini_client.analyze_command,
            command,
            screenshot_b64,
        )

        if self.interrupted:
            return self._handle_interrupt()

        self.reasoning = result.get("reasoning", "")
        raw_steps = result.get("steps", [])

        if not raw_steps:
            self.state = AgentState.ERROR
            self.log("⚠️ Gemini returned no steps — check your API key or prompt.", "error")
            return

        # Build step objects
        self.steps = [ActionStep(step=s, status="pending") for s in raw_steps]
        self.log(f"Plan ready: {len(self.steps)} steps", "info")

        # 3. WORKING — execute each step
        self.state = AgentState.WORKING
        self.log("Starting execution...", "action")

        for i, step in enumerate(self.steps):
            if self.interrupted:
                return self._handle_interrupt()

            # Mark active
            self.steps[i].status = "active"
            self.log(f"Executing: {step.step}", "action")
            await asyncio.sleep(3.0)  # Give executor (2s poll) time to catch this step

            if self.interrupted:
                self.steps[i].status = "error"
                return self._handle_interrupt()

            # Mark done
            self.steps[i].status = "done"
            self.log(f"✓ Completed: {step.step}", "done")
            await asyncio.sleep(0.5)  # Brief gap before next step

        # 4. DONE
        self.state = AgentState.DONE
        self.log("✅ All steps complete!", "done")

    def _handle_interrupt(self):
        self.state = AgentState.IDLE
        self.log("⛔ Interrupted by user", "warning")

    # ─── Control ────────────────────────────────────────────────────────────
    def interrupt(self):
        self.interrupted = True
        self.state = AgentState.IDLE
        self.log("⛔ Agent interrupted", "warning")

    # ─── Status ─────────────────────────────────────────────────────────────
    def get_status(self) -> AgentStatus:
        return AgentStatus(
            state=self.state,
            reasoning=self.reasoning,
            steps=self.steps,
            screenshot=self.screenshot,
            logs=self.logs,
        )


# Singleton instance shared across requests
agent = VisionPilotAgent()
