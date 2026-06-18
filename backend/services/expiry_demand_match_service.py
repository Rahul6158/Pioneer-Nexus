import pandas as pd
import numpy as np
from datetime import datetime

class ExpiryDemandMatchService:
    """
    Advanced Prescriptive Analytics Engine.
    Matches near-expiry products to high-velocity regions to minimize financial loss.
    """

    @staticmethod
    def get_recommended_action(days_to_clear, days_to_expiry):
        """Logic for determining the best strategic action for a batch"""
        if days_to_clear < days_to_expiry * 0.5:
            return "Push to region"
        elif days_to_clear > days_to_expiry:
            return "Promote aggressively"
        else:
            return "Bundle discount"

    @classmethod
    def run_engine(cls, df):
        """
        Optimized Processes sales data and inventory to find the best match.
        Reduces computation by filtering near-expiry batches early and vectorizing matching.
        """
        if df.empty:
            return pd.DataFrame()

        # 1. Clean and Calculate Days to Expiry
        df["order_date"] = pd.to_datetime(df["order_date"])
        df["expiry_date"] = pd.to_datetime(df["expiry_date"])
        today = pd.Timestamp(datetime.today()).normalize()
        
        # Calculate days_to_expiry once
        df["days_to_expiry"] = (df["expiry_date"] - today).dt.days

        # STEP 1 & 2: Early Filter (Only analyze batches expiring in 0-120 days)
        # This significantly reduces the size of the dataframe for the rest of the pipeline.
        batch_df = df[(df["days_to_expiry"] > 0) & (df["days_to_expiry"] <= 120)].copy()
        
        if batch_df.empty:
            return pd.DataFrame()

        # Deduplicate batches - assume one entry per batch_id represents current stock status
        batch_df = batch_df.drop_duplicates(subset=["batch_id"])

        # STEP 3: Optimized Demand Calculation
        # Only calculate demand for products that actually have near-expiry batches
        relevant_products = batch_df["product_name"].unique()
        
        sales_df = df[
            (df["transaction_type"] == "Sale") & 
            (df["product_name"].isin(relevant_products))
        ].copy()
        
        if sales_df.empty:
            return pd.DataFrame()

        # Calculate demand velocity (units per day) per region and product
        demand = sales_df.groupby(["region", "product_name"])["quantity"].sum().reset_index()
        demand["daily_demand_velocity"] = demand["quantity"] / 30 
        demand = demand[demand["daily_demand_velocity"] > 0]

        # STEP 4: Vectorized Matching Logic
        # Instead of iterrows, we use a vectorized merge
        merged = batch_df.merge(demand, on="product_name", suffixes=('', '_demand'))

        # Calculate days_to_clear for every possible regional option in bulk
        merged["days_to_clear"] = merged["quantity"] / merged["daily_demand_velocity"]
        
        # For each batch, find the region with the minimum days_to_clear (fastest clearance)
        best_matches = merged.sort_values("days_to_clear").groupby("batch_id").first().reset_index()

        # Round days_to_clear for better readability
        best_matches["days_to_clear"] = best_matches["days_to_clear"].round(1)
        
        # Calculate Value at Risk
        best_matches["value_at_risk"] = best_matches["quantity"] * best_matches["unit_price_iqd"]

        # Vectorized Recommendation Logic
        dtc = best_matches["days_to_clear"]
        dte = best_matches["days_to_expiry"]
        
        conditions = [
            (dtc < dte * 0.5),
            (dtc > dte)
        ]
        choices = ["PUSH TO REGION", "AGGRESSIVE CLEARANCE"]
        best_matches["recommended_action"] = np.select(conditions, choices, default="PROMO BUNDLE")

        # STEP 5: Prepare Output Schema and Limit Results
        results = best_matches[[
            "product_name", "batch_id", "region_demand", 
            "days_to_expiry", "days_to_clear", "value_at_risk", 
            "recommended_action"
        ]].rename(columns={
            "product_name": "product",
            "batch_id": "batch",
            "region_demand": "best_region"
        })

        # Return results sorted primarily by urgency (days_to_expiry)
        # and secondarily by the monetary impact (value_at_risk)
        return results.sort_values(
            by=["days_to_expiry", "value_at_risk"], 
            ascending=[True, False]
        ).head(100)

    @classmethod
    def get_top_risk_summary(cls, results_df):
        """Aggregates metrics for dashboard display"""
        if results_df.empty:
            return {
                "total_value_at_risk": 0,
                "at_risk_count": 0,
                "top_products": []
            }
            
        summary = {
            "total_value_at_risk": float(results_df["value_at_risk"].sum()),
            "at_risk_count": int(len(results_df)),
            "top_products": results_df.sort_values("value_at_risk", ascending=False).head(5).to_dict(orient="records")
        }
        return summary
