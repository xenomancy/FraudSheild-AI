from datetime import datetime
import uuid
from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Optional

from app.models import TransactionInput, TransactionResponse, PaginatedTransactions, DashboardAnalyticsResponse
from app.database import db_manager
from app.auth import get_current_user
from app.routes.predict import predict_fraud

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=PaginatedTransactions)
async def list_transactions(
    search: Optional[str] = Query(None, description="Search transaction ID or location"),
    risk: Optional[str] = Query("All", description="Filter by risk rating (All, Low, Medium, High)"),
    payment: Optional[str] = Query("All", description="Filter by payment type (All, Credit Card, Debit Card, PayPal, Transfer)"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Batch count size"),
    current_user: dict = Depends(get_current_user)
):
    """
    Fetches the transactions history list, supporting live multi-field filtering, 
    matching search parameters, and precise pagination indices.
    """
    user_id = current_user["_id"]
    results = await db_manager.get_transactions(
        user_id=user_id,
        search=search,
        risk=risk,
        payment=payment,
        skip=skip,
        limit=limit
    )
    return results

@router.post("/add", response_model=TransactionResponse)
async def add_new_transaction(
    tx_input: TransactionInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Saves a transaction record. 
    It automatically routes the request through the ML model to predict safety ratings (is_fraud, probability, risk_level) 
    before appending the finalized transaction log to the database/mock array.
    """
    user_id = current_user["_id"]
    
    # 1. Compute prediction using internal prediction router code
    pred = await predict_fraud(tx_input, current_user=current_user)
    
    # Map status description
    if pred.risk_level == "high":
        status_label = "Flagged"
    elif pred.risk_level == "medium":
        status_label = "Investigating"
    else:
        status_label = "Safe"
        
    # 2. Build complete transaction record
    new_tx = {
        "user_id": user_id,
        "amount": tx_input.amount,
        "location": tx_input.location,
        "device_type": tx_input.device_type,
        "transaction_hour": tx_input.transaction_hour,
        "transaction_date": datetime.utcnow().isoformat(),
        "payment_method": tx_input.payment_method,
        "is_fraud": 1 if pred.is_fraud else 0,
        "probability": pred.probability,
        "risk_level": pred.risk_level,
        "status": status_label,
        "confidence_score": pred.confidence_score,
        "fraud_reasons": pred.fraud_reasons,
        "recommended_action": pred.recommended_action
    }
    
    # 3. Add transaction
    tx_id = await db_manager.add_transaction(new_tx)
    new_tx["_id"] = tx_id
    
    return new_tx

@router.get("/analytics", response_model=DashboardAnalyticsResponse)
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    """
    Compiles real-time metrics and Recharts data coordinates (risk, payment types, trends) 
    specific to the authenticated user's transactions.
    """
    user_id = current_user["_id"]
    analytics_data = await db_manager.get_analytics(user_id)
    return analytics_data
