import os
import uuid

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from config import TEMP_DIR, MAX_FILE_SIZE
from services.mindmap_service import generate_mindmap, generate_mindmap_from_file, regenerate_mindmap
from services.wordfreq_service import extract_text

router = APIRouter(prefix="/api/mindmap", tags=["思维导图"])


@router.post("/generate")
async def gen_mindmap(
    text: str = Form(None),
    file: UploadFile = File(None),
    session_id: str = Form(...),
):
    if file:
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(400, "文件超过10MB限制")
        content = await file.read()
        tmp_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        tmp_path = os.path.join(TEMP_DIR, tmp_name)
        with open(tmp_path, "wb") as out:
            out.write(content)
        markdown = generate_mindmap_from_file(tmp_path, session_id)
    elif text:
        markdown = generate_mindmap(text, session_id)
    else:
        raise HTTPException(400, "请提供文本或上传文件")

    return {"markdown": markdown}


@router.post("/regenerate")
async def regen_mindmap(
    markdown: str = Form(...),
    feedback: str = Form(...),
    session_id: str = Form(...),
):
    result = regenerate_mindmap(markdown, feedback, session_id)
    return {"markdown": result}
