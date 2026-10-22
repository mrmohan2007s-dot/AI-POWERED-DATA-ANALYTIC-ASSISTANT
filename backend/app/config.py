import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "100"))
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini" if GEMINI_API_KEY else "local")
