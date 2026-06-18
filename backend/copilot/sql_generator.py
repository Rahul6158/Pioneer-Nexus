def generate_sql(query: str):
    if "revenue by region" in query.lower():
        return """
        SELECT region, SUM(revenue_iqd) as total_revenue
        FROM liveapp.pharmasales
        GROUP BY region
        ORDER BY total_revenue DESC
        """

    if "top product" in query.lower():
        return """
        SELECT product_name, SUM(quantity) as total_quantity
        FROM liveapp.pharmasales
        GROUP BY product_name
        ORDER BY total_quantity DESC
        LIMIT 1
        """

    if "top 5 products" in query.lower():
        return """
        SELECT product_name, SUM(quantity) as total_quantity
        FROM liveapp.pharmasales
        GROUP BY product_name
        ORDER BY total_quantity DESC
        LIMIT 5
        """

    if "total revenue" in query.lower():
        return """
        SELECT SUM(revenue_iqd) as overall_revenue
        FROM liveapp.pharmasales
        """

    return None
