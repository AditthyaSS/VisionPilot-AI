import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))

MODEL = "gemini-2.5-flash"

_SYSTEM_PROMPT = """You are VisionPilot, an AI agent that autonomously controls computers.
You receive natural language commands and optionally a screenshot of the current screen.
Your job is to break down the user's intent into concrete, executable steps.

CRITICAL: Return ONLY valid JSON — no markdown, no code fences, no extra text.

Return exactly this structure:
{
  "intent": "one sentence summary of what the user wants",
  "reasoning": "explain your understanding of the task and your plan (2-4 sentences)",
  "steps": [
    "Step 1: ...",
    "Step 2: ..."
  ]
}

Steps must be specific and executable (e.g. "Open browser", "Navigate to youtube.com",
"Click search bar", "Type 'AI videos'", "Press Enter"). Between 3 and 8 steps.
"""


def _extract_json(text: str) -> dict | None:
    """Robustly extract JSON from model response."""
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    text = re.sub(r"```(?:json)?", "", text).strip().strip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None


def analyze_command(command: str, screenshot_base64: str = None) -> dict:
    """
    Call Gemini with the user command (+ optional screenshot).
    Returns: {intent, reasoning, steps}
    """
    try:
        prompt = f"{_SYSTEM_PROMPT}\n\nUser command: {command}"

        if screenshot_base64:
            import base64
            img_bytes = base64.b64decode(screenshot_base64)
            contents = [
                types.Part.from_bytes(data=img_bytes, mime_type="image/png"),
                prompt,
            ]
        else:
            contents = prompt

        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
        )

        raw = response.text.strip()
        parsed = _extract_json(raw)

        if parsed and "steps" in parsed:
            return {
                "intent": parsed.get("intent", "Execute user command"),
                "reasoning": parsed.get("reasoning", ""),
                "steps": parsed.get("steps", []),
            }

        return {
            "intent": "Execute user command",
            "reasoning": raw[:500],
            "steps": [],
        }

    except Exception as e:
        return {
            "intent": "error",
            "reasoning": f"Gemini error: {str(e)}",
            "steps": [],
        }


def analyze_screenshot(screenshot_base64: str) -> str:
    """Ask Gemini to describe what's visible on screen."""
    try:
        import base64
        img_bytes = base64.b64decode(screenshot_base64)
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type="image/png"),
                "Describe what you see on this computer screen. List all visible UI elements, applications, windows, and notable text.",
            ],
        )
        return response.text.strip()
    except Exception as e:
        return f"Screenshot analysis failed: {str(e)}"
