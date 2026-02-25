from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class AgentState(str, Enum):
    IDLE = "idle"
    LISTENING = "listening"
    THINKING = "thinking"
    WORKING = "working"
    ERROR = "error"
    DONE = "done"


class ActionStep(BaseModel):
    step: str
    status: str = "pending"  # pending | active | done | error


class AgentStatus(BaseModel):
    state: AgentState
    reasoning: str
    steps: List[ActionStep]
    screenshot: Optional[str] = None  # base64 PNG
    logs: List[dict]


class CommandRequest(BaseModel):
    command: str
    screenshot: Optional[str] = None  # base64 from executor


class ExecuteResponse(BaseModel):
    intent: str
    steps: List[str]
    reasoning: str
