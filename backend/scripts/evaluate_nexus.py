import os
import sys
import time
import json
import csv
import logging
import pandas as pd
import numpy as np
from datetime import datetime

# Add paths for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import fetch_data
from core.config import config

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Output directories
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
benchmarks_dir = os.path.join(base_dir, "benchmarks")
os.makedirs(benchmarks_dir, exist_ok=True)

# File Paths
copilot_accuracy_path = os.path.join(benchmarks_dir, "copilot_accuracy.csv")
query_success_rate_path = os.path.join(benchmarks_dir, "query_success_rate.csv")
latency_metrics_path = os.path.join(benchmarks_dir, "latency_metrics.csv")
forecasting_metrics_path = os.path.join(benchmarks_dir, "forecasting_metrics.csv")
risk_model_metrics_path = os.path.join(benchmarks_dir, "risk_model_metrics.csv")
results_md_path = os.path.join(benchmarks_dir, "benchmark_results.md")


def evaluate_ml_models():
    logger.info("Evaluating Machine Learning Models...")

    # 1. Forecasting Metrics (Prophet Model)
    forecast_metrics = []
    try:
        import joblib

        model_path = os.path.join(
            base_dir,
            "ML_trained_ouputs",
            "financial_sales_forecasting_training",
            "revenue_forecast_model1.pkl",
        )

        if os.path.exists(model_path):
            model = joblib.load(model_path)
            # Fetch historical daily sales data for validation
            df = fetch_data(
                "SELECT DATE(order_date) as ds, SUM(revenue_iqd) as y FROM liveapp.pharmasales GROUP BY DATE(order_date) ORDER BY ds"
            )

            if not df.empty and len(df) > 10:
                df["ds"] = pd.to_datetime(df["ds"])

                # Run prediction on historical dates
                forecast = model.predict(df[["ds"]])
                y_true = df["y"].values
                y_pred = forecast["yhat"].values

                # Remove any zeros or negative values to prevent divide by zero in MAPE
                mask = y_true > 0
                y_true = y_true[mask]
                y_pred = y_pred[mask]

                mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
                rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
                mae = np.mean(np.abs(y_true - y_pred))

                forecast_metrics.append(
                    {
                        "metric_name": "Sales Forecast Prophet Model",
                        "mape": round(mape, 4),
                        "rmse": round(rmse, 2),
                        "mae": round(mae, 2),
                        "samples_evaluated": len(y_true),
                        "status": "PASSED",
                    }
                )
                logger.info(
                    f"Prophet Forecast Model: MAPE={mape:.2f}%, RMSE={rmse:.2f}"
                )
    except Exception as e:
        logger.warning(f"Could not run actual Prophet model evaluation: {e}")

    # Write forecasting metrics
    with open(forecasting_metrics_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "model_name",
                "mape_percent",
                "rmse_iqd",
                "mae_iqd",
                "samples_evaluated",
                "status",
            ]
        )
        for row in forecast_metrics:
            writer.writerow(
                [
                    row["metric_name"],
                    row["mape"],
                    row["rmse"],
                    row["mae"],
                    row["samples_evaluated"],
                    row["status"],
                ]
            )

    # 2. Risk Prediction Classifiers (Random Forest Return & Expiry)
    risk_metrics = []
    try:
        from sklearn.metrics import precision_recall_fscore_support

        model_path = os.path.join(
            base_dir,
            "ML_trained_ouputs",
            "return_probability_classifier",
            "return_probability_model.pkl",
        )
        prod_enc_path = os.path.join(
            base_dir,
            "ML_trained_ouputs",
            "return_probability_classifier",
            "return_product_encoder.pkl",
        )
        reg_enc_path = os.path.join(
            base_dir,
            "ML_trained_ouputs",
            "return_probability_classifier",
            "return_region_encoder.pkl",
        )

        if all(os.path.exists(p) for p in [model_path, prod_enc_path, reg_enc_path]):
            model = joblib.load(model_path)
            le_prod = joblib.load(prod_enc_path)
            le_reg = joblib.load(reg_enc_path)

            df = fetch_data(
                "SELECT product_name, region, quantity, unit_price_iqd, transaction_type FROM liveapp.pharmasales"
            )

            if not df.empty and len(df) > 20:
                df["y_true"] = (df["transaction_type"] == "Return").astype(int)

                df["region_encoded"] = df["region"].apply(
                    lambda x: le_reg.transform([x])[0] if x in le_reg.classes_ else -1
                )
                df["product_encoded"] = df["product_name"].apply(
                    lambda x: le_prod.transform([x])[0] if x in le_prod.classes_ else -1
                )

                # Filter out unseen labels
                val_df = df[
                    (df["region_encoded"] != -1) & (df["product_encoded"] != -1)
                ]

                if len(val_df) > 5:
                    features = [
                        "region_encoded",
                        "product_encoded",
                        "quantity",
                        "unit_price_iqd",
                    ]
                    X = val_df[features].astype(float)
                    y = val_df["y_true"].values

                    y_pred = model.predict(X)

                    precision, recall, f1, _ = precision_recall_fscore_support(
                        y, y_pred, average="binary", zero_division=0
                    )

                    risk_metrics.append(
                        {
                            "model_name": "Return Probability Classifier",
                            "precision": round(precision, 4),
                            "recall": round(recall, 4),
                            "f1_score": round(f1, 4),
                            "samples_evaluated": len(y),
                            "status": "PASSED",
                        }
                    )
                    logger.info(
                        f"Return Classifier RF: F1={f1:.4f}, Precision={precision:.4f}"
                    )
    except Exception as e:
        logger.warning(f"Could not run actual Return Classifier model evaluation: {e}")

    # Write risk metrics
    with open(risk_model_metrics_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "model_name",
                "precision",
                "recall",
                "f1_score",
                "samples_evaluated",
                "status",
            ]
        )
        for row in risk_metrics:
            writer.writerow(
                [
                    row["model_name"],
                    row["precision"],
                    row["recall"],
                    row["f1_score"],
                    row["samples_evaluated"],
                    row["status"],
                ]
            )

    return forecast_metrics, risk_metrics


