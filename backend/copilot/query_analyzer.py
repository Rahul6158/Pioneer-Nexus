def classify_query(query: str):
    query = query.lower()

    if "predict" in query or "forecast" in query:
        return "prediction"

    if "recommend" in query or "should we" in query or "what should" in query:
        return "prescriptive"

    if "revenue" in query or "sales" in query or "top" in query:
        return "analytics"

    return "general"
