import os
import sys
import pandas as pd
from sqlalchemy import text

# Add current path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.database import get_engine

engine = get_engine()

print("=== DB Verification ===")
try:
    with engine.connect() as conn:
        print("[OK] Connected to database successfully.")
        
        # Check tables depending on engine
        if engine.name == "sqlite":
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = [row[0] for row in result]
            print(f"[INFO] Tables in SQLite database: {tables}")
        else:
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'liveapp'
            """))
            tables = [row[0] for row in result]
            print(f"[INFO] Tables in schema 'liveapp': {tables}")
            
        target_table = 'chat_session_history'
        if target_table in tables:
            print(f"[OK] Table '{target_table}' EXISTS.")
            query_table = f"liveapp.{target_table}" if engine.name != "sqlite" else target_table
            df = pd.read_sql(text(f"SELECT * FROM {query_table} LIMIT 5"), conn)
            print(f"[INFO] Table has {len(df)} rows (showing up to 5):")
            if not df.empty:
                print(df.to_string(index=False))
            else:
                print("  (table is empty)")
        else:
            print(f"[MISSING] Table '{target_table}' does NOT exist.")
            print("[ACTION] Creating it now...")
            if engine.name != "sqlite":
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS liveapp.chat_session_history (
                        id SERIAL PRIMARY KEY,
                        session_id VARCHAR(50) NOT NULL,
                        question TEXT NOT NULL,
                        answer TEXT NOT NULL,
                        interaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
            else:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS chat_session_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT NOT NULL,
                        question TEXT NOT NULL,
                        answer TEXT NOT NULL,
                        interaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
            conn.commit()
            print("[OK] Table created successfully!")
            
except Exception as e:
    print(f"[ERROR] {e}")
