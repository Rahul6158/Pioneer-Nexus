pre-trained models and outputs we have in the project.

🧠 ML Evolution — "True ML" Implementation:
Sales Forecast (Prophet Integration) 🟢

Old: Used a scaled random number generator.
New: Now calls the fully trained Prophet model (from 

revenue_forecast_model1.pkl
). It generates a baseline forecast daily and dynamically partitions it across Baghdad, Mosul, Basra, etc., based on historical regional performance.
Consistency: Synchronized the "All Regions" and "Individual Region" views so they both pull from the same time-series trend produced by the ML model.
Expiry Risk (Pipeline Output) 🟢

Old: Redundant logic and inconsistent summaries.
New: Now exclusively pulls from the high-fidelity ML Pipeline results (

expiry_prediction_output.pkl
). This ensures that specific financial exposure metrics (Potential Loss) and risk levels are identical to the findings in the data science reports.
Geographic Demand (Random Forest Prediction) 🟢

Verified that the /api/predict/demand endpoint is successfully using the Random Forest Regressor and the specialized encoders for product-to-region matching.
Return Probability (Mass Classifier) 🟢

Ensured the Classifier model is performing vectorized bulk predictions. This engine accurately identifies "High Return Risk" regions by analyzing historical return rates, quantities, and unit prices together.
Aesthetic Consistency (Red-Free Global Palette) 🟢

Modified the global DASHBOARD_COLORS to ensure no region (especially Baghdad, previously #0) starts with a Red segment. The color palette now prioritizes growth-oriented Violet, Blue, and Green, as requested for a positive trend feel.