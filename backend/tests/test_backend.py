import pytest
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.dataset_service import dataset_service
from app.services.query_engine import query_engine
from app.services.analytics_service import analytics_service
from app.services.ai_service import ai_service
from app.schemas.models import QueryRequest

@pytest.fixture(autouse=True)
def setup_test_dataset():
    # Never clear the shared upload directory: it may contain user datasets
    # loaded by the running application. Remove only the fixture created here.
    csv_bytes = (
        b"Order ID,Product Name,Category,Region,Revenue,Units Sold,Profit Margin,Discount Applied\n"
        b"ORD-1,NeuralEdge Workstation,Hardware,Chennai,1980000,4,0.42,0.05\n"
        b"ORD-2,Titan Server,Cloud,Chennai,1420000,2,0.38,0.10\n"
        b"ORD-3,CyberShield Rack,Security,Bangalore,980000,6,0.29,0.0\n"
        b"ORD-4,Architect Switch,Networking,Mumbai,860000,8,0.33,0.15\n"
        b"ORD-5,Synapse Card,ML,Delhi,590000,10,0.25,0.05\n"
    )
    meta = dataset_service.upload_dataset(csv_bytes, "test_sales.csv")
    yield meta
    dataset_service.delete_dataset(meta.id)

def test_initial_dataset_clean(setup_test_dataset):
    datasets = dataset_service.list_datasets()
    assert len(datasets) == 1
    assert datasets[0].name == "test_sales.csv"

def test_preview_dataset(setup_test_dataset):
    meta = setup_test_dataset
    res = dataset_service.preview_dataset(meta.id, limit=5)
    assert res.total_rows == 5
    assert len(res.rows) == 5
    assert "Revenue" in res.columns
    assert "Product Name" in res.columns

@pytest.mark.anyio
async def test_query_engine_deterministic_execution(setup_test_dataset):
    meta = setup_test_dataset
    req = QueryRequest(query_text="Show the top 3 products by revenue in Chennai")
    result = await query_engine.execute_query(meta.id, req)
    assert result.total_rows_matching <= 3
    assert len(result.rows) > 0
    assert result.audit_passed is True

def test_analytics_service_scope(setup_test_dataset):
    meta = setup_test_dataset
    analytics = analytics_service.analyze(meta.id, target="entire_dataset")
    assert len(analytics.kpis) == 4
    assert len(analytics.sales_channels) > 0
    assert len(analytics.category_breakdown) > 0
    assert len(analytics.top_products) > 0

@pytest.mark.anyio
async def test_ai_insights_generation(setup_test_dataset):
    meta = setup_test_dataset
    insights = await ai_service.generate_insights(meta.id, target="entire_dataset")
    assert len(insights.key_findings) > 0
    assert len(insights.recommendations) > 0
    assert len(insights.suggested_queries) > 0

@pytest.mark.anyio
async def test_copilot_chat(setup_test_dataset):
    meta = setup_test_dataset
    resp = await ai_service.chat_copilot("Explain discount anomalies", meta.id)
    assert len(resp.reply) > 5
