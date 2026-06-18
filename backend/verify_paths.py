import os

# Get the directory of the current script (backend/)
base_dir = os.path.dirname(os.path.abspath(__file__))

# List of paths to verify (relative to project root)
paths_to_verify = [
    os.path.join(base_dir, "..", "pioneer_pharma_ideal_dataset_70000_rows.csv"),
    os.path.join(base_dir, "..", "ML_trained_ouputs", "geo_demand_forecasting", "geographic_demand_model.pkl"),
    os.path.join(base_dir, "..", "ML_trained_ouputs", "financial_sales_forecasting_training", "revenue_forecast_model1.pkl"),
    os.path.join(base_dir, "..", "ML_trained_ouputs", "return_probability_classifier", "return_probability_model.pkl"),
    os.path.join(base_dir, "..", "ML_trained_ouputs", "expiry_risk_detection", "expiry_prediction_output.pkl")
]

print("--- Data Path Verification ---")
for p in paths_to_verify:
    exists = os.path.exists(p)
    status = "[OK]" if exists else "[MISSING]"
    print(f"{status} {p}")
