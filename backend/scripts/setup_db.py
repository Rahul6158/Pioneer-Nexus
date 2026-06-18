import os
import sys
import pandas as pd
import logging
from sqlalchemy import text

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import get_engine

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def setup_database():
    logger.info("Initializing database setup...")

    # Resolve active engine first to trigger fallback check
    active_engine = get_engine()
    is_sqlite_db = active_engine.name == "sqlite"
    schema_prefix = "" if is_sqlite_db else "liveapp."

    if not is_sqlite_db:
        try:
            with active_engine.begin() as conn:
                conn.execute(text("CREATE SCHEMA IF NOT EXISTS liveapp;"))
                logger.info("PostgreSQL 'liveapp' schema verified.")
        except Exception as e:
            logger.warning(f"Could not verify schema creation: {e}")

    sql_chat_table = f"""
    CREATE TABLE IF NOT EXISTS {schema_prefix}chat_session_history (
        id {"INTEGER PRIMARY KEY AUTOINCREMENT" if is_sqlite_db else "SERIAL PRIMARY KEY"},
        session_id VARCHAR(50) NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        latency_ms INTEGER,
        prompt_tokens INTEGER,
        output_tokens INTEGER,
        total_tokens INTEGER,
        cost_usd FLOAT,
        model_name VARCHAR(50),
        request_id VARCHAR(100),
        interaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    sql_sales_table = f"""
    CREATE TABLE IF NOT EXISTS {schema_prefix}pharmasales (
        order_id VARCHAR(50) PRIMARY KEY,
        order_date TIMESTAMP NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        region VARCHAR(50) NOT NULL,
        warehouse VARCHAR(50) NOT NULL,
        transaction_type VARCHAR(20) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price_iqd NUMERIC NOT NULL,
        revenue_iqd NUMERIC NOT NULL,
        expiry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    try:
        with active_engine.begin() as conn:
            conn.execute(text(sql_chat_table))
            logger.info(
                f"Table '{schema_prefix}chat_session_history' created/verified."
            )
            conn.execute(text(sql_sales_table))
            logger.info(f"Table '{schema_prefix}pharmasales' created/verified.")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        sys.exit(1)

    if is_sqlite_db:
        try:
            with active_engine.connect() as conn:
                res = conn.execute(text("SELECT COUNT(*) FROM pharmasales")).scalar()

            if res == 0:
                logger.info("Seeding SQLite database with sample transactions...")
                base_dir = os.path.dirname(
                    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                )
                csv_path = os.path.join(
                    base_dir, "data", "sales_transactions_sample.csv"
                )

                if os.path.exists(csv_path):
                    df = pd.read_csv(csv_path)
                    df["order_date"] = pd.to_datetime(df["order_date"])
                    df["expiry_date"] = pd.to_datetime(df["expiry_date"])
                    df.to_sql(
                        "pharmasales",
                        con=active_engine,
                        if_exists="append",
                        index=False,
                    )
                    logger.info(
                        f"Successfully seeded database with {len(df)} transactions from {csv_path}."
                    )
                else:
                    logger.warning(
                        f"Seeding failed: Sample data CSV not found at '{csv_path}'."
                    )
            else:
                logger.info(
                    f"Database already contains {res} records. Seeding skipped."
                )
        except Exception as e:
            logger.error(f"Error during database seeding: {e}")


if __name__ == "__main__":
    setup_database()
