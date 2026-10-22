from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field

class ColumnSchema(BaseModel):
    name: str
    dtype: str
    semantic_type: str  # 'curr', 'num', 'cat', 'text', 'date'
    missing_count: int
    distinct_count: int
    sample_values: List[Any] = []

class DatasetMetadata(BaseModel):
    id: str
    name: str
    original_filename: str
    format: str
    size_bytes: int
    size_formatted: str
    row_count: int
    column_count: int
    columns: List[ColumnSchema]
    uploaded_at: str
    is_sample: bool = False

class PreviewRequest(BaseModel):
    limit: int = 100
    offset: int = 0
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_asc: bool = True

class PreviewResponse(BaseModel):
    dataset_id: str
    total_rows: int
    filtered_rows: int
    columns: List[str]
    rows: List[Dict[str, Any]]
    column_schemas: List[ColumnSchema]

class QueryFilter(BaseModel):
    column: str
    operator: str  # '==', '!=', '>', '>=', '<', '<=', 'contains', 'in'
    value: Any

class QueryAggregation(BaseModel):
    column: str
    function: str  # 'sum', 'avg', 'count', 'min', 'max'
    alias: Optional[str] = None

class QuerySort(BaseModel):
    column: str
    ascending: bool = True

class QuerySpecification(BaseModel):
    columns: Optional[List[str]] = None
    filters: List[QueryFilter] = []
    group_by: Optional[List[str]] = None
    aggregations: Optional[List[QueryAggregation]] = None
    sort: Optional[List[QuerySort]] = None
    limit: Optional[int] = 10
    explanation: Optional[str] = None

class QueryRequest(BaseModel):
    query_text: str
    deep_mode: bool = False
    custom_spec: Optional[QuerySpecification] = None

class QueryResult(BaseModel):
    id: str
    dataset_id: str
    query_text: str
    interpreted_logic: str
    python_pipeline: str
    sql_equivalent: str
    rows: List[Dict[str, Any]]
    columns: List[str]
    total_rows_matching: int
    execution_time_ms: float
    memory_used_mb: float
    audit_passed: bool = True
    synthesis_errors: int = 0

class AnalyzeRequest(BaseModel):
    target: str = "query_result"  # 'query_result' or 'entire_dataset'
    query_result_id: Optional[str] = None

class KPIMetric(BaseModel):
    id: str
    label: str
    value: Union[str, float, int]
    formatted_value: str
    unit: Optional[str] = ""
    change_pct: float
    trend_direction: str  # 'up', 'down', 'neutral'
    sparkline: List[float] = []
    subtitle: Optional[str] = ""

class TimeSeriesPoint(BaseModel):
    period: str
    actual: float
    target: Optional[float] = None
    forecast: Optional[float] = None

class ChannelData(BaseModel):
    channel: str
    value: float
    share_pct: float
    color: str

class CategoryData(BaseModel):
    category: str
    value: float
    percentage: float
    color: str

class TopProductItem(BaseModel):
    rank: int
    name: str
    category: str
    value: float
    formatted_value: str
    percentage: float
    units: int

class MarginVolumePoint(BaseModel):
    product: str
    volume: int
    margin_pct: float
    revenue: float
    category: str

class AnalyticsDashboardResponse(BaseModel):
    scope: str
    scope_badge: str
    record_count: int
    dataset_name: str
    kpis: List[KPIMetric]
    revenue_trajectory: List[TimeSeriesPoint]
    sales_channels: List[ChannelData]
    category_breakdown: List[CategoryData]
    category_total: str
    top_products: List[TopProductItem]
    margin_volume_matrix: List[MarginVolumePoint]
    autonomous_ai_summary: str

class KeyFinding(BaseModel):
    id: str
    tag: str
    title: str
    description: str
    metric_badge: Optional[str] = None
    sparkline: List[float] = []

class TrendPattern(BaseModel):
    id: str
    tag: str
    title: str
    description: str
    multiplier: str
    trend_data: List[float] = []

class AnomalyItem(BaseModel):
    id: str
    alert_type: str
    title: str
    description: str
    impact_amount: str
    transactions: List[Dict[str, Any]]

class Recommendation(BaseModel):
    id: str
    category: str
    title: str
    description: str
    action_label: str
    action_type: str

class SuggestedQuery(BaseModel):
    query: str
    tag: str
    category: str

class AIInsightsResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    scope: str
    key_findings: List[KeyFinding]
    trends_and_patterns: List[TrendPattern]
    anomalies: List[AnomalyItem]
    recommendations: List[Recommendation]
    suggested_queries: List[SuggestedQuery]
    executive_summary: str
    is_llm_powered: bool

class CopilotChatRequest(BaseModel):
    message: str
    context_scope: Optional[str] = "current_analysis"

class CopilotChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    llm_provider: Optional[str] = None
