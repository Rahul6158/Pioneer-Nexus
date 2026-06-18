# Production Engineering Lessons & Best Practices

This document outlines key production lessons and real-world engineering practices implemented to ensure reliability, visibility, and security in **Pioneer Nexus**.

---

## 1. Rate Limiting & Denial of Service Protection

**Lesson**: Exposing GenAI endpoints without strict rate limits can lead to massive token consumption bills and resource exhaustion.

**Solution**:
- **SlowAPI integration**: Implements token bucket-based rate limiting on the `/api/copilot-chat` endpoint (`10/minute`) and `/api/dashboard-summary` (`30/minute`).
- **Graceful Rejections**: Requests exceeding limits are intercepted at the middleware layer and return a clean HTTP 429 Too Many Requests response with a "Retry-After" header, preventing downstream thread starvation.

---

## 2. Structured JSON Logging for Observability

**Lesson**: Standard text logging makes it extremely difficult to parse and trace operations across multiple microservices.

**Solution**:
- **Structured JSON Formatting**: Overrides standard logging with a custom JSON formatter. Every log contains timestamps in ISO-8601 format, level, logger class, message, and execution details.
- **Context Timers**: Utilizes the `LogExecutionTime` context manager to log execution durations (ms) of expensive blocks, enabling developers to identify sluggish database queries.

---

## 3. Database Statement Timeouts

**Lesson**: Slow or unindexed database queries can consume connection pools, blocking all incoming API requests.

**Solution**:
- **Connection timeouts**: The database connection pool is configured with `connect_timeout = 5` and runs `SET statement_timeout = 45000` (45 seconds) before query execution.
- **Auto-aborting**: Any query executing longer than 45 seconds is automatically terminated by the database engine, freeing up the connection thread.

---

## 4. Connection Pooling Optimization

**Lesson**: Initializing database connections per request introduces high TCP handshake latency.

**Solution**:
- **QueuePool Tuning**: Configures connection pools with a baseline of 10 connections always kept alive and ready, allowing a max overflow of 20 connections during traffic surges, and recycling stale connections hourly.
