# Pioneer Nexus: AI-Powered Analytics Copilot & Forecasting Platform

A production-grade, double-cached analytics platform combining conversational **Natural Language to SQL Translation** with time-series ML sales forecasting.

[![CI Pipeline Status](https://github.com/Rahul6158/Pioneer-Nexus/workflows/CI/badge.svg)](https://github.com/Rahul6158/Pioneer-Nexus/actions)

> [!TIP]
> **New to the project?** Head over to [START_HERE.md](file:///E:/KonfigAI/Pionner-pharma/updates/V6/konfigai-insights-engine/START_HERE.md) for a **60-second overview** of the system architecture, core engineering highlights, and live execution metrics.

---

## 🚀 Key Capabilities

1. **Natural Language Analytics (Flagship)**: Converse directly with database schemas in English or Arabic, automatically compiling questions into optimized SQL queries.
2. **Text-to-SQL Copilot (Flagship)**: Multi-layer safety validation (blocking piggback injections and destructive SQL) combined with inline Recharts rendering in message bubbles.
3. **Forecasting**: Advanced time-series forecasting powered by Prophet, partitioning global sales projections across regional locations.
4. **Risk Prediction**: Random Forest estimators predicting inventory risk exposure and customer returns probability.
5. **Executive Decision Support**: Algorithmic inventory optimization recommendations for stock rebalancing.
6. **Production FastAPI Architecture**: Decoupled backend implementing JSON structured logging, database statement timeouts, connection pooling, and dual-layer cache TTLs.

---

## 🛠️ Quick Start & Local Run

Pioneer Nexus is built with **zero external database dependencies** for local execution. It automatically falls back to SQLite and auto-seeds itself on startup.

### 1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database setup (creates `pioneer_nexus.db` and seeds it with ~200 rows of generalized transactions):
   ```bash
   python setup_db.py
   ```
5. Set up your `.env` (optional, for Gemini AI features. If omitted, the copilot runs on keyword fallback):
   ```bash
   copy .env.example .env
   ```
6. Start the FastAPI uvicorn server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will start on `http://127.0.0.1:8000`. Verify health at `http://127.0.0.1:8000/health`.

### 2. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Open the browser at `http://localhost:5173` to explore the bilingual dashboard.

---

## 📊 Run Benchmarks & Evaluations

Run the automated evaluation CLI to run model checks and query tests, outputting actual validation files under `benchmarks/`:
```bash
python backend/scripts/evaluate_nexus.py
```

---

## 📂 Repository Layout

- `backend/`: FastAPI application code.
  - `core/`: Connection pool, config, structured logging.
  - `copilot/`: Text-to-SQL translator and classifier services.
  - `optimization/`: Inventory balancing scripts.
  - `scripts/`: DB seeder and evaluation CLIs.
- `frontend/`: React Vite application.
- `docs/`: Technical deep-dives covering compilers, security, and caching.
- `benchmarks/`: CSV records of MAPEs, F1-scores, and query latencies.
- `data/`: Sanitized, generalized sample sales order datasets.
