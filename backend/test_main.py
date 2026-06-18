import os
import sys
from fastapi.testclient import TestClient

# Add current path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app, validate_sql_safe
from core.config import config

client = TestClient(app)


def test_health_check():
    """Verify that the health check endpoint responds with a 200 OK status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data


def test_sql_safety_validation():
    """Verify that validate_sql_safe blocks destructive commands and allows select operations."""
    # Safe queries
    assert validate_sql_safe("SELECT * FROM pharmasales") is True
    assert (
        validate_sql_safe(
            "SELECT region, SUM(revenue_iqd) FROM pharmasales GROUP BY region"
        )
        is True
    )
    assert (
        validate_sql_safe("WITH subq AS (SELECT * FROM pharmasales) SELECT * FROM subq")
        is True
    )

    # Destructive queries
    assert validate_sql_safe("DROP TABLE pharmasales") is False
    assert validate_sql_safe("DELETE FROM pharmasales WHERE id = 1") is False
    assert validate_sql_safe("TRUNCATE TABLE pharmasales") is False
    assert validate_sql_safe("ALTER TABLE pharmasales ADD COLUMN test TEXT") is False

    # Piggyback injection query
    assert validate_sql_safe("SELECT * FROM pharmasales; DROP TABLE users") is False


def test_configuration_loading():
    """Verify that the config module initializes correctly and resolves default values."""
    assert config.ALLOWED_TABLES is not None
    assert "pharmasales" in config.ALLOWED_TABLES
    assert config.DATABASE_URL is not None
