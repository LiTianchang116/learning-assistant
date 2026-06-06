import os
import uuid
import shutil
import traceback

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse

from config import TEMP_DIR, MAX_FILE_SIZE
from services.format_service import process_format_request

router = APIRouter(prefix="/api/format", tags=["格式修改"])


@router.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    paths = []
    for f in files:
        if f.size and f.size > MAX_FILE_SIZE:
            raise HTTPException(400, f"文件 {f.filename} 超过10MB限制")
        if not f.filename.endswith(".docx"):
            raise HTTPException(400, f"文件 {f.filename} 不是.docx格式")
        name = f"{uuid.uuid4().hex[:8]}_{f.filename}"
        path = os.path.join(TEMP_DIR, name)
        with open(path, "wb") as out:
            content = await f.read()
            out.write(content)
        paths.append({"path": path, "filename": f.filename})
    return {"files": paths}


@router.post("/modify")
async def modify_documents(
    file_paths: list[str] = Form(...),
    message: str = Form(...),
    session_id: str = Form(...),
):
    for p in file_paths:
        if not os.path.exists(p):
            raise HTTPException(400, f"文件不存在: {p}")
    try:
        result = process_format_request(file_paths, message, session_id)
        return result
    except Exception as e:
        import sys
        print(f"\n\n===== ERROR =====\n{traceback.format_exc()}\n=================\n", file=sys.stderr, flush=True)
        raise HTTPException(500, str(e))


@router.get("/download/{filename}")
async def download_file(filename: str):
    path = os.path.join(TEMP_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(404, "文件不存在")
    return FileResponse(path, filename=filename)
