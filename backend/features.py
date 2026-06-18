import pandas as pd

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    df["order_date"] = pd.to_datetime(df["order_date"])
    
    # Expiry date may be null or different column name, handle gracefully
    if "expiry_date" in df.columns:
        df["expiry_date"] = pd.to_datetime(df["expiry_date"], errors='coerce')
        df["days_to_expiry"] = (df["expiry_date"] - df["order_date"]).dt.days.fillna(90) # Handle conversion failures/missing dates
    else:
        df["days_to_expiry"] = 90 # fallback
        
    # Time features
    df["year"] = df["order_date"].dt.year
    df["month"] = df["order_date"].dt.month
    df["week"] = df["order_date"].dt.isocalendar().week
    df["day_of_week"] = df["order_date"].dt.dayofweek

    # Demand features
    if "product_name" in df.columns and "quantity" in df.columns:
        # Sort by product and date before rolling
        df = df.sort_values(by=["product_name", "order_date"])
        df["rolling_sales_7d"] = (
            df.groupby("product_name")["quantity"]
            .rolling(7, min_periods=1)
            .mean()
            .reset_index(level=0, drop=True)
        )

    return df
