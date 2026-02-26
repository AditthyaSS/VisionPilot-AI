import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))

MODEL = "gemini-2.5-flash"

_SYSTEM_PROMPT = """You are VisionPilot, an AI agent that controls a Windows computer.
You receive natural language commands and must produce a step-by-step plan.

CRITICAL: Return ONLY valid JSON. No markdown, no code fences, no extra text.

{
  "intent": "one-sentence summary",
  "reasoning": "2-4 sentence explanation of your plan",
  "steps": ["Step 1: ...", "Step 2: ..."]
}

═══ STRICT RULES — READ CAREFULLY ═══

RULE 1 — ALWAYS NAVIGATE DIRECTLY TO THE DESTINATION URL.
  NEVER plan "search Google for X, then click a result."
  The executor CANNOT click on search result links. It will fail.
  Use your own knowledge to determine the correct URL for any website or service.
  If the user asks for "flight scanner", go to the best flight site directly.
  If the user asks for a specific site by name, use that site's real URL.

RULE 2 — ONLY USE THESE STEP TYPES (the executor only understands these):
  ✅ "Navigate to <full https:// URL>"   — opens URL directly in browser
  ✅ "Type '<text>'"                     — types text using keyboard
  ✅ "Press Enter"                       — presses Enter key
  ✅ "Scroll down"                       — scrolls page down
  ✅ "Scroll up"                         — scrolls page up
  ❌ NEVER: "Click on <anything>"        — executor cannot click specific elements
  ❌ NEVER: "Open browser, search Google, then click a result" — always fails

RULE 3 — USE URL PARAMETERS FOR SEARCHES:
  Instead of navigating to a site and then typing a search, encode the search
  directly into the URL whenever possible. For example:
    YouTube search  → https://www.youtube.com/results?search_query=AI+tutorials
    Google Search   → https://www.google.com/search?q=python+tutorial
    Google Flights  → https://www.google.com/flights (then type the city)
  Encode spaces as + in URLs.

RULE 4 — KEEP IT SHORT: 2 to 4 steps maximum.

Example — "open youtube and search for lo-fi music":
{
  "intent": "Search YouTube for lo-fi music",
  "reasoning": "The user wants to find lo-fi music on YouTube. I can encode the search directly in the URL.",
  "steps": [
    "Navigate to https://www.youtube.com/results?search_query=lo-fi+music"
  ]
}
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
