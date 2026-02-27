"""
VisionPilot Local Executor
Polls the backend for active steps and executes them via pyautogui.
Also sends periodic screenshots so the dashboard stays updated.
"""

import os
import sys
import re
import time
import subprocess
import pyautogui
import pyperclip
import httpx
from dotenv import load_dotenv
from screen import capture_screenshot

# Add parent path so executor can import from backend when run from its own dir
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
try:
    from gemini_client import vision_find_element as _gemini_vision_find
except ImportError:
    _gemini_vision_find = None
    print("⚠️  gemini_client not found — vision click disabled")

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Safety — move mouse to top-left corner to abort
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.4


# ─── URL helpers ─────────────────────────────────────────────────────────────

def _safe_url(raw: str) -> str:
    raw = raw.strip().rstrip(".")
    if not raw.startswith("http"):
        raw = "https://" + raw
    return raw

def _extract_url(text: str) -> str:
    """Pull a domain/URL out of a step string."""
    # Explicit quoted URL
    match = re.search(r"[\"'](https?://\S+|[\w.-]+\.[\w]{2,}(?:/\S*)?)[\"']", text)
    if match:
        return _safe_url(match.group(1))
    # After keyword
    match = re.search(
        r"(?:navigate to|go to|open|visit|launch)\s+(https?://\S+|[\w.-]+\.[\w]{2,}(?:/\S*)?)",
        text, re.IGNORECASE,
    )
    if match:
        return _safe_url(match.group(1))
    return ""

def _extract_text(text: str) -> str:
    """Pull quoted or trailing text from a step."""
    match = re.search(r"[\"'](.*?)[\"']", text)
    if match:
        return match.group(1)
    match = re.search(
        r"(?:type|search for|search|write|enter|input)\s+(.+)", text, re.IGNORECASE
    )
    return match.group(1).strip() if match else ""

def _extract_keys(text: str) -> list:
    """Parse 'Press Ctrl+C' → ['ctrl', 'c'], 'Press Enter' → ['enter']"""
    match = re.search(r"press\s+(.+)", text, re.IGNORECASE)
    if not match:
        return []
    raw = match.group(1).strip().rstrip(".")
    parts = [p.strip().lower() for p in re.split(r"\+", raw)]
    # Normalize common names
    mapping = {"return": "enter", "space": "space", "escape": "esc", "backspace": "backspace"}
    return [mapping.get(p, p) for p in parts]


# ─── Browser helpers ──────────────────────────────────────────────────────────

def _open_url_and_focus(url: str):
    """
    Open a URL and bring the browser window to the foreground.
    Uses Windows 'start' command which opens in the foreground by default.
    """
    print(f"    🌐 Opening: {url}")
    subprocess.Popen(f'start "" "{url}"', shell=True)
    time.sleep(4.0)


def _vision_click(element_description: str, wait_before: float = 2.0) -> bool:
    """
    Universal vision-based click:
    1. Takes a screenshot of the current screen
    2. Asks Gemini Vision where the described element is (returns x,y at 1280x720 scale)
    3. Scales coordinates to the real screen resolution
    4. Clicks at that position
    Works for any website, app, or UI — not just YouTube.
    Returns True if clicked, False if element not found.
    """
    if _gemini_vision_find is None:
        print("    ⚠️  Vision click unavailable — gemini_client not loaded")
        return False

    print(f"    👁️  Looking for: '{element_description}'...")
    time.sleep(wait_before)  # let the page/app settle before screenshotting

    screenshot_b64 = capture_screenshot()
    result = _gemini_vision_find(screenshot_b64, element_description)

    if result is None:
        print(f"    ⚠️  Element not found by vision: '{element_description}'")
        return False

    # The screenshot was taken at 1280x720 but the real screen may be larger.
    # Scale the coordinates back to actual screen resolution.
    screen_w, screen_h = pyautogui.size()
    scale_x = screen_w / 1280
    scale_y = screen_h / 720
    real_x = int(result[0] * scale_x)
    real_y = int(result[1] * scale_y)

    print(f"    🖱️  Clicking at screen ({real_x}, {real_y})")
    pyautogui.moveTo(real_x, real_y, duration=0.3)
    pyautogui.click(real_x, real_y)
    time.sleep(0.5)
    return True



# ─── Typing helper ───────────────────────────────────────────────────────────

def _type_text(text: str):
    """
    Type text reliably on Windows by copying to clipboard and pasting.
    pyautogui.typewrite() silently drops many characters (unicode, punctuation).
    """
    pyperclip.copy(text)
    time.sleep(0.2)
    pyautogui.hotkey("ctrl", "v")
    time.sleep(0.2)


# ─── Action Dispatcher ───────────────────────────────────────────────────────

