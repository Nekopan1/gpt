from dataclasses import dataclass
from typing import List, Literal

Role = Literal["system", "user", "assistant"]


@dataclass
class Message:
    role: Role
    content: str


class ConversationManager:
    """Tracks the back-and-forth between the user and Selara."""

    def __init__(self, system_prompt: str) -> None:
        self.messages: List[Message] = [Message("system", system_prompt)]

    def add_user(self, content: str) -> None:
        self.messages.append(Message("user", content))

    def add_assistant(self, content: str) -> None:
        self.messages.append(Message("assistant", content))

    def build_prompt(self) -> str:
        parts: List[str] = []
        for message in self.messages:
            prefix = {
                "system": "System:",
                "user": "User:",
                "assistant": "Selara:",
            }[message.role]
            parts.append(f"{prefix} {message.content.strip()}")
        parts.append("Selara:")
        return "\n".join(parts)
