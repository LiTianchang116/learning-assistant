import json
import requests
from config import MIMO_API_KEY, LLM_BASE_URL, LLM_MODEL


def chat(messages: list[dict], tools: list[dict] = None, model: str = None) -> dict:
    model_name = model or LLM_MODEL

    headers = {
        "x-api-key": MIMO_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }

    # Extract system message
    system = ""
    chat_messages = []
    for msg in messages:
        if msg["role"] == "system":
            system = msg["content"]
        else:
            chat_messages.append(msg)

    payload = {
        "model": model_name,
        "max_tokens": 4096,
        "messages": chat_messages,
    }
    if system:
        payload["system"] = system
    if tools:
        payload["tools"] = tools

    url = f"{LLM_BASE_URL}/v1/messages"
    resp = requests.post(url, headers=headers, json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()

    result = {"content": ""}
    tool_calls = []

    for block in data.get("content", []):
        if block.get("type") == "text":
            result["content"] += block.get("text", "")
        elif block.get("type") == "tool_use":
            tool_calls.append({
                "id": block.get("id", ""),
                "function": {
                    "name": block.get("name", ""),
                    "arguments": block.get("input", {}),
                },
            })

    if tool_calls:
        result["tool_calls"] = tool_calls

    return result
