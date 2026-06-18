# Pioneer Pharma Dashboard: Metrics & Charts Guide

This document provides a detailed list of all Key Performance Indicators (KPIs) and visualizations available in the **Descriptive** and **Predictive Analysis** modules.

---

## 📖 Descriptive Analysis
*Historical and current operational data focus.*

### 📊 Core KPIs
*   **Total Revenue**: Overall revenue from "Sale" transactions.
*   **Total Units Sold**: Total volume of pharmaceutical units moved.

### 📈 Visualizations
*   **Average Selling Price (ASP)**: Gauge chart comparing current ASP to the 500 IQD target.
*   **Product Demand**: Bar chart showing volume distribution across categories.
*   **Regional Sales Trends**: Line chart tracking revenue over time by region (Baghdad, Basra, Erbil, Mosul, Anbar). 
    *   *Features: Supports daily drill-down.*
*   **Batch Performance**: Treemap identifying top-performing product batches.
*   **Warehouse Intensity**: Scatter chart showing transaction load/volume per warehouse.
*   **Expiry Risk**: Stacked area chart showing "Safe" vs. "Near Expiry" inventory trends.
*   **Product Revenue Contribution**: Pie chart showing revenue share by product.
    *   *Features: Supports regional drill-down for specific products.*

---

## 🔮 Predictive Analysis
*AI-driven forecasts and risk mitigation focus.*

### 📊 Predictive KPIs
*   **30-Day Sales Forecast**: Next month's predicted revenue (Prophet Model).
*   **Products at Expiry Risk**: Count of distinct products flagged by the ML pipeline.
*   **Predicted Demand**: Upcoming unit demand for the selected month.
*   **Avg Return Probability**: Likelihood of product returns based on historical patterns.
*   **Prescriptive Actions**: Count of active recommendations for inventory rebalancing.

### 📈 Deep-Dive Charts
*   **Sales Forecast Details**: High-resolution area chart for 7 to 90-day revenue projections.
*   **Expiry Risk Distribution**: Pie chart segmenting stock into Critical (≤30d), High (31-60d), and Medium (61-120d).
*   **Prevention Table**: List of top 10 batches requiring immediate sales intervention.
*   **Demand Predictions**: Horizontal bar chart forecasting specific unit needs per product/region.
*   **Return Probability Analysis**: Risk-level segmentation (High/Medium) for potential inventory returns.
*   **Prescriptive Matching Engine**: Advanced matching of near-expiry stock to high-demand regions, including **Days to Clear** and **Recommended Actions**.

---
*Generated: March 2026*
