"""Mirrors ml-model/feature_engineering.py for live inference."""
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

LATE_NIGHT_HOURS = {23, 0, 1, 2, 3, 4}
RISKY_LOCATIONS = {"ASIA", "OTHER"}


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()

    out["log_amount"] = np.log1p(out["amount"])
    out["sqrt_amount"] = np.sqrt(out["amount"])

    # New Advanced Fraud-Risk Features
    out["high_amount_flag"] = (out["amount"] > 5000).astype(int)
    out["foreign_transaction_flag"] = (out["location"] != "US").astype(int)
    out["late_night_transaction_flag"] = out["transaction_hour"].isin(LATE_NIGHT_HOURS).astype(int)
    out["risky_device_flag"] = (out["device_type"] != "Desktop").astype(int)

    out["is_high_amount_1k"] = (out["amount"] > 1000).astype(int)
    out["is_high_amount_5k"] = (out["amount"] > 5000).astype(int)
    out["is_high_amount_10k"] = (out["amount"] > 10000).astype(int)

    out["is_late_night"] = out["transaction_hour"].isin(LATE_NIGHT_HOURS).astype(int)
    out["hour_sin"] = np.sin(2 * np.pi * out["transaction_hour"] / 24)
    out["hour_cos"] = np.cos(2 * np.pi * out["transaction_hour"] / 24)

    out["is_transfer"] = (out["payment_method"] == "Transfer").astype(int)
    out["is_debit_card"] = (out["payment_method"] == "Debit Card").astype(int)
    out["is_transfer_high_value"] = (
        (out["payment_method"] == "Transfer") & (out["amount"] > 2000)
    ).astype(int)

    out["is_mobile"] = (out["device_type"] == "Mobile").astype(int)
    out["is_mobile_risky_location"] = (
        (out["device_type"] == "Mobile") & (out["location"].isin(RISKY_LOCATIONS))
    ).astype(int)

    out["amount_x_late_night"] = out["amount"] * out["is_late_night"]
    out["amount_x_transfer"] = out["amount"] * out["is_transfer"]

    return out


class FeatureEngineer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if isinstance(X, pd.DataFrame):
            return engineer_features(X)
        return engineer_features(pd.DataFrame(X))
