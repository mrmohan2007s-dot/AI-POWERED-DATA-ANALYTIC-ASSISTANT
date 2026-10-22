export interface ColumnSchema {
  name: string;
  dtype: string;
  semantic_type: 'curr' | 'num' | 'cat' | 'text' | 'date';
  missing_count: number;
  distinct_count: number;
  sample_values: any[];
}

export interface DatasetMetadata {
  id: string;
  name: string;
  original_filename: string;
  format: string;
  size_bytes: number;
  size_formatted: string;
  row_count: number;
  column_count: number;
  columns: ColumnSchema[];
  uploaded_at: string;
  is_sample: boolean;
}

export interface PreviewResponse {
  dataset_id: string;
  total_rows: number;
  filtered_rows: number;
  columns: string[];
  rows: Record<string, any>[];
  column_schemas: ColumnSchema[];
}

export interface QueryResult {
  id: string;
  dataset_id: string;
  query_text: string;
  interpreted_logic: string;
  python_pipeline: string;
  sql_equivalent: string;
  rows: Record<string, any>[];
  columns: string[];
  total_rows_matching: number;
  execution_time_ms: number;
  memory_used_mb: number;
  audit_passed: boolean;
  synthesis_errors: number;
}

export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  formatted_value: string;
  unit?: string;
  change_pct: number;
  trend_direction: 'up' | 'down' | 'neutral';
  sparkline: number[];
  subtitle?: string;
}

export interface TimeSeriesPoint {
  period: string;
  actual: number;
  target?: number;
  forecast?: number;
}

export interface ChannelData {
  channel: string;
  value: number;
  share_pct: number;
  color: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TopProductItem {
  rank: number;
  name: string;
  category: string;
  value: number;
  formatted_value: string;
  percentage: number;
  units: number;
}

export interface MarginVolumePoint {
  product: string;
  volume: number;
  margin_pct: number;
  revenue: number;
  category: string;
}

export interface AnalyticsDashboardResponse {
  scope: string;
  scope_badge: string;
  record_count: number;
  dataset_name: string;
  kpis: KPIMetric[];
  revenue_trajectory: TimeSeriesPoint[];
  sales_channels: ChannelData[];
  category_breakdown: CategoryData[];
  category_total: string;
  top_products: TopProductItem[];
  margin_volume_matrix: MarginVolumePoint[];
  autonomous_ai_summary: string;
}

export interface KeyFinding {
  id: string;
  tag: string;
  title: string;
  description: string;
  metric_badge?: string;
  sparkline: number[];
}

export interface TrendPattern {
  id: string;
  tag: string;
  title: string;
  description: string;
  multiplier: string;
  trend_data: number[];
}

export interface AnomalyItem {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  impact_amount: string;
  transactions: Record<string, any>[];
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  action_label: string;
  action_type: string;
}

export interface SuggestedQuery {
  query: string;
  tag: string;
  category: string;
}

export interface AIInsightsResponse {
  dataset_id: string;
  dataset_name: string;
  scope: string;
  key_findings: KeyFinding[];
  trends_and_patterns: TrendPattern[];
  anomalies: AnomalyItem[];
  recommendations: Recommendation[];
  suggested_queries: SuggestedQuery[];
  executive_summary: string;
  is_llm_powered: boolean;
}

export interface SettingsState {
  gemini_configured: boolean;
  openai_configured: boolean;
  groq_configured: boolean;
  llm_provider: string;
  max_upload_size_mb: number;
  storage_used_mb: number;
  quota_mb: number;
}
