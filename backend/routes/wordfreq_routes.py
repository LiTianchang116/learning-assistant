import os
import uuid

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse

from config import TEMP_DIR, MAX_FILE_SIZE
from services.wordfreq_service import extract_text, count_words, export_to_excel

router = APIRouter(prefix="/api/wordfreq", tags=["词频分析"])


@router.post("/analyze")
async def analyze_wordfreq(
    files: list[UploadFile] = File(...),
    use_stopwords: bool = Form(True),
    min_freq: int = Form(1),
):
    all_text = []
    for f in files:
        if f.size and f.size > MAX_FILE_SIZE:
            raise HTTPException(400, f"文件 {f.filename} 超过10MB限制")
        ext = os.path.splitext(f.filename)[1].lower()
        if ext not in (".docx", ".pdf", ".txt"):
            raise HTTPException(400, f"不支持的文件格式: {ext}")

        content = await f.read()
        tmp_name = f"{uuid.uuid4().hex[:8]}_{f.filename}"
        tmp_path = os.path.join(TEMP_DIR, tmp_name)
        with open(tmp_path, "wb") as out:
            out.write(content)
        text = extract_text(tmp_path)
        if text:
            all_text.append(text)

    combined = "\n".join(all_text)
    if not combined.strip():
        raise HTTPException(400, "未能从文件中提取到文本")

    items = count_words(combined, use_stopwords=use_stopwords, min_freq=min_freq)
    return {"words": items, "total_unique": len(items)}


@router.post("/export")
async def export_excel(words: str = Form(...)):
    import json
    word_list = json.loads(words)
    path = export_to_excel(word_list)
    return FileResponse(path, filename="wordfreq_result.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
