import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

import numpy as np

try:
    import faiss
except ImportError:  # pragma: no cover
    faiss = None


@dataclass
class MemoryItem:
    role: str
    content: str
    created_at: str


class MemoryStore:
    def __init__(self, db_path: Path, embedding_dim: int = 384):
        self.db_path = db_path
        self.embedding_dim = embedding_dim
        self._conn = sqlite3.connect(self.db_path)
        self._ensure_schema()
        self._index = None

    def _ensure_schema(self) -> None:
        cursor = self._conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                session_id TEXT,
                role TEXT,
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS summaries (
                id INTEGER PRIMARY KEY,
                session_id TEXT,
                summary TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS embeddings (
                message_id INTEGER,
                vector BLOB
            );
            """
        )
        self._conn.commit()

    def add_message(self, session_id: str, role: str, content: str) -> int:
        cursor = self._conn.cursor()
        cursor.execute(
            "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
            (session_id, role, content),
        )
        self._conn.commit()
        return cursor.lastrowid

    def add_embedding(self, message_id: int, vector: np.ndarray) -> None:
        cursor = self._conn.cursor()
        cursor.execute(
            "INSERT INTO embeddings (message_id, vector) VALUES (?, ?)",
            (message_id, vector.astype(np.float32).tobytes()),
        )
        self._conn.commit()

    def add_summary(self, session_id: str, summary: str) -> None:
        cursor = self._conn.cursor()
        cursor.execute(
            "INSERT INTO summaries (session_id, summary) VALUES (?, ?)",
            (session_id, summary),
        )
        self._conn.commit()

    def recent_messages(self, session_id: str, limit: int = 20) -> List[MemoryItem]:
        cursor = self._conn.cursor()
        cursor.execute(
            "SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY id DESC LIMIT ?",
            (session_id, limit),
        )
        rows = cursor.fetchall()
        return [MemoryItem(role=row[0], content=row[1], created_at=row[2]) for row in reversed(rows)]

    def summaries(self, session_id: str, limit: int = 5) -> List[str]:
        cursor = self._conn.cursor()
        cursor.execute(
            "SELECT summary FROM summaries WHERE session_id = ? ORDER BY id DESC LIMIT ?",
            (session_id, limit),
        )
        return [row[0] for row in cursor.fetchall()]

    def load_index(self) -> None:
        if faiss is None:
            return
        cursor = self._conn.cursor()
        cursor.execute("SELECT message_id, vector FROM embeddings")
        rows = cursor.fetchall()
        if not rows:
            self._index = None
            return
        vectors = np.vstack([np.frombuffer(row[1], dtype=np.float32) for row in rows])
        index = faiss.IndexFlatIP(self.embedding_dim)
        faiss.normalize_L2(vectors)
        index.add(vectors)
        self._index = (index, [row[0] for row in rows])

    def search(self, query_vector: np.ndarray, top_k: int = 5) -> List[int]:
        if faiss is None:
            return []
        if self._index is None:
            self.load_index()
        if self._index is None:
            return []
        index, message_ids = self._index
        query = query_vector.astype(np.float32)[None, :]
        faiss.normalize_L2(query)
        scores, ids = index.search(query, top_k)
        return [message_ids[i] for i in ids[0] if i != -1]

    def fetch_messages_by_id(self, message_ids: Iterable[int]) -> List[MemoryItem]:
        cursor = self._conn.cursor()
        results = []
        for message_id in message_ids:
            cursor.execute(
                "SELECT role, content, created_at FROM messages WHERE id = ?",
                (message_id,),
            )
            row = cursor.fetchone()
            if row:
                results.append(MemoryItem(role=row[0], content=row[1], created_at=row[2]))
        return results
