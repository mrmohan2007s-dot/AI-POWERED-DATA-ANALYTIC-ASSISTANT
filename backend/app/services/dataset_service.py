import os
import re
import uuid
import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
import numpy as np

from app.config import UPLOAD_DIR, SAMPLE_DATA_DIR, ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_MB
from app.schemas.models import DatasetMetadata, ColumnSchema, PreviewResponse

class DatasetService:
    def __init__(self):
        self._cache: Dict[str, pd.DataFrame] = {}
        self._metadata_cache: Dict[str, DatasetMetadata] = {}
        # Keep uploaded datasets available after a backend restart.
        for path in UPLOAD_DIR.iterdir():
            if not path.is_file():
                continue
            match = re.match(r"^(ds_[a-f0-9]+)_(.+)$", path.name, re.IGNORECASE)
            if match:
                self._load_from_path(path, match.group(1), match.group(2))

        # Ensure sample files exist on disk if not present, but do NOT
        # automatically connect them as active datasets.
        self._ensure_sample_files()

    def _infer_semantic_type(self, col_name: str, dtype: str, sample_series: pd.Series) -> str:
        col_lower = str(col_name).lower()
        if any(w in col_lower for w in ["revenue", "amount", "price", "sales_amount", "cost", "profit", "margin", "budget", "spend", "salary", "fee"]):
            return "curr"
        elif any(w in col_lower for w in ["date", "time", "created_at", "timestamp", "year", "month"]):
            return "date"
        elif any(w in col_lower for w in ["id", "code", "sku", "key", "uuid"]):
            return "text"
        elif pd.api.types.is_numeric_dtype(sample_series):
            try:
                if sample_series.nunique() < 10:
                    return "cat"
            except Exception:
                pass
            return "num"
        else:
            try:
                if sample_series.nunique() <= 30:
                    return "cat"
            except Exception:
                pass
            return "text"

    @staticmethod
    def _sanitize_column_names(df: pd.DataFrame) -> pd.DataFrame:
        cols = []
        counts: Dict[str, int] = {}
        for column in df.columns:
            clean_name = str(column).strip() or "Unnamed"
            if clean_name in counts:
                counts[clean_name] += 1
                cols.append(f"{clean_name}_{counts[clean_name]}")
            else:
                counts[clean_name] = 0
                cols.append(clean_name)
        df.columns = cols
        return df

    def _build_metadata(self, df: pd.DataFrame, dataset_id: str, name: str, filename: str, file_path: Path, is_sample: bool = False) -> DatasetMetadata:
        columns_schema = []
        for col in df.columns:
            series = df[col]
            dtype_str = str(series.dtype)
            semantic = self._infer_semantic_type(str(col), dtype_str, series.dropna().head(100))
            
            # Extract sample values safely (clean numpy types to python native)
            samples = []
            for x in series.dropna().head(5).tolist():
                if pd.isna(x):
                    samples.append(None)
                elif isinstance(x, bool) or isinstance(x, (np.bool_,)):
                    samples.append(bool(x))
                elif isinstance(x, (np.floating, float)):
                    samples.append(round(float(x), 4))
                elif isinstance(x, (np.integer, int)):
                    samples.append(int(x))
                elif isinstance(x, (datetime.date, datetime.datetime, pd.Timestamp)):
                    samples.append(str(x)[:10])
                else:
                    samples.append(str(x))
            
            try:
                missing_cnt = int(series.isna().sum())
            except Exception:
                missing_cnt = 0

            try:
                distinct_cnt = int(series.nunique())
            except Exception:
                distinct_cnt = len(series.dropna())

            columns_schema.append(ColumnSchema(
                name=str(col),
                dtype=dtype_str,
                semantic_type=semantic,
                missing_count=missing_cnt,
                distinct_count=distinct_cnt,
                sample_values=samples
            ))

        size_bytes = file_path.stat().st_size if file_path.exists() else len(df) * 128
        size_mb = size_bytes / (1024 * 1024)
        size_formatted = f"{size_mb:.1f} MB" if size_mb >= 1.0 else f"{size_bytes / 1024:.1f} KB"

        return DatasetMetadata(
            id=dataset_id,
            name=name,
            original_filename=filename,
            format=file_path.suffix.lstrip(".").upper() if file_path.exists() else "CSV",
            size_bytes=size_bytes,
            size_formatted=size_formatted,
            row_count=len(df),
            column_count=len(df.columns),
            columns=columns_schema,
            uploaded_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            is_sample=is_sample
        )

    def _ensure_sample_files(self):
        """Generates realistic sample files on disk if not present, but does not auto-connect them."""
        sales_csv_path = SAMPLE_DATA_DIR / "sales_performance_q4_2026.csv"
        churn_xlsx_path = SAMPLE_DATA_DIR / "customer_churn_analysis.xlsx"
        leads_csv_path = SAMPLE_DATA_DIR / "marketing_leads_spend.csv"
        budget_csv_path = SAMPLE_DATA_DIR / "financials_budget_2026.csv"

        if not sales_csv_path.exists():
            np.random.seed(42)
            n_rows = 15000

            products = [
                ("NeuralEdge Workstation Pro", "Compute & Hardware", 1980000, 0.424),
                ("Titan 7000 Vector Server", "Cloud Infrastructure", 1420000, 0.381),
                ("CyberShield SecureRack Unit", "Network Security", 980000, 0.295),
                ("Architect SDX Switch Spine", "Networking", 860000, 0.332),
                ("Synapse AI Accelerator Card", "Machine Learning", 590000, 0.245),
                ("OmniGuard Threat Appliance", "Network Security", 750000, 0.310),
                ("OptiFlow Tokyo Gateway 800", "IoT & Edge", 680000, 0.280),
                ("SolidPoint Alert 9900 XL-PWR", "Infrastructure", 520000, 0.210),
                ("FluxLine Xeon Transceiver A500", "Optics", 460000, 0.350),
                ("InsightAI Enterprise Cloud Core", "Analytics SaaS", 780000, 0.550)
            ]

            regions = ["Chennai", "Chennai South", "Bangalore", "Mumbai", "Delhi", "Hyderabad"]
            region_weights = [0.35, 0.20, 0.20, 0.10, 0.10, 0.05]
            channels = ["B2B Enterprise", "Direct Web", "Retail Hub"]
            channel_weights = [0.55, 0.30, 0.15]
            segments = ["Enterprise", "Mid-Market", "SMB"]
            reps = ["Arjun Sharma", "Priya Nair", "Vikram Rathore", "Neha Gupta", "Kavita Rao"]

            rows = []
            start_date = datetime.date(2026, 10, 1)
            end_date = datetime.date(2026, 12, 31)
            date_range_days = (end_date - start_date).days

            for i in range(n_rows):
                p_idx = np.random.choice(len(products))
                p_name, p_cat, base_price, base_margin = products[p_idx]
                region = np.random.choice(regions, p=region_weights)
                channel = np.random.choice(channels, p=channel_weights)
                segment = np.random.choice(segments, p=[0.6, 0.3, 0.1])
                rep = np.random.choice(reps)
                
                day_offset = np.random.randint(0, date_range_days + 1)
                order_date = start_date + datetime.timedelta(days=day_offset)
                
                units = np.random.choice([1, 2, 4, 6, 8, 12, 18, 25], p=[0.3, 0.25, 0.15, 0.1, 0.08, 0.06, 0.04, 0.02])
                discount = np.random.choice([0.0, 0.05, 0.10, 0.15, 0.20, 0.25], p=[0.4, 0.3, 0.15, 0.08, 0.05, 0.02])
                revenue = int(base_price * units * (1.0 - discount))
                margin_pct = round(base_margin - (discount * 0.4) + np.random.uniform(-0.02, 0.02), 3)

                rows.append({
                    "Order ID": f"ORD-{90000 + i}",
                    "Product Name": p_name,
                    "Category": p_cat,
                    "Region": region,
                    "Segment": segment,
                    "Channel": channel,
                    "Revenue": revenue,
                    "Units Sold": units,
                    "Profit Margin": margin_pct,
                    "Discount Applied": discount,
                    "Sales Rep": rep,
                    "Order Date": order_date.strftime("%Y-%m-%d"),
                    "Status": np.random.choice(["Completed", "Shipped", "Processing"], p=[0.85, 0.10, 0.05])
                })

            df_sales = pd.DataFrame(rows)
            df_sales.to_csv(sales_csv_path, index=False)

        if not churn_xlsx_path.exists():
            churn_data = {
                "CustomerID": [f"CUST-{1000 + i}" for i in range(500)],
                "Contract": np.random.choice(["Month-to-month", "One year", "Two year"], 500),
                "MonthlyCharges": np.random.uniform(29.9, 119.9, 500).round(2),
                "TenureMonths": np.random.randint(1, 72, 500),
                "TechSupport": np.random.choice(["Yes", "No"], 500),
                "Churn": np.random.choice(["Yes", "No"], 500, p=[0.24, 0.76])
            }
            pd.DataFrame(churn_data).to_excel(churn_xlsx_path, index=False)

        if not leads_csv_path.exists():
            leads_data = {
                "Campaign": [f"Campaign {c}" for c in ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"] for _ in range(100)],
                "Channel": np.random.choice(["Google Ads", "LinkedIn", "Direct Mail", "Webinar"], 500),
                "Spend": np.random.uniform(5000, 50000, 500).round(2),
                "LeadsGenerated": np.random.randint(20, 400, 500),
                "Conversions": np.random.randint(2, 60, 500)
            }
            pd.DataFrame(leads_data).to_csv(leads_csv_path, index=False)

        if not budget_csv_path.exists():
            budget_data = {
                "Department": ["Engineering", "Sales", "Marketing", "Operations", "R&D"] * 12,
                "Month": [f"2026-{m:02d}" for m in range(1, 13) for _ in range(5)],
                "BudgetAllocated": np.random.uniform(100000, 800000, 60).round(2),
                "ActualSpend": np.random.uniform(90000, 850000, 60).round(2)
            }
            pd.DataFrame(budget_data).to_csv(budget_csv_path, index=False)

    def _load_from_path(self, path: Path, dataset_id: str, name: str, is_sample: bool = False):
        try:
            if path.suffix.lower() == ".csv":
                try:
                    df = pd.read_csv(path, encoding='utf-8')
                except UnicodeDecodeError:
                    df = pd.read_csv(path, encoding='latin1')
            elif path.suffix.lower() in [".xlsx", ".xls"]:
                df = pd.read_excel(path)
            else:
                return

            df = self._sanitize_column_names(df)

            self._cache[dataset_id] = df
            self._metadata_cache[dataset_id] = self._build_metadata(
                df, dataset_id=dataset_id, name=name, filename=name, file_path=path, is_sample=is_sample
            )
        except Exception as e:
            print(f"Error loading {path}: {e}")

    def list_datasets(self) -> List[DatasetMetadata]:
        return list(self._metadata_cache.values())

    def get_dataset(self, dataset_id: str) -> Optional[pd.DataFrame]:
        return self._cache.get(dataset_id)

    def get_metadata(self, dataset_id: str) -> Optional[DatasetMetadata]:
        return self._metadata_cache.get(dataset_id)

    def upload_dataset(self, file_content: bytes, filename: str) -> DatasetMetadata:
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

        size_bytes = len(file_content)
        if size_bytes > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise ValueError(f"File size exceeds maximum allowed limit of {MAX_UPLOAD_SIZE_MB}MB.")
        current_storage = sum(path.stat().st_size for path in UPLOAD_DIR.iterdir() if path.is_file())
        if current_storage + size_bytes > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise ValueError(f"Workspace storage quota of {MAX_UPLOAD_SIZE_MB}MB would be exceeded.")

        dataset_id = f"ds_{uuid.uuid4().hex[:10]}"
        safe_filename = f"{dataset_id}_{Path(filename).name}"
        save_path = UPLOAD_DIR / safe_filename

        with open(save_path, "wb") as f:
            f.write(file_content)

        try:
            if ext == ".csv":
                try:
                    df = pd.read_csv(save_path, encoding='utf-8')
                except UnicodeDecodeError:
                    try:
                        df = pd.read_csv(save_path, encoding='utf-8-sig')
                    except UnicodeDecodeError:
                        df = pd.read_csv(save_path, encoding='latin1')
            else:
                df = pd.read_excel(save_path)
        except Exception as e:
            if save_path.exists():
                save_path.unlink()
            raise ValueError(f"Could not parse uploaded file: {str(e)}")

        if df.empty:
            if save_path.exists():
                save_path.unlink()
            raise ValueError("Uploaded file is empty.")

        df = self._sanitize_column_names(df)

        self._cache[dataset_id] = df
        metadata = self._build_metadata(df, dataset_id=dataset_id, name=filename, filename=filename, file_path=save_path, is_sample=False)
        self._metadata_cache[dataset_id] = metadata
        return metadata

    def preview_dataset(self, dataset_id: str, limit: int = 100, offset: int = 0, search: Optional[str] = None, sort_by: Optional[str] = None, sort_asc: bool = True) -> PreviewResponse:
        df = self.get_dataset(dataset_id)
        if df is None:
            raise ValueError(f"Dataset '{dataset_id}' not found.")

        meta = self.get_metadata(dataset_id)
        total_rows = len(df)
        filtered_df = df

        if search:
            search_str = search.lower()
            mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(search_str, regex=False)).any(axis=1)
            filtered_df = filtered_df[mask]

        if sort_by and sort_by in filtered_df.columns:
            filtered_df = filtered_df.sort_values(by=sort_by, ascending=sort_asc)

        filtered_count = len(filtered_df)
        paged_df = filtered_df.iloc[offset : offset + limit]

        # Convert to JSON-compatible dictionaries
        clean_rows = []
        for _, row in paged_df.iterrows():
            clean_row = {}
            for col, val in row.items():
                k = str(col)
                if pd.isna(val):
                    clean_row[k] = None
                elif isinstance(val, bool) or isinstance(val, (np.bool_,)):
                    clean_row[k] = bool(val)
                elif isinstance(val, (np.floating, float)):
                    clean_row[k] = round(float(val), 4)
                elif isinstance(val, (np.integer, int)):
                    clean_row[k] = int(val)
                elif isinstance(val, (datetime.date, datetime.datetime, pd.Timestamp)):
                    clean_row[k] = str(val)[:10]
                else:
                    clean_row[k] = str(val)
            clean_rows.append(clean_row)

        return PreviewResponse(
            dataset_id=dataset_id,
            total_rows=total_rows,
            filtered_rows=filtered_count,
            columns=[str(c) for c in df.columns],
            rows=clean_rows,
            column_schemas=meta.columns if meta else []
        )

    def delete_dataset(self, dataset_id: str) -> bool:
        deleted = False
        if dataset_id in self._cache:
            del self._cache[dataset_id]
            deleted = True
        if dataset_id in self._metadata_cache:
            del self._metadata_cache[dataset_id]
            deleted = True
        for f in UPLOAD_DIR.glob(f"{dataset_id}*"):
            try:
                f.unlink()
                deleted = True
            except Exception:
                pass
        return deleted

    def clear_all_datasets(self) -> int:
        count = len(self._metadata_cache)
        self._cache.clear()
        self._metadata_cache.clear()
        for f in UPLOAD_DIR.glob("*"):
            try:
                if f.is_file():
                    f.unlink()
            except Exception:
                pass
        return count

# Global singleton
dataset_service = DatasetService()
