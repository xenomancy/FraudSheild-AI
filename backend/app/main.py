import os
import sys

# Ensure parent directory is in sys.path so app packages are resolvable
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import db_manager
from app.routes import auth, predict, transactions

# Create FastAPI instance with title and metadata
app = FastAPI(
    title="FraudShield AI Backend API",
    description="Production-ready FastAPI backend for live transaction fraud predictions and analytics dashboards.",
    version="1.0.0"
)

# Configure CORS Middleware to let the React development server call the APIs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to React origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifecycles
@app.on_event("startup")
async def startup_db_client():
    """Initializes the database connection pool on server startup."""
    await db_manager.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    """Closes live database clients on shutdown."""
    if not db_manager.is_mock and db_manager.client:
        db_manager.client.close()

# Include Sub-routers
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(transactions.router)

# General welcoming root endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "FraudShield AI API Service",
        "mode": "Mock In-Memory" if db_manager.is_mock else "Live MongoDB Atlas Connected",
        "endpoints": {
            "auth": "/api/auth/*",
            "prediction": "/api/predict",
            "transactions": "/api/transactions/*"
        }
    }

# General Global Exception Handler to ensure standard API JSON responses on unexpected errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected server error occurred. Please contact administrator.",
            "error": str(exc)
        }
    )

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
