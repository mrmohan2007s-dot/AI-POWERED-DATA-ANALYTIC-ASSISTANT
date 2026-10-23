import pandas as pd
import numpy as np
from typing import Optional, Dict, Any, List

from app.schemas.models import (
    AnalyticsDashboardResponse, KPIMetric, TimeSeriesPoint, 
    ChannelData, CategoryData, TopProductItem, MarginVolumePoint
)
from app.services.dataset_service import dataset_service
from app.services.query_engine import query_engine
from app.services.column_helper import (
    find_numeric_column, find_categorical_column, find_date_column, is_numeric_column
)

def format_inr(val: float) -> str:
    if val >= 10000000:
        return f"₹{val / 10000000:.2f} Cr"
    elif val >= 100000:
        return f"₹{val / 100000:.2f} Lakh"
    elif val >= 1000:
        return f"₹{val:,.0f}"
    else:
        return f"₹{val:.2f}"

def format_metric_value(val: float, column: Optional[str]) -> str:
    currency_terms = ("revenue", "sales", "amount", "price", "cost", "profit", "spend", "budget", "salary", "fee")
    if column and any(term in column.lower() for term in currency_terms):
        return format_inr(val)
    return f"{val:,.2f}" if not float(val).is_integer() else f"{int(val):,}"