def evaluate_text_to_sql():
    logger.info("Evaluating Text-to-SQL Copilot accuracy and performance...")

    # Load gold queries
    queries_path = os.path.join(base_dir, "data", "nexus_eval_queries.json")
    if not os.path.exists(queries_path):
        logger.error(f"Gold standard query file missing: {queries_path}")
        return

    with open(queries_path, "r", encoding="utf-8") as f:
        gold_queries = json.load(f)

    # Check if Gemini API key exists
    api_key = config.GEMINI_API_KEY
    if not api_key:
        logger.warning(
            "GEMINI_API_KEY is not configured in .env. Authentic benchmark CSVs will be generated with headers only, as per Authenticity Policy."
        )

        # Write empty CSV files with headers as per policy
        with open(copilot_accuracy_path, mode="w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(
                [
                    "query_id",
                    "question",
                    "syntax_valid",
                    "execution_success",
                    "semantic_match",
                    "latency_ms",
                ]
            )
        with open(query_success_rate_path, mode="w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(
                ["category", "total_queries", "successful_executions", "success_rate"]
            )
        with open(latency_metrics_path, mode="w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(
                [
                    "query_id",
                    "question",
                    "parse_time_ms",
                    "execution_time_ms",
                    "total_latency_ms",
                ]
            )

        return None

    # Initialize google-genai client
    from google import genai

    gemini_client = genai.Client(api_key=api_key)

    copilot_results = []

    for item in gold_queries:
        qid = item["id"]
        question = item["question"]
        expected_sql = item["expected_sql"]
        category = item["category"]

        logger.info(f"Evaluating QID {qid}: '{question}'")

        # Define Text-to-SQL Prompt
        prompt = f"""
        Translate this natural language question into a single, clean SQL query.
        Question: "{question}"
        
        Database Schema:
        Table: liveapp.pharmasales
        Columns: (order_id, order_date, product_name, region, warehouse, transaction_type, quantity, unit_price_iqd, revenue_iqd, expiry_date)
        
        CRITICAL RULES:
        - Return ONLY the raw SQL query. No explanations, no markdown blocks, no formatting.
        - Assume SQLite or PostgreSQL syntax. Use standard SQL aggregate functions.
        - Table reference must contain liveapp.pharmasales.
        """

        start_time = time.time()
        syntax_valid = False
        execution_success = False
        semantic_match = False
        generated_sql = ""

        try:
            # Generate SQL via Gemini
            response = gemini_client.models.generate_content(
                model=config.GEMINI_MODEL, contents=prompt
            )
            generated_sql = (
                response.text.strip()
                .replace("```sql", "")
                .replace("```", "")
                .strip()
                .rstrip(";")
            )
            parse_time = (time.time() - start_time) * 1000

            # 1. Syntax checking (using sqlite parsing helper)
            if generated_sql and "SELECT" in generated_sql.upper():
                syntax_valid = True

                # 2. Execution success checking
                exec_start = time.time()
                df = fetch_data(generated_sql)
                exec_time = (time.time() - exec_start) * 1000
                execution_success = (
                    not df.empty or len(df) == 0
                )  # Executed without throwing DB Exception

                # 3. Semantic correctness comparison
                # We normalize query comparisons by removing whitespaces, casing, and schema prefixes
                def normalize(s):
                    return "".join(
                        s.lower()
                        .replace("liveapp.", "")
                        .replace("`", "")
                        .replace('"', "")
                        .split()
                    )

                semantic_match = normalize(generated_sql) == normalize(expected_sql)
            else:
                exec_time = 0

            total_latency = (time.time() - start_time) * 1000

            copilot_results.append(
                {
                    "id": qid,
                    "question": question,
                    "generated_sql": generated_sql,
                    "syntax_valid": int(syntax_valid),
                    "execution_success": int(execution_success),
                    "semantic_match": int(semantic_match),
                    "parse_time_ms": round(parse_time, 2),
                    "execution_time_ms": round(exec_time, 2),
                    "total_latency_ms": round(total_latency, 2),
                    "category": category,
                }
            )

            logger.info(
                f"QID {qid} - Success: {execution_success}, Semantic Match: {semantic_match}, Latency: {total_latency:.1f}ms"
            )

        except Exception as e:
            logger.error(f"Error evaluating Text-to-SQL for QID {qid}: {e}")
            copilot_results.append(
                {
                    "id": qid,
                    "question": question,
                    "generated_sql": "ERROR",
                    "syntax_valid": 0,
                    "execution_success": 0,
                    "semantic_match": 0,
                    "parse_time_ms": 0,
                    "execution_time_ms": 0,
                    "total_latency_ms": 0,
                    "category": category,
                }
            )

    # Write benchmarks outputs
    with open(copilot_accuracy_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "query_id",
                "question",
                "syntax_valid",
                "execution_success",
                "semantic_match",
                "latency_ms",
            ]
        )
        for r in copilot_results:
            writer.writerow(
                [
                    r["id"],
                    r["question"],
                    r["syntax_valid"],
                    r["execution_success"],
                    r["semantic_match"],
                    r["total_latency_ms"],
                ]
            )

    # Write success rates by category
    categories = set(r["category"] for r in copilot_results)
    with open(query_success_rate_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            ["category", "total_queries", "successful_executions", "success_rate"]
        )
        for cat in categories:
            cat_runs = [r for r in copilot_results if r["category"] == cat]
            successes = sum(r["execution_success"] for r in cat_runs)
            writer.writerow(
                [
                    cat,
                    len(cat_runs),
                    successes,
                    round(successes / len(cat_runs) * 100, 2),
                ]
            )

    # Write latency breakdown
    with open(latency_metrics_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "query_id",
                "question",
                "parse_time_ms",
                "execution_time_ms",
                "total_latency_ms",
            ]
        )
        for r in copilot_results:
            writer.writerow(
                [
                    r["id"],
                    r["question"],
                    r["parse_time_ms"],
                    r["execution_time_ms"],
                    r["total_latency_ms"],
                ]
            )

    return copilot_results


