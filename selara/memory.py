from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List


@dataclass
class MemoryEntry:
    """A single remembered exchange."""

    user: str
    assistant: str


class InteractionMemory:
    """Persists Selara's past conversations to help her improve over time."""

    def __init__(self, path: Path, window: int = 20) -> None:
        self.path = Path(path)
        self.window = window
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.entries: List[MemoryEntry] = self._load()

    def _load(self) -> List[MemoryEntry]:
        if not self.path.exists():
            return []
        entries: List[MemoryEntry] = []
        for line in self.path.read_text().splitlines():
            try:
                payload = json.loads(line)
                entries.append(MemoryEntry(**payload))
            except Exception:
                # Skip malformed lines without interrupting startup
                continue
        return entries

    def remember(self, user: str, assistant: str) -> None:
        entry = MemoryEntry(user=user, assistant=assistant)
        self.entries.append(entry)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(asdict(entry), ensure_ascii=False) + "\n")

    def context_prompt(self) -> str:
        if not self.entries:
            return ""
        recent = self.entries[-self.window :]
        lines = ["Long-term notes from recent interactions (most recent last):"]
        for item in recent:
            lines.append(f"- User said: {item.user.strip()}")
            lines.append(f"  Selara answered: {item.assistant.strip()}")
        return "\n".join(lines)


__all__ = ["InteractionMemory", "MemoryEntry"]
