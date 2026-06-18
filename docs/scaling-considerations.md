# Scaling Considerations & Production Roadmap

This document outlines the architectural scaling strategy to grow the **Pioneer Nexus Analytics Platform** from a local portfolio app to a high-throughput, enterprise-scale platform handling millions of sales transactions.

---

## 1. Database Scaling: Partitioning & Sharding

As transaction counts exceed 10 million rows, direct scans on single tables degrade performance:

- **Geographic Partitioning**: Partition the `pharmasales` table by the `region` column. Database engines (PostgreSQL/BigQuery) can prune partitions during execution so that queries for Baghdad only scan Baghdad-specific blocks.
- **Time-Series Sharding**: Sales records can be partitioned by year/month, enabling archive procedures to run on cold historical data without impacting active sales transactions.

---

## 2. Distributed Caching (Redis Integration)

To support horizontal scaling across multiple containerized API servers:

- **State Sharing**: Replace in-memory `TTLCache` with a shared **Redis** cache cluster.
- **Cache Invalidation**: Implement event-driven cache invalidation (e.g. invalidating regional KPIs when a new transaction is committed for that region).

---

## 3. Asynchronous Inference & Model Deployment

Executing forecasting models (like Prophet) or training models in the web thread blocks server workers:

- **Celery / Redis Queue**: Move expensive forecast runs and monthly model training to asynchronous workers running Celery or RQ.
- **Model Registry (MLflow)**: Store serialized model binaries (`.pkl`) in an S3-compatible object storage registry rather than tracking them inside the git repository, loading them dynamically using MLflow APIs.

---

## 4. Pipeline Scaling & Stream Ingestion

For real-time sales transaction ingestion:

- **Kafka Stream Processing**: Stream incoming sales orders through Apache Kafka or AWS Kinesis.
- **Micro-Batching**: Buffer stream data and write in micro-batches to the database, ensuring indexes are updated efficiently without locking the tables.
