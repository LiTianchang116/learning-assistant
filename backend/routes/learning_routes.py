from fastapi import APIRouter, Form

from services.learning_service import generate_learning_path

router = APIRouter(prefix="/api/learning", tags=["学习路径"])


@router.post("/generate")
async def gen_learning_path(
    subject: str = Form(...),
    level: str = Form(""),
    goal: str = Form(""),
    time_available: str = Form(""),
    session_id: str = Form(...),
):
    result = generate_learning_path(subject, level, goal, time_available, session_id)
    return result
