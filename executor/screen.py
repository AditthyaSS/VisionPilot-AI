import mss
import base64
import io
from PIL import Image


def capture_screenshot() -> str:
    """Capture the primary monitor and return as a base64-encoded PNG string."""
    with mss.mss() as sct:
        monitor = sct.monitors[1]  # Primary monitor
        raw = sct.grab(monitor)
        # Convert to PIL Image (mss gives BGRA raw bytes)
        img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
        # Resize to 1280×720 for efficient transport
        img = img.resize((1280, 720), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return base64.b64encode(buf.getvalue()).decode("utf-8")
