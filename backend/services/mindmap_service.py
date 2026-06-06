from services.llm_client import chat
from services.wordfreq_service import extract_text
from memory import get_context_messages, add_message

SYSTEM_PROMPT = """你是一个知识点提取和思维导图生成助手。用户会提供一段文本，你需要提取其中的关键知识点，并以层级Markdown标题格式输出思维导图结构。

要求：
1. 只输出Markdown标题格式（# ## ### ####等），不要任何解释性文字
2. 一级标题(#)是主题，二级标题(##)是主要知识点，三级标题(###)是子知识点
3. 层级最多4层
4. 内容要精炼，每个节点不超过15个字
5. 确保覆盖所有重要内容"""


def generate_mindmap(text: str, session_id: str) -> str:
    context = get_context_messages(session_id, "mindmap")
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(context)
    messages.append({"role": "user", "content": f"请将以下内容提取为思维导图:\n\n{text[:8000]}"})

    add_message(session_id, "mindmap", "user", f"生成思维导图（输入{text[:50]}...）")

    resp = chat(messages)
    content = resp.get("content", "")
    add_message(session_id, "mindmap", "assistant", content[:200])
    return content


def generate_mindmap_from_file(file_path: str, session_id: str) -> str:
    text = extract_text(file_path)
    if not text.strip():
        return "Error: 无法从文件中提取文本"
    return generate_mindmap(text, session_id)


def regenerate_mindmap(markdown: str, feedback: str, session_id: str) -> str:
    context = get_context_messages(session_id, "mindmap")
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(context)
    messages.append({"role": "user", "content": f"之前的思维导图:\n{markdown}\n\n请根据以下反馈重新生成:\n{feedback}"})

    add_message(session_id, "mindmap", "user", f"重新生成: {feedback[:50]}")

    resp = chat(messages)
    content = resp.get("content", "")
    add_message(session_id, "mindmap", "assistant", content[:200])
    return content
