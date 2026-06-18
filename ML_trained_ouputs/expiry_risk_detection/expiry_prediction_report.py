
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 1. Load Environment Configuration
current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(current_dir, "..", "..", "backend", ".env"))
DEFAULT_DB_PATH = os.path.abspath(os.path.join(current_dir, "..", "..", "backend", "pioneer_nexus.db"))
DB_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

if "sqlite" in DB_URL:
    engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DB_URL)

def run_expiry_prediction():
    print("🚀 Starting Operational Expiry Risk Prediction...")
    
    # 2. Fetch Fresh Inventory Data (Next 120 Days + Already Expired)
    is_sqlite = engine.name == "sqlite"
    if is_sqlite:
        query = """
        SELECT product_name as product, batch_id as batch, quantity, 
               unit_price_iqd, expiry_date, warehouse, region
        FROM pharmasales
        WHERE expiry_date IS NOT NULL 
        AND expiry_date <= date('now', '+120 days')
        ORDER BY expiry_date ASC
        """
    else:
        query = """
        SELECT product_name as product, batch_id as batch, quantity, 
               unit_price_iqd, expiry_date, warehouse, region
        FROM liveapp.pharmasales
        WHERE expiry_date IS NOT NULL 
        AND expiry_date <= CURRENT_DATE + INTERVAL '120 days'
        ORDER BY expiry_date ASC
        """
    
    print(f"📊 Fetching inventory from {'SQLite' if is_sqlite else 'PostgreSQL'}...")
    with engine.connect() as conn:
        df = pd.read_sql_query(text(query), conn)
    
    if df.empty:
        print("✅ No products nearing expiry in the next 120 days found.")
        return

    # 3. Apply Strategic Risk Rules
    print("🧠 Processing business logic and risk scoring...")
    today = pd.Timestamp.now().normalize()
    df['expiry_date'] = pd.to_datetime(df['expiry_date'])
    df['days_to_expiry'] = (df['expiry_date'] - today).dt.days
    df['potential_value_loss'] = df['quantity'] * df['unit_price_iqd']
    
    def get_risk_level(days):
        if days <= 0: return "Expired (Already Written Off)"
        if days <= 30: return "Critical"
        if days <= 60: return "High"
        return "Medium"

    df['risk_level'] = df['days_to_expiry'].apply(get_risk_level)

    # 4. Integrate ML Demand Prediction (Optional Enrichment)
    # This helps determine if the product CAN be cleared before it expires
    model_dir = os.path.join(current_dir, '..', 'geo_demand_forecasting')
    model_path = os.path.join(model_dir, 'geographic_demand_model.pkl')
    prod_enc_path = os.path.join(model_dir, 'product_encoder.pkl')
    reg_enc_path = os.path.join(model_dir, 'region_encoder.pkl')

    if os.path.exists(model_path):
        print("🔮 Enriching data with ML Demand Forecasting...")
        try:
            model = joblib.load(model_path)
            le_prod = joblib.load(prod_enc_path)
            le_reg = joblib.load(reg_enc_path)

            # We'll predict demand for current month
            current_month = datetime.now().month
            current_year = datetime.now().year

            def predict_safe(row):
                try:
                    p_enc = le_prod.transform([row['product']])[0]
                    r_enc = le_reg.transform([row['region']])[0]
                    # Model expects: [region_encoded, product_encoded, year, month]
                    pred = model.predict([[r_enc, p_enc, current_year, current_month]])[0]
                    return round(pred, 1)
                except:
                    return 0

            df['predicted_regional_demand'] = df.apply(predict_safe, axis=1)
            # Clearance score: Ratio of inventory to monthly demand
            df['clearance_difficulty'] = df.apply(lambda r: "High" if r['quantity'] > r['predicted_regional_demand'] else "Low", axis=1)
        except Exception as e:
            print(f"⚠️ Could not load demand model for enrichment: {e}")
    
    # 5. Output and Save Results
    output_pkl = os.path.join(current_dir, 'expiry_prediction_output.pkl')
    output_csv = os.path.join(current_dir, 'expiry_prediction_report.csv')
    
    df.to_pickle(output_pkl)
    df.to_csv(output_csv, index=False)
    
    print("\n--- Summary Report ---")
    print(df.groupby('risk_level')['potential_value_loss'].sum().apply(lambda x: f"{x:,.0f} IQD"))
    print(f"\n✅ FULL PREDICTION SAVED TO:")
    print(f"   - PKL (For Python): {output_pkl}")
    print(f"   - CSV (For Excel):  {output_csv}")
    print("-" * 22)

if __name__ == "__main__":
    run_expiry_prediction()
