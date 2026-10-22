import io
import pandas as pd
from typing import Optional, Tuple
from app.services.dataset_service import dataset_service
from app.services.query_engine import query_engine

class ExportService:
    def export_data(self, dataset_id: str, format_type: str, query_result_id: Optional[str] = None) -> Tuple[bytes, str, str]:
        """Returns (file_bytes, media_type, filename)"""
        df: Optional[pd.DataFrame] = None
        base_name = "insightai_export"

        if query_result_id:
            df = query_engine.get_query_df(query_result_id)
            base_name = f"query_result_{query_result_id}"

        if df is None:
            df = dataset_service.get_dataset(dataset_id)
            meta = dataset_service.get_metadata(dataset_id)
            if meta:
                base_name = meta.name.rsplit('.', 1)[0]

        if df is None:
            raise ValueError(f"No data available to export for dataset '{dataset_id}'.")

        fmt = format_type.lower()
        if fmt == "csv":
            csv_str = df.to_csv(index=False)
            return csv_str.encode('utf-8'), "text/csv", f"{base_name}.csv"
        elif fmt in ["excel", "xlsx"]:
            buffer = io.BytesIO()
            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name="Results")
            buffer.seek(0)
            return buffer.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", f"{base_name}.xlsx"
        elif fmt == "json":
            json_str = df.to_json(orient="records", date_format="iso", indent=2)
            return json_str.encode('utf-8'), "application/json", f"{base_name}.json"
        else:
            raise ValueError(f"Unsupported export format '{format_type}'.")

export_service = ExportService()
