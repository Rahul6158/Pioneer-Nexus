# Technical Design Decisions & Trade-Offs

This document outlines the architectural choices, tech stack decisions, and safety trade-offs implemented in the **Pioneer Nexus Analytics Platform**.

---

## 1. Local SQLite Seeding Fallback

**Decision**: The platform uses local SQLite database file databases by default, fallback from PostgreSQL if `DATABASE_URL` is omitted. On startup, the setup script automatically seeds SQLite tables with realistic sales transaction logs.

- **Why**: Allows recruiters to immediately run the backend (`python main.py` or `python setup_db.py`) without configuring a PostgreSQL database locally.
- **Trade-Off**: SQLite does not support advanced PostgreSQL partitioning or user-defined schemas (like `liveapp.`). To resolve this, a query schema translation filter is injected in `fetch_data` to translate PG queries to SQLite format transparently.

---

## 2. Lazy Model Loading with Thread-Safe Locks

**Decision**: Machine learning models (Prophet and Random Forests) are loaded dynamically inside `MLModels` via double-checked thread-safe locks.

- **Why**: Loading large Prophet models (which can exceed 100MB) synchronously during startup blocks server initiation, causing orchestrators to fail health checks.
- **Trade-Off**: The first API request requiring ML inference (e.g. `/api/predict/sales-forecast`) experiences a ~2-second loading latency, but subsequent requests execute in milliseconds.

---

## 3. Dual-Layer Caching Strategy

**Decision**: Implements in-memory `cachetools.TTLCache` layers: 60 seconds for dashboard database summaries, and 1 hour for Gemini Text-to-SQL compile summaries.

- **Why**: Drastically reduces Gemini token usage and API costs while protecting the database from high-concurrency read-heavy traffic.
- **Trade-Off**: Dashboard metrics are not fully real-time (up to 60 seconds stale), which is an acceptable compromise for executive analytics.

---

## 4. AST-like SQL Filtering vs. Direct Execution

**Decision**: Query safety is enforced by checking generated SQL strings against a regex-based blocklist (blocking `DROP`, `DELETE`, `TRUNCATE`, and multi-statement semicolons) instead of executing queries on a restricted DB user.

- **Why**: Provides an application-level guard rail that runs instantly without requiring complex database user and role administration.
- **Trade-Off**: Application-level filtering is less secure than strict database-level grants. In a real production deployment, this should always be combined with read-only user access roles.
