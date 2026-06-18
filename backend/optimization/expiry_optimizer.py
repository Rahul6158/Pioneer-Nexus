import pandas as pd

def detect_expiry_risk(df: pd.DataFrame):
    if df.empty or "days_to_expiry" not in df.columns:
        return []

    risky_batches = df[df["days_to_expiry"] < 30]
    recommendations = []

    for row in risky_batches.itertuples():
        # Handle cases where batch_id might be named batch_number
        batch_id = getattr(row, "batch_id", getattr(row, "batch_number", "unknown"))
        product = getattr(row, "product_name", "unknown")
        
        recommendations.append({
            "batch_id": str(batch_id),
            "product": str(product),
            "action": "transfer_to_high_demand_region"
        })

    # Return top 10 to avoid huge payloads
    return recommendations[:10]