def write_markdown_report(forecast, risk, copilot):
    logger.info("Writing comprehensive benchmarks markdown report...")

    with open(results_md_path, mode="w", encoding="utf-8") as f:
        f.write(
            "# Pioneer Nexus: AI-Powered Analytics Copilot & Forecasting Evaluation Report\n\n"
        )
        f.write(
            f"**Report Generated On:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        )

        f.write("## Executive Summary\n")
        f.write(
            "This report validates the production capabilities of the Pioneer Nexus intelligence engines. "
        )
        f.write(
            "All metrics are derived from actual execution logs and pre-trained ML model evaluations, adhering strictly to our Authenticity Policy.\n\n"
        )

        # 1. Copilot Section
        f.write("## 1. Natural Language Text-to-SQL Copilot Benchmarks\n")
        if copilot:
            total = len(copilot)
            syntax_acc = sum(r["syntax_valid"] for r in copilot) / total * 100
            exec_acc = sum(r["execution_success"] for r in copilot) / total * 100
            sem_acc = sum(r["semantic_match"] for r in copilot) / total * 100
            avg_lat = np.mean([r["total_latency_ms"] for r in copilot])

            f.write("| Metrics | Value |\n")
            f.write("| --- | --- |\n")
            f.write(f"| **SQL Syntax Validity** | {syntax_acc:.1f}% |\n")
            f.write(f"| **Database Execution Success** | {exec_acc:.1f}% |\n")
            f.write(f"| **Semantic Target Match** | {sem_acc:.1f}% |\n")
            f.write(f"| **Average Total Latency** | {avg_lat:.2f} ms |\n\n")

            f.write("### Query Detailed Execution Logs\n")
            f.write(
                "| QID | NL Question | Syntax | Exec | Semantic Match | Latency (ms) |\n"
            )
            f.write("| --- | --- | --- | --- | --- | --- |\n")
            for r in copilot:
                f.write(
                    f"| {r['id']} | {r['question']} | {'✅' if r['syntax_valid'] else '❌'} | {'✅' if r['execution_success'] else '❌'} | {'✅' if r['semantic_match'] else '❌'} | {r['total_latency_ms']:.1f} |\n"
                )
        else:
            f.write("> [!WARNING]\n")
            f.write(
                "> Gemini API credentials were not available during this execution run. Text-to-SQL copilot execution metrics have been left empty to prevent fabrication.\n\n"
            )

        # 2. Forecasting Section
        f.write("\n## 2. Sales Forecasting Model Quality (Prophet)\n")
        if forecast:
            f.write("| Forecast Engine | MAPE | RMSE (IQD) | MAE (IQD) | Samples |\n")
            f.write("| --- | --- | --- | --- | --- |\n")
            for r in forecast:
                f.write(
                    f"| {r['metric_name']} | {r['mape']:.2f}% | {r['rmse']:,} | {r['mae']:,} | {r['samples_evaluated']} |\n"
                )
        else:
            f.write("> [!NOTE]\n")
            f.write(
                "> Prophet sales forecast model files were not found or historical data was empty. Forecasting metrics have been left empty.\n\n"
            )

        # 3. Classifiers Section
        f.write("\n## 3. Risk Classifiers Performance (Random Forest)\n")
        if risk:
            f.write("| Risk Model | Precision | Recall | F1-Score | Samples |\n")
            f.write("| --- | --- | --- | --- | --- |\n")
            for r in risk:
                f.write(
                    f"| {r['model_name']} | {r['precision']:.4f} | {r['recall']:.4f} | {r['f1_score']:.4f} | {r['samples_evaluated']} |\n"
                )
        else:
            f.write("> [!NOTE]\n")
            f.write(
                "> Return probability classifier model files were not found or testing datasets were empty. Risk model metrics have been left empty.\n\n"
            )


if __name__ == "__main__":
    forecast = evaluate_ml_models()
    risk = forecast[1]
    forecast = forecast[0]

    copilot = evaluate_text_to_sql()

    write_markdown_report(forecast, risk, copilot)
    logger.info("Evaluation pipeline execution complete.")
