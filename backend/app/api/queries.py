from fastapi import APIRouter, HTTPException
from typing import Optional

from app.schemas.models import QueryRequest, QueryResult
from app.services.query_engine import query_engine

router = APIRouter(prefix="/api/datasets", tags=["Queries"])

@router.post("/{dataset_id}/query", response_model=QueryResult)
async def execute_dataset_query(dataset_id: str, request: QueryRequest):
    if not request.query_text.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    try:
        result = await query_engine.execute_query(dataset_id, request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query execution error: {str(e)}")

@router.get("/queries/{result_id}", response_model=QueryResult)
def get_query_result(result_id: str):
    result = query_engine.get_query_result(result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Query result not found.")
    return result