def execute_step(step: str):
    s = step.lower()

    # ── Play / open-and-play (vision-based, works on any site) ───────────────
    # Checked BEFORE the generic "open" branch so "open and play X" is caught here.
    if any(x in s for x in ["play", "open and play", "start playing"]):
        # Extract the thing to play
        query = _extract_text(step)
        if not query:
            query = re.sub(
                r"^(?:open and play|start playing|play the first video|play videos? (?:about|of|on)?|play)\s*",
                "", s, flags=re.IGNORECASE,
            ).strip()
            query = re.sub(r"\s*(?:on youtube|on google|in browser|on the internet)\s*$", "", query, flags=re.IGNORECASE).strip()

        if query and query not in ("the first video", "first video", "a video", ""):
            # Navigate to YouTube search results for the query
            search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
            _open_url_and_focus(search_url)

        # Now use vision to click the first video — works on YouTube, Spotify, Netflix, etc.
        clicked = _vision_click("first video thumbnail or first playable result", wait_before=2.5)
        if not clicked:
            # Fallback: click center of page area below the nav bar
            print("    ⚠️  Vision click failed — using center-screen fallback")
            screen_w, screen_h = pyautogui.size()
            pyautogui.click(screen_w // 2, int(screen_h * 0.4))

    # ── Navigate to URL (primary action) ─────────────────────────────────────
    elif any(x in s for x in ["navigate to", "go to", "open url",
                              "visit", "open youtube", "open google",
                              "launch youtube", "open the website",
                              "open browser", "launch browser", "open chrome",
                              "open firefox", "open edge", "open a browser",
                              "open the browser", "open a web browser",
                              "open the web browser"]):
        url = _extract_url(step)
        if url:
            _open_url_and_focus(url)
        else:
            # Generic "open browser" with no URL → open new tab
            print("    🌐 Opening browser (new tab)")
            subprocess.Popen('start "" "https://www.google.com"', shell=True)
            time.sleep(3.5)

    # ── Search / type ─────────────────────────────────────────────────────────
    elif any(x in s for x in ["search for", "search on", "search "]):
        text = _extract_text(step)
        if text:
            # If YouTube is mentioned, navigate directly via search URL
            if "youtube" in s:
                _open_url_and_focus(f"https://www.youtube.com/results?search_query={text.replace(' ', '+')}")
            # If Google is mentioned, navigate directly via search URL
            elif "google" in s:
                _open_url_and_focus(f"https://www.google.com/search?q={text.replace(' ', '+')}")
            else:
                # Click to focus the active browser input, then type + Enter
                time.sleep(1.0)
                pyautogui.click()
                time.sleep(0.4)
                _type_text(text)
                time.sleep(0.3)
                pyautogui.press("enter")

    elif any(x in s for x in ["type", "enter text", "write", "input"]):
        text = _extract_text(step)
        if text:
            time.sleep(0.5)
            pyautogui.click()
            time.sleep(0.3)
            _type_text(text)

    # ── Keyboard ──────────────────────────────────────────────────────────────
    elif "press enter" in s or "hit enter" in s:
        pyautogui.press("enter")

    elif s.strip().startswith("press"):
        keys = _extract_keys(step)
        if len(keys) > 1:
            pyautogui.hotkey(*keys)
        elif len(keys) == 1:
            pyautogui.press(keys[0])

    # ── Click (vision-based — works for any element on any app/site) ─────────
    elif "click" in s:
        # Extract what to click from the step description
        element = re.sub(r"^(?:click on |click the |click )", "", s, flags=re.IGNORECASE).strip()
        element = element or "primary interactive element"
        time.sleep(0.5)
        clicked = _vision_click(element, wait_before=1.0)
        if not clicked:
            # Fallback: click at center of screen
            print("    ⚠️  Vision click failed — clicking center of screen")
            pyautogui.click()

    # ── Scroll ────────────────────────────────────────────────────────────────
    elif "scroll down" in s:
        pyautogui.scroll(-5)

    elif "scroll up" in s:
        pyautogui.scroll(5)

    time.sleep(0.8)


# ─── Main Loop ───────────────────────────────────────────────────────────────

def main():
    print(f"🤖  VisionPilot Executor started")
    print(f"📡  Backend: {BACKEND_URL}")
    print(f"ℹ️   Move mouse to top-left corner to abort (FAILSAFE)\n")

    last_active_step = None
    prev_state = "idle"
    screenshot_counter = 0

    while True:
        try:
            r = httpx.get(f"{BACKEND_URL}/status", timeout=5)
            status = r.json()
            current_state = status.get("state", "idle")

            # ── Reset step tracker on every new command ──
            # Trigger: state goes to 'listening' = fresh command received
            if current_state == "listening" and prev_state != "listening":
                print("🔄  New command detected — resetting step tracker")
                last_active_step = None
            prev_state = current_state

            # ── Push screenshot every ~6 seconds when agent is active ──
            screenshot_counter += 1
            if screenshot_counter >= 3 and current_state in ("working", "thinking"):
                try:
                    b64 = capture_screenshot()
                    httpx.post(
                        f"{BACKEND_URL}/update-screenshot",
                        json={"screenshot": b64},
                        timeout=10,
                    )
                    print("📸  Screenshot sent")
                except Exception as e:
                    print(f"⚠️   Screenshot failed: {e}")
                screenshot_counter = 0

            # ── Execute the currently active step ──
            for step_obj in status.get("steps", []):
                if step_obj["status"] == "active" and step_obj["step"] != last_active_step:
                    last_active_step = step_obj["step"]
                    print(f"⚡  Executing: {step_obj['step']}")
                    execute_step(step_obj["step"])

            # ── Reset tracker when done/idle ──
            if current_state in ("idle", "done", "error") and prev_state not in ("idle", "done", "error"):
                last_active_step = None
                print("✅  Agent finished — step tracker cleared")

        except httpx.ConnectError:
            print(f"❌  Cannot connect to {BACKEND_URL} — retrying...")
        except Exception as e:
            print(f"❌  Error: {e}")

        time.sleep(2)


if __name__ == "__main__":
    main()
