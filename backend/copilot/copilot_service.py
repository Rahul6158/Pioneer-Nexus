from copilot.query_analyzer import classify_query
from copilot.sql_generator import generate_sql


def run_copilot(query):
    query_type = classify_query(query)

    if query_type == "analytics":
        sql = generate_sql(query)

        if sql:
            return {
                "type": "sql",
                "query": sql,
                "message": "Here is the SQL query to get that data:",
            }
        else:
            return {
                "type": "analytics",
                "message": "I can help analyze sales and revenue data. Please be more specific (e.g., 'revenue by region', 'top product').",
            }

    if query_type == "prescriptive":
        return {
            "type": "recommendation",
            "message": "Checking optimization engine for recommendations...",
            "endpoint": "/api/recommendations",
        }

    if query_type == "prediction":
        return {
            "type": "prediction",
            "message": "Checking predictive models...",
            "endpoint": "/api/predict/all",
        }

    return {
        "type": "general",
        "message": "I am PharmaIQ Copilot. I can help with analytics (e.g. 'Show revenue by region'), predictions (e.g. 'Predict demand'), and recommendations (e.g. 'What should we do about inventory?').",
    }
