from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.api.datasets import router as datasets_router
from app.api.queries import router as queries_router
from app.api.analytics import router as analytics_router
from app.api.insights import router as insights_router
from app.api.settings import router as settings_router

app = FastAPI(
    title="InsightAI — AI-Powered Data Analytics Assistant API",
    description="High-performance backend for natural language dataset queries, analytics dashboards, and AI executive insights.",
    version="1.0.0"
)

# CORS configuration for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request duration measurement middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = (time.perf_counter() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Global Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc)}
    )

# Register routers
app.include_router(datasets_router)
app.include_router(queries_router)
app.include_router(analytics_router)
app.include_router(insights_router)
app.include_router(settings_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "InsightAI Backend",
        "timestamp": time.time()
    }
