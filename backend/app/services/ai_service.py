import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any
import json

from app.schemas.models import (
    AIInsightsResponse, KeyFinding, TrendPattern, AnomalyItem, 
    Recommendation, SuggestedQuery, CopilotChatResponse
)
from app.services.dataset_service import dataset_service
from app.services.query_engine import query_engine
import app.config as config
from app.services.llm_client import complete
from app.services.column_helper import (
    find_numeric_column, find_categorical_column, find_date_column, is_numeric_column
)

class AIService:
    async def generate_insights(self, dataset_id: str, target: str = "query_result", query_result_id: Optional[str] = None) -> AIInsightsResponse:
        df: Optional[pd.DataFrame] = None
        scope_name = "Filtered Results"

        if target == "query_result" and query_result_id:
            df = query_engine.get_query_df(query_result_id)
            qr = query_engine.get_query_result(query_result_id)
            if qr:
                scope_name = f"Query Scope: {qr.query_text[:35]}..."

        if df is None:
            df = dataset_service.get_dataset(dataset_id)
            scope_name = "Full Dataset Scope"

        if df is None:
            raise ValueError(f"Dataset '{dataset_id}' not found for generating insights.")

        df = df.copy()
        meta = dataset_service.get_metadata(dataset_id)
        ds_name = meta.name if meta else "Dataset"

        rev_col = find_numeric_column(df, ["revenue", "sales_amount", "amount", "total", "spend", "salary", "price", "sales"])
        if not rev_col:
            numeric_columns = [column for column in df.columns if pd.api.types.is_numeric_dtype(df[column])]
            rev_col = str(numeric_columns[0]) if numeric_columns else None
        margin_col = find_numeric_column(df, ["profit_margin", "gross_margin", "margin_pct", "margin_percent", "margin"], fallback=False)
        disc_col = find_numeric_column(df, ["discount", "rebate"], fallback=False)
        reg_col = find_categorical_column(df, ["region", "city", "state", "location", "department", "category"], fallback=False)
        order_col = find_categorical_column(df, ["order_id", "order", "id", "code", "sku"], fallback=False)
        prod_col = find_categorical_column(df, ["product_name", "product", "item", "title", "name", "campaign", "sku", "product_id"], fallback=False)

        # 1. Key findings computed from actual data
        key_findings = []
        if reg_col and rev_col and reg_col in df.columns and rev_col in df.columns:
            s_num = pd.to_numeric(df[rev_col], errors='coerce').fillna(0.0)
            temp_df = df.copy()
            temp_df['_val'] = s_num
            reg_agg = temp_df.groupby(reg_col)['_val'].sum().sort_values(ascending=False)
            total_sum = float(reg_agg.sum())
            if len(reg_agg) >= 2 and total_sum > 0:
                top2_share = float(reg_agg.iloc[:2].sum() / total_sum * 100)
                top_reg = str(reg_agg.index[0])
                first_val = float(reg_agg.iloc[0])
                key_findings.append(KeyFinding(
                    id="kf_1",
                    tag=f"{str(reg_col).upper()} CONCENTRATION",
                    title=f"{top_reg} Demand Leader",
                    description=f"Activity heavily concentrated in top {str(reg_col).lower()}s, with top 2 accounting for {top2_share:.1f}% of total volume.",
                    metric_badge=f"₹{first_val / 10000000:.2f} Cr" if first_val >= 10000000 else f"{top2_share:.1f}% Share",
                    sparkline=[]
                ))

        if margin_col and margin_col in df.columns:
            m_num = pd.to_numeric(df[margin_col], errors='coerce').dropna()
            if not m_num.empty:
                avg_margin = float(m_num.mean())
                margin_pct_str = f"{avg_margin * 100:.1f}%" if avg_margin <= 1.0 else f"{avg_margin:.1f}%"
                key_findings.append(KeyFinding(
                    id="kf_2",
                    tag="DISTRIBUTION METRIC",
                    title=f"Distribution Profile ({margin_col})",
                    description=f"Average {margin_col.lower()} across loaded records is calibrated at {margin_pct_str}.",
                    metric_badge=f"Avg: {margin_pct_str}",
                    sparkline=[]
                ))

        if not key_findings:
            key_findings = [
                KeyFinding(
                    id="kf_1",
                    tag="OVERALL PERFORMANCE",
                    title="Active Records Synthesis",
                    description=f"Summary of {len(df):,} records across {len(df.columns)} dataset columns.",
                    metric_badge=f"{len(df):,} Rows",
                    sparkline=[]
                )
            ]

        # 2. Trends & Seasonal Patterns
        trend_patterns = []
        trend_date_col = find_date_column(df)
        if trend_date_col and rev_col:
            trend_df = df[[trend_date_col, rev_col]].copy()
            trend_df[trend_date_col] = pd.to_datetime(trend_df[trend_date_col], errors="coerce")
            trend_df[rev_col] = pd.to_numeric(trend_df[rev_col], errors="coerce")
            trend_df = trend_df.dropna(subset=[trend_date_col, rev_col])
            if not trend_df.empty:
                trend_df["period"] = trend_df[trend_date_col].dt.to_period("M").astype(str)
                monthly = trend_df.groupby("period", sort=True)[rev_col].sum()
                values = [float(value) for value in monthly.tolist()]
                if len(values) >= 2:
                    first, last = values[0], values[-1]
                    change_pct = ((last - first) / abs(first) * 100) if first else 0.0
                    trend_patterns.append(TrendPattern(
                        id="tp_1",
                        tag="OBSERVED MONTHLY CHANGE",
                        title=f"{rev_col} over time",
                        description=f"{rev_col} changed {change_pct:+.1f}% from {monthly.index[0]} to {monthly.index[-1]} in this dataset.",
                        multiplier=f"{change_pct:+.1f}%",
                        trend_data=values,
                    ))

        # 3. Anomalies & Outliers
        anomalies = []
        if disc_col and disc_col in df.columns:
            disc_series = pd.to_numeric(df[disc_col], errors='coerce').fillna(0.0)
            threshold = float(disc_series.mean() + 2 * disc_series.std()) if len(disc_series) > 1 else float("inf")
            anom_df = df[disc_series > threshold].head(5)
            
            anom_transactions = []
            for row_index, r in anom_df.iterrows():
                o_id = str(r[order_col]) if (order_col and order_col in df.columns) else str(row_index)
                p_name = str(r[prod_col]) if (prod_col and prod_col in df.columns) else "(not available)"
                try:
                    disc_val = float(r[disc_col])
                    disc_str = f"{disc_val * 100:.0f}%" if disc_val <= 1.0 else f"{disc_val:.0f}"
                    threshold_str = f"{threshold * 100:.0f}%" if threshold <= 1.0 else f"{threshold:.0f}"
                    over_by = disc_val - threshold
                    impact_str = f"+{over_by * 100:.1f} points" if disc_val <= 1.0 else f"+{over_by:.1f}"
                except Exception:
                    disc_str = str(r[disc_col])
                    threshold_str = str(threshold)
                    impact_str = "Above threshold"

                anom_transactions.append({
                    "order_id": o_id,
                    "product": p_name,
                    "applied_discount": disc_str,
                    "authorized_limit": threshold_str,
                    "margin_impact": impact_str
                })

            if anom_transactions:
                anomalies.append(AnomalyItem(
                    id="anom_1",
                    alert_type="OUTLIER AUDIT",
                    title=f"High {disc_col.title()} Variance",
                    description=f"{len(anom_df)} records where {disc_col.lower()} exceeded normal deviation bounds.",
                    impact_amount=f"{len(anom_df)} items",
                    transactions=anom_transactions
                ))

        # 4. Actionable Business Recommendations
        primary_group = reg_col or cat_col or prod_col
        recommendations = [
            Recommendation(
                id="rec_1",
                category="OPERATIONAL OPTIMIZATION",
                title=f"Compare results by {primary_group}" if primary_group else "Review the dataset summary",
                description="Use the generated breakdown to identify which groups contribute most to the selected metric.",
                action_label="Review Cluster",
                action_type="transfer"
            ),
            Recommendation(
                id="rec_2",
                category="POLICY & GOVERNANCE",
                title="Automate threshold alerts for standard deviation outliers",
                description="Configure automated alerting gates when record metrics diverge beyond 2 standard deviations.",
                action_label="Configure Rule",
                action_type="configure"
            )
        ]

        # 5. Suggested Follow-up Queries
        metric_hint = rev_col or "records"
        category_hint = reg_col or prod_col
        median_value = float(pd.to_numeric(df[metric_hint], errors="coerce").median()) if rev_col and not df.empty else None
        suggested_queries = [
            SuggestedQuery(
                query=f"Show top 10 records by {metric_hint}" if rev_col else "Show top 10 records",
                tag="Leaderboard",
                category="Performance"
            ),
            SuggestedQuery(
                query=f"Show records where {metric_hint} is above {median_value:g}" if median_value is not None else "Show all records",
                tag="Filter",
                category="Analytics"
            ),
            SuggestedQuery(
                query=f"Show top 10 {category_hint} by {metric_hint}" if category_hint and rev_col else "Show all records",
                tag="Distribution",
                category="Summary"
            )
        ]

        exec_summary = f"Summary computed for {ds_name} ({scope_name}): {len(df):,} records across {len(df.columns)} columns."
        if rev_col:
            metric_total = pd.to_numeric(df[rev_col], errors="coerce").sum()
            exec_summary += f" Total {rev_col} is {metric_total:,.2f}."
        if reg_col and rev_col:
            summary_df = df[[reg_col]].copy()
            summary_df["_metric"] = pd.to_numeric(df[rev_col], errors="coerce").fillna(0)
            group_totals = summary_df.groupby(reg_col)["_metric"].sum().sort_values(ascending=False)
            if not group_totals.empty:
                exec_summary += f" Highest {reg_col} group by {rev_col} is {group_totals.index[0]} ({group_totals.iloc[0]:,.2f})."

        # Enhance with Gemini LLM if key is present
        is_llm = False
        if config.LLM_PROVIDER != "local":
            try:
                llm_summary = await self._generate_llm_summary(df, scope_name)
                if llm_summary:
                    exec_summary = llm_summary
                    is_llm = True
            except Exception as e:
                print(f"LLM insight call failed: {e}")

        return AIInsightsResponse(
            dataset_id=dataset_id,
            dataset_name=ds_name,
            scope=scope_name,
            key_findings=key_findings,
            trends_and_patterns=trend_patterns,
            anomalies=anomalies,
            recommendations=recommendations,
            suggested_queries=suggested_queries,
            executive_summary=exec_summary,
            is_llm_powered=is_llm
        )

    async def _generate_llm_summary(self, df: pd.DataFrame, scope_name: str) -> Optional[str]:
        summary_stats = {
            "row_count": len(df),
            "columns": list(df.columns),
            "numeric_summary": df.describe().to_dict() if not df.empty else {}
        }
        prompt = f"""
You are the InsightAI Executive Intelligence Engine.
Analyze the verified statistical metrics below and produce a punchy, factual 3-sentence executive summary.
Scope: {scope_name}
Dataset stats:
{json.dumps(summary_stats, default=str)[:3000]}

Rules:
- State verified facts only.
- Highlight key drivers and stability.
- Keep tone professional and executive.
"""
        return await complete(
            prompt,
            system="Analyze verified dataset statistics and produce a factual executive summary.",
            temperature=0.2,
        )

    async def chat_copilot(self, message: str, dataset_id: str) -> CopilotChatResponse:
        """Answers user questions in the Insight Co-pilot sidebar widget."""
        df = dataset_service.get_dataset(dataset_id)
        if df is None:
            return CopilotChatResponse(
                reply="No active dataset is currently loaded in memory. Please select or upload a dataset to begin cross-reconciliation.",
                suggested_actions=["Upload dataset in Data Sources"]
            )

        numeric_facts = {}
        for column in df.columns:
            values = pd.to_numeric(df[column], errors="coerce").dropna()
            if not values.empty:
                numeric_facts[str(column)] = {
                    "sum": float(values.sum()),
                    "mean": float(values.mean()),
                    "min": float(values.min()),
                    "max": float(values.max()),
                }
        category_facts = {}
        for column in df.columns:
            if column not in numeric_facts:
                category_facts[str(column)] = df[column].astype(str).value_counts().head(5).to_dict()

        if config.LLM_PROVIDER != "local":
            try:
                prompt = f"""
User question about dataset: "{message}"
Verified dataset facts: {json.dumps({"rows": len(df), "numeric": numeric_facts, "categories": category_facts}, default=str)[:7000]}
Provide a concise answer under 100 words. Use only the verified facts above and say when the data cannot answer the question.
"""
                response = await complete(prompt, system="You are a careful data analysis assistant.", temperature=0.2)
                if response:
                    return CopilotChatResponse(reply=response, suggested_actions=["Show summary metrics", "Filter top records", "Analyze trends"])
            except Exception as e:
                print(f"Copilot LLM call failed: {e}")

        # Deterministic answers use the requested column's actual values.
        q = message.lower()
        matching_column = next(
            (column for column in sorted(df.columns, key=lambda value: len(str(value)), reverse=True)
             if str(column).lower() in q),
            None,
        )
        if matching_column is not None:
            numeric_values = pd.to_numeric(df[matching_column], errors="coerce").dropna()
            if not numeric_values.empty:
                if any(term in q for term in ("average", "mean")):
                    reply = f"The average {matching_column} is {numeric_values.mean():,.3f} across {len(numeric_values):,} numeric records."
                elif any(term in q for term in ("total", "sum")):
                    reply = f"The total {matching_column} is {numeric_values.sum():,.3f} across {len(numeric_values):,} numeric records."
                elif any(term in q for term in ("lowest", "minimum", "min value", "smallest")):
                    row = df.loc[numeric_values.idxmin()]
                    reply = f"The lowest {matching_column} is {numeric_values.min():,.3f}. Row details: {row.to_dict()}"
                elif any(term in q for term in ("highest", "maximum", "max value", "largest", "top")):
                    row = df.loc[numeric_values.idxmax()]
                    reply = f"The highest {matching_column} is {numeric_values.max():,.3f}. Row details: {row.to_dict()}"
                else:
                    reply = f"{matching_column} has {len(numeric_values):,} numeric values, with average {numeric_values.mean():,.3f}, minimum {numeric_values.min():,.3f}, and maximum {numeric_values.max():,.3f}."
            else:
                counts = df[matching_column].astype(str).value_counts().head(5)
                reply = f"Most common {matching_column} values: " + ", ".join(f"{name} ({count})" for name, count in counts.items())
            return CopilotChatResponse(reply=reply, suggested_actions=["Show summary metrics", "Filter top records", "Analyze trends"])

        return CopilotChatResponse(
            reply=f"Dataset has {len(df):,} rows and {len(df.columns)} columns. Numeric fields include: {', '.join(numeric_facts) or 'none detected'}. Mention a column name to get its summary.",
            suggested_actions=["Show summary metrics", "Filter top records", "Analyze trends"]
        )

# Global singleton
ai_service = AIService()
