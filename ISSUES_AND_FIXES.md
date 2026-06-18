
## Performance Optimizations

### 4.1 Replace `pandas.iterrows()` with Vectorized Operations

**Severity:** HIGH

**Location:** `backend/main.py:957, 1087`

**Issue:** `iterrows()` is notoriously slow in pandas:
```python
for _, row in df.iterrows():  # Very slow!
    # process row
```

**Fix - Use vectorized operations:**
```python
# BEFORE (slow)
for _, row in df.iterrows():
    product = row['product']
    region = row['region']

# AFTER (fast - vectorized)
products = df['product'].values
regions = df['region'].values

# Or use apply() with a proper function
def process_row(row):
    return row['product'] + row['region']

results = df.apply(process_row, axis=1)

# Or use itertuples() (faster than iterrows)
for row in df.itertuples(index=False):
    product = row.product
    region = row.region
```

---

### 4.2 Implement API Response Caching

**Severity:** HIGH

**Location:** All API endpoints

**Issue:** Repeated expensive computations for same data.

**Fix:**
```python
from functools import lru_cache
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Add caching decorator for expensive endpoints
@app.get("/api/kpis")
@lru_cache(maxsize=1)
async def get_kpis():
    # Expensive computation
    ...

# For more complex caching with TTL:
from cachetools import TTLCache

kpi_cache = TTLCache(maxsize=1, ttl=300)  # 5 minutes

@app.get("/api/kpis")
async def get_kpis():
    if 'data' in kpi_cache:
        return kpi_cache['data']

    # Compute and cache
    data = compute_kpis()
    kpi_cache['data'] = data
    return data
```

**Install:**
```bash
pip install cachetools
```

---

### 4.3 Optimize ML Model Loading (Lazy Loading)

**Severity:** MEDIUM

**Location:** `backend/main.py:517-570`

**Issue:** Models loaded synchronously at startup, blocking the server start.

**Fix:**
```python
from functools import cached_property
import threading

class MLModels:
    _demand_model = None
    _lock = threading.Lock()

    @classmethod
    def get_demand_model(cls):
        if cls._demand_model is None:
            with cls._lock:
                # Double-check locking pattern
                if cls._demand_model is None:
                    cls._demand_model = cls._load_demand_model()
        return cls._demand_model
```

---

### 4.4 Add Database Query Pagination

**Severity:** MEDIUM

**Location:** `backend/main.py:320` (fetch_data function)

**Issue:** Large result sets loaded without limits.

**Fix:**
```python
def fetch_data(query: str, limit: int = 1000, offset: int = 0):
    """Execute SQL with pagination."""
    # Add LIMIT if not present
    if "LIMIT" not in query.upper():
        query = f"{query} LIMIT {limit} OFFSET {offset}"

    # ... existing code
```

---

### 4.5 Implement Database Connection Pooling

**Severity:** MEDIUM

**Location:** `backend/main.py:318`

**Issue:** Database connections created per request.

**Fix:**
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,           # Number of connections to maintain
    max_overflow=20,        # Additional connections when pool is full
    pool_pre_ping=True,     # Verify connection before use
    pool_recycle=3600,      # Recycle connections after 1 hour
)
```

---

## Code Quality Improvements

### 5.1 Remove Duplicate Imports

**Severity:** LOW

**Location:** `backend/main.py:12-16` and `backend/main.py:27-32`

**Issue:** Duplicate imports of sklearn modules.

**Fix:** Remove lines 27-32:
```python
# Delete these duplicate imports:
# from typing import List, Dict, Any, Optional
# from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
# from sklearn.linear_model import LinearRegression
# from sklearn.preprocessing import LabelEncoder
# import joblib
# import json
```

---

### 5.2 Add Logging Instead of Print Statements

**Severity:** LOW

**Location:** Multiple locations using `print()`

**Issue:** `print()` statements don't provide proper logging levels.

**Fix:**
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instead of print("Loading models...")
logger.info("Loading demand prediction models...")
logger.warning(f"Model file not found: {model_path}")
logger.error(f"Failed to load model: {str(e)}")
```

---

### 5.3 Add Type Hints

**Severity:** LOW

**Location:** Throughout codebase

**Issue:** Many functions missing type hints.

**Fix:**
```python
# Add type hints to function signatures
def fetch_data(query: str, limit: int = 1000) -> pd.DataFrame:
    """Fetch data from database with pagination."""
    ...

def calculate_kpis(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate key performance indicators."""
    ...
```

---

### 5.4 Add Environment-Based Configuration

**Severity:** MEDIUM

**Location:** `backend/main.py`

**Issue:** Hardcoded configuration values.

**Fix:**
```python
import os

# Configuration management
class Config:
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://...")
    OPEN_AI_API_KEY = os.environ.get("OPEN_AI_API_KEY")

    # API settings
    MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB
    REQUEST_TIMEOUT = 30  # seconds

    # ML settings
    MODEL_CACHE_TTL = 3600  # seconds

config = Config()
```

---

### 5.5 Add Health Check Endpoint

**Severity:** LOW

**Location:** `backend/main.py`

**Issue:** No health check for container orchestration.

**Fix:**
```python
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }
```

---

## Summary Checklist

### ML Models Analysis (Added March 14, 2026)

The ML models have been reviewed and verified for functionality. Here's the analysis:

#### Model Files Verified ✅

| Model | Path | Status |
|-------|------|--------|
| Geographic Demand Model | `ML_trained_ouputs/geo_demand_forecasting/geographic_demand_model.pkl` | ✅ Exists |
| Sales Forecast Model | `ML_trained_ouputs/financial_sales_forecasting_training/revenue_forecast_model1.pkl` | ✅ Exists |
| Return Probability Model | `ML_trained_ouputs/return_probability_classifier/return_probability_model.pkl` | ✅ Exists |
| Label Encoders | All encoders present | ✅ Exists |

#### ML Models Logic Assessment

**Demand Prediction (`/api/predict/demand`)** ✅ WORKING
- Uses RandomForestRegressor with lazy loading
- Handles unseen labels gracefully (falls back to 0)
- Fallback to statistical prediction when model unavailable
- Features: region_encoded, product_encoded, year, month

**Sales Forecast (`/api/sales-forecast`)** ✅ WORKING
- Loads Prophet time-series model
- Falls back to trained model if Prophet unavailable
- Returns daily predictions with confidence intervals

**Return Probability (`/api/predict/return-probability`)** ✅ WORKING
- Uses RandomForestClassifier with vectorized prediction
- Includes statistical fallback
- Calculates risk levels (High/Medium/Low)

#### Issues Found in ML Models

**Issue: Double-Check Locking Bug** (Line 592-594)
```python
# Current (buggy):
if cls.demand_model is None:
    with cls._lock:
        if cls.demand_model is not None:  # This will be False even after loading!
            return cls.demand_model
```

**Fix:**
```python
# Correct double-check locking:
if cls.demand_model is None:
    with cls._lock:
        if cls.demand_model is None:  # Check again inside lock
            # Load the model
            cls.demand_model = cls._load_demand_model()
return cls.demand_model
```

#### Performance Optimization: iterrows() Still Present

**Location:** `backend/main.py:1087`

The code still uses `itertuples()` for fallback (which is good), but the main path could be optimized. This is marked as MEDIUM priority since `itertuples()` is significantly faster than `iterrows()`.
