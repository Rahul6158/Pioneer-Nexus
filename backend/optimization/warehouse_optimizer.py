import pandas as pd


def optimize_warehouse_allocation(df: pd.DataFrame):
    if df.empty or "region" not in df.columns or "quantity" not in df.columns:
        return {"recommended_region": "Unknown", "reason": "insufficient data"}

    region_demand = df.groupby("region")["quantity"].sum()

    if region_demand.empty:
        return {"recommended_region": "Unknown", "reason": "no demand data"}

    top_region = region_demand.idxmax()

    return {"recommended_region": top_region, "reason": "highest predicted demand"}
