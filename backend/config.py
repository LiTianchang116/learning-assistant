import os
from dotenv import load_dotenv

load_dotenv()

MIMO_API_KEY = os.getenv("MIMO_API_KEY", "")
LLM_BASE_URL = "https://token-plan-cn.xiaomimimo.com/anthropic"
LLM_MODEL = "mimo-v2-pro"

TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
HISTORY_MAX_ROUNDS = 10
CLEANUP_INTERVAL = 3600  # 1 hour
