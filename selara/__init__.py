"""Selara: a local, Python-based conversational AI helper."""

from .ai import Selara
from .config import SelaraConfig
from .conversation import ConversationManager, Message
from .memory import InteractionMemory, MemoryEntry

__all__ = [
    "Selara",
    "SelaraConfig",
    "ConversationManager",
    "Message",
    "InteractionMemory",
    "MemoryEntry",
]
