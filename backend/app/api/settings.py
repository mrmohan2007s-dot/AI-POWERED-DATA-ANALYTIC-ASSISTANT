from fastapi import APIRouter
import os
from app.schemas.models import SettingsUpdate
import app.config as config

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
def get_settings():
    return {
        "gemini_configured": bool(config.GEMINI_API_KEY),
        "openai_configured": bool(config.OPENAI_API_KEY),
        "groq_configured": bool(config.GROQ_API_KEY),
        "llm_provider": config.LLM_PROVIDER,
        "max_upload_size_mb": config.MAX_UPLOAD_SIZE_MB,
        "storage_used_mb": 18.4,
        "quota_mb": 100
    }

@router.post("")
def update_settings(payload: SettingsUpdate):
    if payload.gemini_api_key is not None:
        config.GEMINI_API_KEY = payload.gemini_api_key
        os.environ["GEMINI_API_KEY"] = payload.gemini_api_key
    if payload.openai_api_key is not None:
        config.OPENAI_API_KEY = payload.openai_api_key
        os.environ["OPENAI_API_KEY"] = payload.openai_api_key
    if payload.groq_api_key is not None:
        config.GROQ_API_KEY = payload.groq_api_key
        os.environ["GROQ_API_KEY"] = payload.groq_api_key
    if payload.llm_provider is not None:
        config.LLM_PROVIDER = payload.llm_provider
    return {"status": "success", "message": "Settings updated successfully."}
