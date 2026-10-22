from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import Response
from typing import List, Optional

from app.schemas.models import DatasetMetadata, PreviewResponse
from app.services.dataset_service import dataset_service
from app.services.export_service import export_service

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])

@router.get("", response_model=List[DatasetMetadata])
def list_datasets():
    return dataset_service.list_datasets()

@router.post("/upload", response_model=DatasetMetadata)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")
    try:
        content = await file.read()
        metadata = dataset_service.upload_dataset(content, file.filename)
        return metadata
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")

@router.get("/{dataset_id}/metadata", response_model=DatasetMetadata)
def get_dataset_metadata(dataset_id: str):
    meta = dataset_service.get_metadata(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return meta

@router.get("/{dataset_id}/preview", response_model=PreviewResponse)
def preview_dataset(
    dataset_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_asc: bool = True
):
    try:
        return dataset_service.preview_dataset(
            dataset_id=dataset_id,
            limit=limit,
            offset=offset,
            search=search,
            sort_by=sort_by,
            sort_asc=sort_asc
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("", response_model=dict)
def clear_all_datasets():
    count = dataset_service.clear_all_datasets()
    return {"status": "success", "message": f"Cleared {count} datasets.", "cleared_count": count}

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str):
    success = dataset_service.delete_dataset(dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return {"status": "success", "message": f"Dataset {dataset_id} deleted."}

@router.get("/{dataset_id}/export")
def export_dataset(
    dataset_id: str,
    format: str = Query("csv", pattern="^(csv|excel|xlsx|json)$"),
    query_result_id: Optional[str] = None
):
    try:
        content, media_type, filename = export_service.export_data(dataset_id, format, query_result_id)
        return Response(
            content=content,
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
