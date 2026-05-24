import pandas as pd
import numpy as np

def generate_synthetic_transactions(n_samples=10000, random_state=42):
    """
    Generates a highly realistic and imbalanced transaction dataset.
    Features:
    - amount: float (1.0 to 15000.0)
    - location: US, EU, IN, ASIA, OTHER
    - device_type: Mobile, Desktop, Tablet
    - transaction_hour: 0 to 23
    - payment_method: Credit Card, Debit Card, PayPal, Transfer
    - is_fraud: 0 (safe, ~98%) or 1 (fraud, ~2%)
    """
    np.random.seed(random_state)
    
    # 1. Generate base features
    amounts = np.random.exponential(scale=300.0, size=n_samples) + 1.0
    # Add some high-value outlier transactions
    high_value_indices = np.random.choice(n_samples, size=int(n_samples * 0.05), replace=False)
    amounts[high_value_indices] = np.random.uniform(2000.0, 15000.0, size=len(high_value_indices))
    
    locations = np.random.choice(['US', 'EU', 'IN', 'ASIA', 'OTHER'], size=n_samples, p=[0.4, 0.25, 0.2, 0.1, 0.05])
    device_types = np.random.choice(['Mobile', 'Desktop', 'Tablet'], size=n_samples, p=[0.55, 0.35, 0.10])
    transaction_hours = np.random.randint(0, 24, size=n_samples)
    payment_methods = np.random.choice(['Credit Card', 'Debit Card', 'PayPal', 'Transfer'], size=n_samples, p=[0.45, 0.3, 0.15, 0.1])
    
    # 2. Formulate realistic fraud risk weights to assign target label
    # Base probability of fraud is very low
    fraud_prob = np.zeros(n_samples) + 0.001
    
    for i in range(n_samples):
        prob = 0.001
        
        # Core flags corresponding to features
        is_high_amount = amounts[i] > 5000
        is_foreign = locations[i] != 'US'
        is_late_night = transaction_hours[i] in [23, 0, 1, 2, 3, 4]
        is_risky_device = device_types[i] != 'Desktop'
        
        # Fraud logic strongly increases probability for combinations of these factors
        if is_high_amount and is_late_night:
            prob += 0.50
        if is_foreign and is_risky_device:
            prob += 0.45
        if is_high_amount and payment_methods[i] == 'Transfer':
            prob += 0.40
        if is_late_night and payment_methods[i] == 'Transfer':
            prob += 0.30
        if is_high_amount and is_foreign:
            prob += 0.35
            
        # Cap probability between 0 and 0.95
        fraud_prob[i] = np.clip(prob, 0.001, 0.95)
        
    # Generate labels based on a clean threshold over fraud_prob
    is_fraud = (fraud_prob > 0.25).astype(int)
    # Add a tiny bit of realistic noise (flip 0.2% of labels)
    noise_mask = np.random.choice([0, 1], size=n_samples, p=[0.998, 0.002])
    is_fraud = np.abs(is_fraud - noise_mask)
    
    # Construct DataFrame
    df = pd.DataFrame({
        'amount': np.round(amounts, 2),
        'location': locations,
        'device_type': device_types,
        'transaction_hour': transaction_hours,
        'payment_method': payment_methods,
        'is_fraud': is_fraud
    })
    
    # Enforce minimum imbalance (let's print breakdown)
    fraud_count = df['is_fraud'].sum()
    print(f"Generated synthetic dataset: {n_samples} samples.")
    print(f"Safe: {n_samples - fraud_count} ({((n_samples - fraud_count)/n_samples)*100:.2f}%)")
    print(f"Fraudulent: {fraud_count} ({(fraud_count/n_samples)*100:.2f}%)")
    
    return df

if __name__ == '__main__':
    df = generate_synthetic_transactions(30000)
    df.to_csv('transactions_synthetic.csv', index=False)
    print("Saved to transactions_synthetic.csv")

