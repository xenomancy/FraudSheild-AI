import os
import sys
import json
import logging
import joblib
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException, Depends

# Ensure the ML directory is in sys.path so joblib can deserialize custom estimators
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ML_DIR = os.path.join(BASE_DIR, "ml")
if ML_DIR not in sys.path:
    sys.path.append(ML_DIR)

from app.models import TransactionInput, PredictionResponse
from app.auth import get_current_user

# Setup logging
logger = logging.getLogger("PredictRouter")

router = APIRouter(prefix="/api/predict", tags=["Fraud Prediction"])

# Paths to serialized ML artifacts
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "fraud_model.joblib")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "ml", "preprocessor.joblib")
METADATA_PATH = os.path.join(BASE_DIR, "ml", "metadata.json")

# Global model and preprocessor placeholders
model = None
preprocessor = None
optimal_threshold = 0.5
model_metadata = {}


def _load_metadata():
    global optimal_threshold, model_metadata
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                model_metadata = json.load(f)
            optimal_threshold = float(model_metadata.get("optimal_threshold", 0.5))
        except Exception as e:
            logger.warning(f"Could not load metadata.json: {e}")


# Try loading the trained ML model & preprocessor at router initialization
try:
    if os.path.exists(MODEL_PATH) and os.path.exists(PREPROCESSOR_PATH):
        model = joblib.load(MODEL_PATH)
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        _load_metadata()
        logger.info(
            "Loaded XGBoost fraud model (threshold=%.2f).",
            optimal_threshold,
        )
    else:
        logger.warning(f"ML artifacts not found at {MODEL_PATH}. Prediction falling back to business rules.")
except Exception as e:
    logger.error(f"Error loading ML artifacts: {str(e)}. Prediction falling back to business rules.")


def compute_fraud_rationale(amount: float, location: str, device_type: str, transaction_hour: int, payment_method: str) -> list:
    """Helper to generate detailed fraud decision reasons based on advanced flags."""
    reasons = []
    if amount > 5000:
        reasons.append("unusually high transaction amount")
    if location != "US":
        reasons.append("suspicious foreign transaction")
    if device_type != "Desktop":
        reasons.append("risky public device")
    if transaction_hour in [23, 0, 1, 2, 3, 4]:
        reasons.append("suspicious late-night activity")
    if payment_method == "Transfer" and amount > 2000:
        reasons.append("unusually risky payment channel and high amount")
    return reasons


def rule_based_fallback(tx: TransactionInput) -> PredictionResponse:
    """
    Highly accurate fallback prediction engine replicating the true ML distribution rules.
    Used if models fail to load or are missing in deployment.
    """
    # Mimic our new dataset generator's probability logic
    prob = 0.001
    is_high_amount = tx.amount > 5000
    is_foreign = tx.location != 'US'
    is_late_night = tx.transaction_hour in [23, 0, 1, 2, 3, 4]
    is_risky_device = tx.device_type != 'Desktop'
    
    if is_high_amount and is_late_night:
        prob += 0.50
    if is_foreign and is_risky_device:
        prob += 0.45
    if is_high_amount and tx.payment_method == 'Transfer':
        prob += 0.40
    if is_late_night and tx.payment_method == 'Transfer':
        prob += 0.30
    if is_high_amount and is_foreign:
        prob += 0.35
        
    prob = min(max(prob, 0.001), 0.95)
    is_fraud = prob > 0.25
    
    # Calculate confidence score
    threshold = 0.25
    if is_fraud:
        confidence = 50.0 + 50.0 * (prob - threshold) / (1.0 - threshold)
    else:
        confidence = 50.0 + 50.0 * (threshold - prob) / threshold
    confidence_score = round(min(max(confidence, 50.0), 100.0), 2)
    
    # Map risk levels
    if prob >= 0.45 or is_fraud:
        risk_level = "high"
        recommended_action = "Block Transaction"
    elif prob >= 0.20:
        risk_level = "medium"
        recommended_action = "Withhold for Manual Review"
    else:
        risk_level = "low"
        recommended_action = "Approve Transaction"
        
    reasons = compute_fraud_rationale(tx.amount, tx.location, tx.device_type, tx.transaction_hour, tx.payment_method)
    if not reasons:
        reasons = ["All parameters conform to standard verified secure transaction patterns."]

    return PredictionResponse(
        is_fraud=is_fraud,
        probability=round(prob * 100, 2),
        risk_level=risk_level,
        confidence_score=confidence_score,
        fraud_reasons=reasons,
        recommended_action=recommended_action
    )


