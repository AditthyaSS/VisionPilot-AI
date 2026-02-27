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

\u2550\u2550\u2550 STRICT RULES \u2014 READ CAREFULLY \u2550\u2550\u2550

RULE 1 \u2014 ALWAYS NAVIGATE DIRECTLY TO THE DESTINATION URL.
  NEVER plan "search Google for X, then click a result."
  The executor CANNOT click on search result links. It will fail.
  Use your own knowledge to determine the correct URL for any website or service.
  If the user asks for "flight scanner", go to the best flight site directly.
  If the user asks for a specific site by name, use that site's real URL.

RULE 2 \u2014 ONLY USE THESE STEP TYPES (the executor only understands these):
  \u2705 "Navigate to <full https:// URL>"          \u2014 opens URL directly in browser
  \u2705 "Type '<text>'"                             \u2014 types text using keyboard
  \u2705 "Press Enter"                               \u2014 presses Enter key
  \u2705 "Scroll down"                               \u2014 scrolls page down
  \u2705 "Scroll up"                                 \u2014 scrolls page up
  \u2705 "Play <search query> on YouTube"            \u2014 searches YouTube AND plays the first result automatically
  \u2705 "Click '<element description>'"             \u2014 uses vision AI to find and click ANY element on ANY screen
  \u274c NEVER say just "Click" with no description  \u2014 always describe WHAT to click
  \u274c NEVER: "Open browser, search Google, then click a result" \u2014 always fails

RULE 3 \u2014 USE URL PARAMETERS FOR SEARCHES:
  Instead of navigating to a site and then typing a search, encode the search
  directly into the URL whenever possible. For example:
    YouTube search  \u2192 https://www.youtube.com/results?search_query=AI+tutorials
    Google Search   \u2192 https://www.google.com/search?q=python+tutorial
    Google Flights  \u2192 https://www.google.com/flights (then type the city)
  Encode spaces as + in URLs.

RULE 4 \u2014 KEEP IT SHORT: 2 to 4 steps maximum.

RULE 5 \u2014 FOR PLAY / WATCH REQUESTS:
  When the user says "play", "watch", "open and play", or anything implying
  video playback, you MUST use "Play <query> on YouTube" as the step.
  Do NOT just navigate to search results \u2014 that leaves nothing playing.
  "Play <query> on YouTube" searches for the video AND clicks the first result.

Example \u2014 "open youtube and search for lo-fi music":
{
  "intent": "Search YouTube for lo-fi music",
  "reasoning": "The user wants to find lo-fi music on YouTube. I can encode the search directly in the URL.",
  "steps": [
    "Navigate to https://www.youtube.com/results?search_query=lo-fi+music"
  ]
}

Example \u2014 "open and play AI videos" or "play AI tutorial on YouTube":
{
  "intent": "Play an AI video on YouTube",
  "reasoning": "The user wants to watch AI videos. I will use the Play step which searches YouTube and clicks the first result automatically.",
  "steps": [
    "Play AI videos on YouTube"
  ]
}

Example \u2014 "play lo-fi music":
{
  "intent": "Play lo-fi music on YouTube",
  "reasoning": "The user wants to hear lo-fi music. I will use the Play step to find and start a video.",
  "steps": [
    "Play lo-fi music on YouTube"
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


def vision_find_element(screenshot_base64: str, element_description: str) -> tuple[int, int] | None:
    """
    Use Gemini Vision to find a UI element on screen and return its (x, y) pixel coordinates.
    The screenshot is 1280x720. Returns None if the element is not found.
    """
    try:
        import base64
        img_bytes = base64.b64decode(screenshot_base64)

        prompt = f"""You are a precise UI element locator for a computer automation system.

The screenshot is exactly 1280x720 pixels.

Task: Find the element described as: "{element_description}"

Look carefully at the screenshot. Locate the most relevant clickable UI element matching the description.

Respond with ONLY a JSON object in this exact format, nothing else:
{{"x": <pixel_x>, "y": <pixel_y>, "found": true, "label": "<what you found>"}}

If the element is not visible at all, respond with:
{{"found": false, "label": "not found"}}

Rules:
- x must be between 0 and 1280
- y must be between 0 and 720
- Return the CENTER of the element
- For video thumbnails, return the center of the thumbnail
- For buttons, return the center of the button
- Do NOT return coordinates for navigation bars or browser chrome unless asked"""

        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type="image/png"),
                prompt,
            ],
        )

        raw = response.text.strip()
        # Strip markdown fences if present
        raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()
        parsed = json.loads(raw)

        if parsed.get("found") and "x" in parsed and "y" in parsed:
            x, y = int(parsed["x"]), int(parsed["y"])
            print(f"    👁️  Vision found '{parsed.get('label', element_description)}' at ({x}, {y})")
            return (x, y)
        else:
            print(f"    👁️  Vision: element not found — '{element_description}'")
            return None

    except Exception as e:
        print(f"    ⚠️  vision_find_element error: {e}")
        return None
