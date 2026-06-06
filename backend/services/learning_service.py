import json

from services.llm_client import chat
from memory import get_context_messages, add_message

SYSTEM_PROMPT = """你是一个学习路径规划助手。用户会告诉你想学什么、当前水平、目标和可用时间。你需要生成一个详细的学习路径。

你必须以如下JSON格式输出，不要输出其他内容:
{
  "stages": [
    {
      "title": "阶段名称",
      "duration": "预计耗时",
      "resources": ["推荐资源1", "推荐资源2"],
      "description": "阶段描述和学习内容"
    }
  ]
}

要求：
1. 分3-6个阶段，由浅入深
2. 每个阶段推荐具体的学习资源（书籍、课程、项目等）
3. 时间估算要合理
4. 用中文回复"""


def generate_learning_path(subject: str, level: str = "", goal: str = "", time_available: str = "", session_id: str = "") -> dict:
    context = get_context_messages(session_id, "learning")
    user_msg = f"我想学习: {subject}"
    if level:
        user_msg += f"\n当前水平: {level}"
    if goal:
        user_msg += f"\n学习目标: {goal}"
    if time_available:
        user_msg += f"\n可用时间: {time_available}"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(context)
    messages.append({"role": "user", "content": user_msg})

    add_message(session_id, "learning", "user", user_msg)

    resp = chat(messages)
    content = resp.get("content", "")

    add_message(session_id, "learning", "assistant", content[:200])

    # Try to extract JSON
    try:
        start = content.find("{")
        end = content.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(content[start:end])
    except json.JSONDecodeError:
        pass

    # Retry once
    messages.append({"role": "assistant", "content": content})
    messages.append({"role": "user", "content": "请严格按照JSON格式重新输出，不要包含其他文字。"})
    resp = chat(messages)
    content = resp.get("content", "")
    try:
        start = content.find("{")
        end = content.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(content[start:end])
    except json.JSONDecodeError:
        pass

    return {"stages": [], "error": "模型返回格式异常，请重试", "raw": content}
