import os
import logging
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool

logger = logging.getLogger(__name__)

from core.config import config

DATABASE_URL = config.DATABASE_URL
ALLOWED_TABLES = config.ALLOWED_TABLES
is_sqlite = DATABASE_URL.startswith("sqlite")
logger.info(f"Database connection: {'SQLite fallback' if is_sqlite else 'PostgreSQL'}")

# Dynamic engine selection with fallback
_fallback_engine = None


def get_engine():
    global _fallback_engine, is_sqlite
    if _fallback_engine:
        return _fallback_engine

    if is_sqlite:
        return engine

    try:
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return engine
    except Exception as e:
        logger.warning(
            f"Failed to connect to primary database. Falling back to SQLite. Error: {e}"
        )
        # Mark as SQLite
        is_sqlite = True
        DEFAULT_DB_PATH = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "pioneer_nexus.db")
        )
        _fallback_engine = create_engine(
            f"sqlite:///{DEFAULT_DB_PATH}", connect_args={"check_same_thread": False}
        )
        return _fallback_engine


if is_sqlite:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    try:
        engine = create_engine(
            DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"connect_timeout": 5},
        )
    except Exception as e:
        logger.warning(
            f"Could not initialize primary engine, falling back to SQLite. Error: {e}"
        )
        is_sqlite = True
        DEFAULT_DB_PATH = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "pioneer_nexus.db")
        )
        engine = create_engine(
            f"sqlite:///{DEFAULT_DB_PATH}", connect_args={"check_same_thread": False}
        )


def fetch_data(query: str, limit: int = 1000, offset: int = 0) -> pd.DataFrame:
    """Execute SQL with query validation and pagination."""
    # Resolve correct engine
    active_engine = get_engine()

    try:
        # Strip schema for SQLite compatibility
        if is_sqlite:
            query = query.replace("liveapp.pharmasales", "pharmasales")
            query = query.replace(
                "liveapp.chat_session_history", "chat_session_history"
            )
            query = query.replace("liveapp.", "")

        query_upper = query.upper().strip()
        if "LIMIT" not in query_upper and any(
            t in query.lower() for t in ALLOWED_TABLES
        ):
            query = f"{query} LIMIT {limit} OFFSET {offset}"

        with active_engine.connect() as conn:
            if not is_sqlite:
                try:
                    conn.execute(text("SET statement_timeout = 45000"))
                except Exception as te:
                    logger.warning(f"Could not set PG statement timeout: {te}")
            return pd.read_sql(text(query), conn)
    except Exception as e:
        logger.error(f"Database Query Error: {e}")
        return pd.DataFrame()