@router.get("/metrics")
async def get_model_metrics(current_user: dict = Depends(get_current_user)):
    """
    Returns ML training metrics, confusion matrix, and feature importances from metadata.json.
    """
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)

            metrics_comp = meta.get("metrics", {})
            confusion = meta.get("confusion_matrix", {})
            importances = meta.get("feature_importances", {})
            best_model_name = meta.get("best_model", "XGBoost")
            optimal_thresh = meta.get("optimal_threshold", 0.5)
            features = meta.get("features", [])

            return {
                "success": True,
                "best_model": best_model_name,
                "optimal_threshold": optimal_thresh,
                "features": features,
                "metrics": metrics_comp,
                "confusion_matrix": confusion,
                "feature_importances": importances,
                "selection_criteria": meta.get("selection_criteria"),
            }
        except Exception as e:
            logger.error(f"Error reading metadata.json: {str(e)}")

    return {
        "success": False,
        "best_model": "XGBoost",
        "message": "Model metadata not found. Run ml-model/train.py to generate artifacts.",
    }


@router.post("", response_model=PredictionResponse)
async def predict_fraud(tx: TransactionInput, current_user: dict = Depends(get_current_user)):
    """
    Evaluates transactional parameters against the upgraded model to determine fraud probability and reasons.
    Shielded behind secure JWT token validation.
    """
    global model, preprocessor, optimal_threshold

    # If ML pipeline is loaded, execute standard model inference
    if model is not None and preprocessor is not None:
        try:
            input_df = pd.DataFrame([{
                'amount': tx.amount,
                'location': tx.location,
                'device_type': tx.device_type,
                'transaction_hour': tx.transaction_hour,
                'payment_method': tx.payment_method
            }])

            X_processed = preprocessor.transform(input_df)
            prob_pred = float(model.predict_proba(X_processed)[0][1])
            is_fraud_pred = prob_pred >= optimal_threshold

            # Calculate confidence score
            if is_fraud_pred:
                confidence = 50.0 + 50.0 * (prob_pred - optimal_threshold) / max(1.0 - optimal_threshold, 0.001)
            else:
                confidence = 50.0 + 50.0 * (optimal_threshold - prob_pred) / max(optimal_threshold, 0.001)
            confidence_score = round(min(max(confidence, 50.0), 100.0), 2)

            # Determine risk level and action
            if prob_pred >= 0.45 or is_fraud_pred:
                risk_level = "high"
                recommended_action = "Block Transaction"
            elif prob_pred >= 0.20:
                risk_level = "medium"
                recommended_action = "Withhold for Manual Review"
            else:
                risk_level = "low"
                recommended_action = "Approve Transaction"

            reasons = compute_fraud_rationale(tx.amount, tx.location, tx.device_type, tx.transaction_hour, tx.payment_method)
            if not reasons:
                reasons = ["All parameters conform to standard verified secure transaction patterns."]

            return PredictionResponse(
                is_fraud=bool(is_fraud_pred),
                probability=round(prob_pred * 100, 2),
                risk_level=risk_level,
                confidence_score=confidence_score,
                fraud_reasons=reasons,
                recommended_action=recommended_action
            )
            
        except Exception as e:
            logger.error(f"Error during ML model inference: {str(e)}. Reverting to rule engine.")
            return rule_based_fallback(tx)
            
    else:
        # Graceful rule fallback if joblib loading failed
        return rule_based_fallback(tx)
