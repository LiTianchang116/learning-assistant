import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from cleanup import start_cleanup_loop
from routes.format_routes import router as format_router
from routes.wordfreq_routes import router as wordfreq_router
from routes.mindmap_routes import router as mindmap_router
from routes.learning_routes import router as learning_router
from routes.chat_routes import router as chat_router

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

app = FastAPI(title="全能学习助手", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(format_router)
app.include_router(wordfreq_router)
app.include_router(mindmap_router)
app.include_router(learning_router)
app.include_router(chat_router)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.on_event("startup")
def startup():
    start_cleanup_loop()


@app.get("/")
def root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