class AnalyticsService:
    def analyze(self, dataset_id: str, target: str = "query_result", query_result_id: Optional[str] = None) -> AnalyticsDashboardResponse:
        df: Optional[pd.DataFrame] = None
        scope_badge: str = ""
        scope_title: str = ""

        # Retrieve dataframe based on user choice
        if target == "query_result" and query_result_id:
            df = query_engine.get_query_df(query_result_id)
            qr = query_engine.get_query_result(query_result_id)
            if df is not None and qr is not None:
                scope_badge = f"Query Scope: {qr.query_text[:40]}..."
                scope_title = f"Filtered Query Results ({len(df)} records)"

        if df is None:
            # Fallback to entire dataset
            df = dataset_service.get_dataset(dataset_id)
            meta = dataset_service.get_metadata(dataset_id)
            ds_name = meta.name if meta else "Dataset"
            scope_badge = "Scope: Entire Dataset"
            scope_title = f"Comprehensive Overview ({ds_name})"

        if df is None:
            raise ValueError(f"Dataset '{dataset_id}' could not be loaded for analysis.")

        df = df.copy()
        meta = dataset_service.get_metadata(dataset_id)
        ds_name = meta.name if meta else "Dataset"

        # 1. Identify relevant columns dynamically with numeric verification
        rev_col = find_numeric_column(df, ["revenue", "sales_amount", "amount", "total", "spend", "salary", "price", "sales"])
        if not rev_col:
            numeric_candidates = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
            rev_col = str(numeric_candidates[0]) if numeric_candidates else None
        units_col = find_numeric_column(df, ["quantity_sold", "quantity", "units", "qty", "orders", "count"], fallback=False)
        margin_col = find_numeric_column(df, ["profit_margin", "gross_margin", "margin_pct", "margin_percent", "margin"], fallback=False)

        region_col = find_categorical_column(df, ["region", "city", "state", "location", "country", "branch"], fallback=False)
        cat_col = find_categorical_column(df, ["product_category", "category", "department", "segment", "type", "channel"], fallback=False)
        prod_col = find_categorical_column(df, ["product_name", "product", "item", "title", "name", "campaign", "sku", "product_id"], fallback=False)
        date_col = find_date_column(df)
        channel_col = find_categorical_column(df, ["sales_channel", "channel", "payment_method", "source"], fallback=False)
        # Keep the group chart useful for general datasets that have no
        # channel-like field. Prefer another real categorical dimension.
        if not channel_col:
            channel_col = region_col or find_categorical_column(
                df, ["category", "segment", "department", "type"], fallback=True
            )

        # Clean numeric series
        if rev_col and rev_col in df.columns:
            df[rev_col] = pd.to_numeric(df[rev_col], errors='coerce').fillna(0.0)
        if units_col and units_col in df.columns:
            df[units_col] = pd.to_numeric(df[units_col], errors='coerce').fillna(0.0)
        if margin_col and margin_col in df.columns:
            df[margin_col] = pd.to_numeric(df[margin_col], errors='coerce').fillna(0.0)

        # 2. Compute KPIs
        # Total Revenue / Primary Metric
        if rev_col and rev_col in df.columns:
            total_rev = float(df[rev_col].sum())
            rev_label = f"TOTAL {rev_col.upper()}"
        else:
            total_rev = 0.0
            rev_label = "TOTAL NUMERIC VALUE"

        # Total Units / Orders
        if units_col and units_col in df.columns:
            total_units = int(df[units_col].sum())
        else:
            total_units = len(df)

        # Average Order Value (AOV)
        aov = (total_rev / total_units) if total_units > 0 else 0

        # Top Performing Region
        top_region_name = "Global Market"
        top_region_share = "100%"
        if region_col and region_col in df.columns:
            reg_counts = df[region_col].value_counts()
            if not reg_counts.empty:
                top_reg = reg_counts.index[0]
                pct = (reg_counts.iloc[0] / max(1, len(df))) * 100
                top_region_name = str(top_reg)
                top_region_share = f"{pct:.1f}% share"

        kpis = [
            KPIMetric(
                id="kpi_rev",
                label=rev_label,
                value=total_rev,
                formatted_value=format_metric_value(total_rev, rev_col),
                change_pct=0,
                trend_direction="neutral",
                sparkline=[total_rev],
                subtitle="current dataset total"
            ),
            KPIMetric(
                id="kpi_orders",
                label="TOTAL ORDERS / UNITS",
                value=total_units,
                formatted_value=f"{total_units:,}",
                unit="units",
                change_pct=0,
                trend_direction="neutral",
                sparkline=[total_units],
                subtitle="current dataset total"
            ),
            KPIMetric(
                id="kpi_aov",
                label="AVERAGE VALUE (AOV)",
                value=aov,
                formatted_value=format_metric_value(aov, rev_col),
                change_pct=0,
                trend_direction="neutral",
                sparkline=[aov],
                subtitle="current dataset average"
            ),
            KPIMetric(
                id="kpi_region",
                label=f"TOP {region_col.upper() if region_col else 'SEGMENT'}",
                value=top_region_name,
                formatted_value=top_region_name,
                unit=top_region_share,
                change_pct=0,
                trend_direction="neutral",
                sparkline=[],
                subtitle="largest category by record count"
            )
        ]

        # 3. Trajectory Chart
        trajectory = []
        if date_col and date_col in df.columns and rev_col and rev_col in df.columns:
            temp_df = df.copy()
            temp_df['dt'] = pd.to_datetime(temp_df[date_col], errors='coerce')
            temp_df = temp_df.dropna(subset=['dt']).sort_values('dt')
            if not temp_df.empty:
                temp_df['period'] = temp_df['dt'].dt.to_period('M').astype(str)
                grouped = temp_df.groupby('period', sort=True)[rev_col].sum().head(12)
                for p, val in grouped.items():
                    act = float(val)
                    trajectory.append(TimeSeriesPoint(period=str(p), actual=act))

        # 4. Channels / Groups (Bar chart)
        channel_data = []
        palette = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]
        effective_ch_col = channel_col if (channel_col and channel_col in df.columns) else None
        if effective_ch_col and effective_ch_col in df.columns and rev_col and rev_col in df.columns:
            ch_grp = df.groupby(effective_ch_col)[rev_col].sum().sort_values(ascending=False).head(4)
            ch_total = float(ch_grp.sum())
            for idx, (ch, val) in enumerate(ch_grp.items()):
                v = float(val)
                share = (v / ch_total * 100) if ch_total > 0 else 0
                channel_data.append(ChannelData(
                    channel=str(ch),
                    value=v,
                    share_pct=round(share, 1),
                    color=palette[idx % len(palette)]
                ))

        # 5. Category Breakdown (Donut chart)
        category_data = []
        cat_palette = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"]
        if cat_col and cat_col in df.columns and rev_col and rev_col in df.columns:
            cat_grp = df.groupby(cat_col)[rev_col].sum().sort_values(ascending=False).head(5)
            c_total = float(cat_grp.sum())
            for idx, (cat, val) in enumerate(cat_grp.items()):
                v = float(val)
                pct = (v / c_total * 100) if c_total > 0 else 0
                category_data.append(CategoryData(
                    category=str(cat),
                    value=v,
                    percentage=round(pct, 1),
                    color=cat_palette[idx % len(cat_palette)]
                ))

        # 6. Top Products / Items
        top_products = []
        if prod_col and prod_col in df.columns and rev_col and rev_col in df.columns:
            agg_dict = {rev_col: 'sum'}
            if units_col and units_col in df.columns and units_col != rev_col:
                agg_dict[units_col] = 'sum'
            
            p_grp = df.groupby(prod_col).agg(agg_dict).sort_values(by=rev_col, ascending=False).head(5)
            p_total = float(pd.to_numeric(df[rev_col], errors='coerce').fillna(0).sum())
            
            for rank, (pname, row) in enumerate(p_grp.iterrows(), 1):
                val = float(row[rev_col])
                units = int(row[units_col]) if (units_col and units_col in p_grp.columns and units_col != rev_col) else int((df[prod_col] == pname).sum())
                share = (val / p_total * 100) if p_total > 0 else 0
                
                p_cat = "General"
                if cat_col and cat_col in df.columns:
                    match_cat = df[df[prod_col] == pname][cat_col].dropna()
                    if not match_cat.empty:
                        p_cat = str(match_cat.iloc[0])

                top_products.append(TopProductItem(
                    rank=rank,
                    name=str(pname),
                    category=p_cat,
                    value=val,
                    formatted_value=format_metric_value(val, rev_col),
                    percentage=round(share, 1),
                    units=units
                ))
        # 7. Margin vs Volume Matrix
        margin_volume = []
        for item in (top_products if margin_col else []):
            if prod_col and prod_col in df.columns:
                prod_df = df[df[prod_col] == item.name]
                vol = int(prod_df[units_col].sum()) if (units_col and units_col in prod_df.columns) else item.units
                margin_value = float(prod_df[margin_col].mean()) if margin_col in prod_df.columns else 0.0
                m_pct = margin_value * 100 if margin_value <= 1.0 else margin_value
            else:
                vol = item.units
                margin_value = float(df[margin_col].mean()) if margin_col in df.columns else 0.0
                m_pct = margin_value * 100 if margin_value <= 1.0 else margin_value

            margin_volume.append(MarginVolumePoint(
                product=item.name,
                volume=max(1, vol),
                margin_pct=round(m_pct, 1),
                revenue=item.value,
                category=item.category
            ))

        ai_summary = f"Summary computed from {len(df):,} records."
        if region_col and top_region_name != "Global Market":
            ai_summary += f" The most common {region_col} is {top_region_name} ({top_region_share})."
        if rev_col:
            ai_summary += f" The dataset total for {rev_col} is {format_metric_value(total_rev, rev_col)}."

        return AnalyticsDashboardResponse(
            scope=scope_title,
            scope_badge=scope_badge,
            record_count=len(df),
            dataset_name=ds_name,
            kpis=kpis,
            revenue_trajectory=trajectory,
            sales_channels=channel_data,
            category_breakdown=category_data,
            category_total=format_metric_value(total_rev, rev_col),
            top_products=top_products,
            margin_volume_matrix=margin_volume,
            autonomous_ai_summary=ai_summary
        )

# Global singleton
analytics_service = AnalyticsService()
