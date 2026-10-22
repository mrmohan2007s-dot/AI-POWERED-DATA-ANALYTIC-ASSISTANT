from fastapi import APIRouter, HTTPException
from typing import Optional

from app.schemas.models import AnalyzeRequest, AnalyticsDashboardResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/datasets", tags=["Analytics"])

@router.post("/{dataset_id}/analyze", response_model=AnalyticsDashboardResponse)
def analyze_dataset(dataset_id: str, request: AnalyzeRequest):
    try:
        return analytics_service.analyze(
            dataset_id=dataset_id,
            target=request.target,
            query_result_id=request.query_result_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics computation failed: {str(e)}")
