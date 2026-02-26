"""
VisionPilot Local Executor
Polls the backend for active steps and executes them via pyautogui.
Also sends periodic screenshots so the dashboard stays updated.
"""

import os
import re
import time
import subprocess
import pyautogui
import httpx
from dotenv import load_dotenv
from screen import capture_screenshot

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
    # 'start' on Windows opens the URL in the default browser and brings it to front
    subprocess.Popen(f'start "" "{url}"', shell=True)
    # Give the browser time to open and render the page before any typing steps
    time.sleep(4.0)



# ─── Action Dispatcher ───────────────────────────────────────────────────────

def execute_step(step: str):
    s = step.lower()

    # ── Navigate to URL (primary action) ─────────────────────────────────────
    if any(x in s for x in ["navigate to", "go to", "open url",
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
    elif any(x in s for x in ["search for", "search "]):
        text = _extract_text(step)
        if text:
            # If YouTube is already open, use its search URL
            if "youtube" in s:
                _open_url_and_focus(f"https://www.youtube.com/results?search_query={text.replace(' ', '+')}")
            else:
                pyautogui.typewrite(text, interval=0.05)
                time.sleep(0.3)
                pyautogui.press("enter")

    elif any(x in s for x in ["type", "enter text", "write", "input"]):
        text = _extract_text(step)
        if text:
            pyautogui.typewrite(text, interval=0.05)

    # ── Keyboard ──────────────────────────────────────────────────────────────
    elif "press enter" in s or "hit enter" in s:
        pyautogui.press("enter")

    elif s.strip().startswith("press"):
        keys = _extract_keys(step)
        if len(keys) > 1:
            pyautogui.hotkey(*keys)
        elif len(keys) == 1:
            pyautogui.press(keys[0])

    # ── Click ─────────────────────────────────────────────────────────────────
    elif "click" in s:
        if "search bar" in s or "search box" in s:
            time.sleep(1.0)
            pyautogui.click()
        else:
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
