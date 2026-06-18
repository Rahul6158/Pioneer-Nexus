# Text-to-SQL & Machine Learning Evaluation Methodology

This document outlines the validation framework, metrics, and ground-truth testing protocols used to measure the accuracy and speed of the **Pioneer Nexus Analytics Platform** intelligence layers.

---

## 1. Core Evaluation Parameters

The Text-to-SQL Copilot is evaluated across four metrics to ensure it is robust enough for production deployment:

| Metric | Measurement | Verification Method |
| --- | --- | --- |
| **SQL Validity** | Syntactic correctness | Verifies if the SQL compiles and is parsed without returning a SQL syntax error. |
| **Execution Success** | Runtime execution | Executes query against the target database (SQLite/PostgreSQL) and checks for errors or timeouts. |
| **Semantic Correctness** | Intent mapping | Compares the normalized generated SQL syntax against a gold-standard hand-written target query. |
| **Average Latency** | Execution duration | Records the milliseconds elapsed from initial natural language input to database result return. |

---

## 2. Gold-Standard Evaluation Queries

Validation is run against a hand-written dataset containing 10 diverse query categories located in `data/nexus_eval_queries.json`:

1. **Aggregation**: `SELECT SUM(...)` checks for simple numeric summarizations.
2. **Grouping**: `GROUP BY` validations testing correct column categorizations (e.g. Sales by Region).
3. **Filtering**: `WHERE` clauses validating string matches and multi-conditional operators (e.g. Sales in Erbil > 100 units).
4. **Ranking & Sorting**: `ORDER BY DESC LIMIT K` testing if limits are correctly applied for top-performing filters.
5. **Calculated Ratios**: Average prices and return rates testing division accuracy without division-by-zero errors.

---

## 3. Machine Learning Model Evaluation

The evaluation framework also validates the quality of our pre-trained offline models:

- **Prophet Sales Forecast**: Computes **Mean Absolute Percentage Error (MAPE)** and **RMSE** against historical daily revenues.
- **Random Forest Classifiers**: Computes **F1-Score**, **Precision**, and **Recall** on validation sets for the returns and demand predictions.

---

## 4. Authenticity Policy

To maintain recruiter trust and professional integrity, this project enforces a **Strict Authenticity Policy**:
1. **No Synthetic Metrics**: All metrics reported in the `benchmarks/` CSV files must be generated from actual local runs.
2. **Missing Infrastructure Handling**: If the database or Gemini API keys are missing during execution, the CLI will output empty files or headers only rather than inserting simulated data.
3. **Reproducibility**: Any recruiter can reproduce the exact metrics by adding a valid `GEMINI_API_KEY` to the `.env` file and running `python backend/scripts/evaluate_nexus.py`.
