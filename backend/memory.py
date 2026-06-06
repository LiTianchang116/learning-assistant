import json
import os
import threading
from datetime import datetime

from config import TEMP_DIR

HISTORY_FILE = os.path.join(TEMP_DIR, "chat_history.json")
_lock = threading.Lock()


def _load() -> dict:
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save(data: dict):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_history(session_id: str, feature: str) -> list[dict]:
    with _lock:
        data = _load()
        key = f"{session_id}:{feature}"
        return data.get(key, [])


def add_message(session_id: str, feature: str, role: str, content: str):
    with _lock:
        data = _load()
        key = f"{session_id}:{feature}"
        if key not in data:
            data[key] = []
        data[key].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })
        # Keep last 20 messages (10 rounds)
        data[key] = data[key][-20:]
        _save(data)


def get_context_messages(session_id: str, feature: str, max_rounds: int = 10) -> list[dict]:
    history = get_history(session_id, feature)
    messages = []
    for msg in history[-max_rounds * 2:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    return messages
