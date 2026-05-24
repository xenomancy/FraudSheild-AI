from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List, Dict, Any

# Authentication Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters.")
    full_name: str = Field(..., min_length=2, description="Name must be at least 2 characters.")

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    email: EmailStr
    full_name: str
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TokenUserResponse(BaseModel):
    email: str
    full_name: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: TokenUserResponse

# Machine Learning & Transaction Schemas
class TransactionInput(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount must be positive.")
    location: str = Field(..., description="Location of transaction (US, EU, IN, ASIA, OTHER).")
    device_type: str = Field(..., description="Device used (Mobile, Desktop, Tablet).")
    transaction_hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23).")
    payment_method: str = Field(..., description="Method used (Credit Card, Debit Card, PayPal, Transfer).")

class PredictionResponse(BaseModel):
    is_fraud: bool
    probability: float = Field(..., description="Probability of fraud as a percentage (0-100).")
    risk_level: str = Field(..., description="Risk evaluation level (low, medium, high).")
    confidence_score: float = Field(default=0.0, description="AI confidence score for the prediction as a percentage (0-100).")
    fraud_reasons: List[str] = Field(default=[], description="Reasons/threat vectors detected by the model.")
    recommended_action: str = Field(default="Approve", description="Recommended action to mitigate risk (Approve, Review, Block).")

class TransactionResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    amount: float
    location: str
    device_type: str
    transaction_hour: int
    transaction_date: str
    payment_method: str
    is_fraud: int
    probability: float
    risk_level: str
    status: str
    confidence_score: float = Field(default=0.0, description="Model confidence score")
    fraud_reasons: List[str] = Field(default=[], description="Model-generated reasons")
    recommended_action: str = Field(default="Approve", description="Mitigating recommended action")

    class Config:
        populate_by_name = True

class PaginatedTransactions(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    skip: int
    limit: int

# Dashboard / Analytics Response Schemas
class StatMetrics(BaseModel):
    total_count: int
    fraud_count: int
    fraud_percentage: float
    average_risk: float

class RiskDistItem(BaseModel):
    name: str
    value: int
    color: str

class PaymentDistItem(BaseModel):
    name: str
    total: int
    fraud: int

class TrendDataItem(BaseModel):
    date: str
    Safe: int
    Suspicious: int
    Total: int

class MonthlySummaryItem(BaseModel):
    month: str
    Safe: int
    Fraud: int
    Total: int

class DashboardAnalyticsResponse(BaseModel):
    stats: StatMetrics
    risk_distribution: List[RiskDistItem]
    payment_distribution: List[PaymentDistItem]
    trend_data: List[TrendDataItem]
    monthly_summary: List[MonthlySummaryItem]
