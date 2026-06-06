from fastapi import APIRouter, Form

from services.llm_client import chat
from memory import get_context_messages, add_message

router = APIRouter(prefix="/api/chat", tags=["通用对话"])

SYSTEM_PROMPT = "你是诗语，一个全能学习助手。用中文回复，简洁友好。"


@router.post("/send")
async def chat_send(
    message: str = Form(...),
    session_id: str = Form(...),
):
    context = get_context_messages(session_id, "chat")
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(context)
    messages.append({"role": "user", "content": message})

    add_message(session_id, "chat", "user", message)

    resp = chat(messages)
    content = resp.get("content", "")

    add_message(session_id, "chat", "assistant", content[:500])

    return {"reply": content}
