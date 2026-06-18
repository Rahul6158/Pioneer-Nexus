import pandas as pd

class ExpiryRiskService:
    """
    Standardized Service for Pharmaceutical Expiry Risk Detection.
    Provides rules-based heuristic scoring and financial exposure calculations.
    """

    @staticmethod
    def calculate_risk_level(days_to_expiry):
        """
        Determines the risk classification based on days until expiration.
        - Expired: < 0 days (Already Written Off)
        - Critical: <= 30 days
        - High: <= 60 days
        - Medium: <= 120 days
        - Low: > 120 days
        """
        if days_to_expiry < 0:
            return "Expired (Already Written Off)"
        elif days_to_expiry <= 30:
            return "Critical"
        elif days_to_expiry <= 60:
            return "High"
        elif days_to_expiry <= 120:
            return "Medium"
        else:
            return "Low"

    @classmethod
    def process_inventory_risk(cls, df):
        """
        Processes a dataframe of inventory items to identify risk exposure.
        Expects columns: product_name, batch_id, quantity, unit_price_iqd, expiry_date
        """
        if df.empty:
            return df

        required_cols = ["quantity", "unit_price_iqd", "expiry_date"]
        missing = [col for col in required_cols if col not in df.columns]

        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        # Ensure datetime format
        df['expiry_date'] = pd.to_datetime(df['expiry_date'])
        
        # Calculate derived metrics with normalized time
        today = pd.Timestamp.today().normalize()
        df['days_to_expiry'] = (df['expiry_date'] - today).dt.days
        df['risk_level'] = df['days_to_expiry'].apply(cls.calculate_risk_level)
        df['potential_value_loss'] = df['quantity'] * df['unit_price_iqd']
        
        # Rename for frontend consistency
        if 'product_name' in df.columns:
            df = df.rename(columns={'product_name': 'product'})
        if 'batch_id' in df.columns:
            df = df.rename(columns={'batch_id': 'batch'})

        return df
