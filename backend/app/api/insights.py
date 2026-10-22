from fastapi import APIRouter, HTTPException
from typing import Optional

from app.schemas.models import (
    AnalyzeRequest, AIInsightsResponse, CopilotChatRequest, CopilotChatResponse
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/datasets", tags=["AI Insights"])

@router.post("/{dataset_id}/insights", response_model=AIInsightsResponse)
async def get_ai_insights(dataset_id: str, request: AnalyzeRequest):
    try:
        return await ai_service.generate_insights(
            dataset_id=dataset_id,
            target=request.target,
            query_result_id=request.query_result_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight generation failed: {str(e)}")

@router.post("/{dataset_id}/copilot", response_model=CopilotChatResponse)
async def copilot_chat(dataset_id: str, request: CopilotChatRequest):
    try:
        return await ai_service.chat_copilot(request.message, dataset_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot query failed: {str(e)}")
