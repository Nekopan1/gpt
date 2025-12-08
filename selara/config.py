from dataclasses import dataclass, field
from pathlib import Path
from typing import List


@dataclass
class SelaraConfig:
    """Configuration for the Selara assistant."""

    model_name: str = "gpt2"
    device: int | str | None = None
    max_new_tokens: int = 200
    temperature: float = 0.7
    system_prompt: str = (
        "You are Selara, a friendly and concise local AI assistant running entirely "
        "on the user's machine. Provide practical, safe, and actionable replies."
    )
    stop_words: List[str] = field(default_factory=lambda: ["User:", "Selara:"])
    memory_path: Path = field(default_factory=lambda: Path.home() / ".selara" / "memory.jsonl")
    memory_window: int = 20
    enable_memory: bool = True

    def formatted_system_prompt(self) -> str:
        return self.system_prompt.strip()
