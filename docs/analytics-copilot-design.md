# Analytics Copilot Design & Prompt Engineering

This document outlines the UX/UI layout, multi-thread session management, and context synthesis design that powers the **Pioneer Nexus Analytics Copilot**.

---

## 1. Context Synthesis & Prompt Design

The copilot synthesizes the raw query results with active UI states and dashboard metrics to generate natural, action-oriented executive summaries.

```text
Identity: You are 'PharmaIQ Expert', the central brain of Pioneer Pharma.
User Query: "{message}"

CONTEXT SOURCES:
- DB Results: {database_results}
- Descriptive Analysis: {descriptive_kpis}
- Predictive/ML Insights: {predictive_insights}

ACTIVE UI VIEW: {active_view}

INSTRUCTIONS:
1. SYNTHESIZE: Use the Descriptive and Predictive contexts to provide a comprehensive answer. If DB data is present, use it to add specific details.
2. SPEED: If 'DB Results' says 'No specific database data retrieved', rely on the Dashboard contexts.
3. FORMATTING: Use BOLDING for numbers. Use Bullet points.
   Append EXACTLY ONE chart if it adds value:
   [CHART]{"type": "bar/line/pie", "title": "Strategic Insight", "data": [{"name": "X", "value": 1}]}[/CHART]
4. Tone: Professional and Executive.
```

---

## 2. Dynamic Chart Synthesis

A key capability of the platform is the copilot's ability to inject live chart visualizations into the chat stream:
- **Parser Matcher**: The React frontend monitors the chat text for the `[CHART]` tags.
- **On-the-Fly Recharts Generation**: If detected, the frontend parses the JSON payload and renders a live, interactive `BarChart`, `LineChart`, or `PieChart` component inline in the message bubble.
- **Strategic Visualization**: Recruiters can ask queries like "Show me regional sales trend" and see a chart render directly inside the chat interface.

---

## 3. Multi-Thread Session State

The platform supports persistent, multi-thread conversations:
- **Database History**: All interactions are stored in the `chat_session_history` table in the database, complete with performance telemetry (latency, token count, cost).
- **Session Isolation**: Sessions are separated using UUIDs generated in the frontend. Clicking on a conversation retrieves only that thread's history, allowing a recruiter to test session boundaries.
- **First-Message Thread Naming**: The first message sent in a thread automatically updates the conversation title to represent the topic, providing a polished, professional chat experience.

---

## 4. Fail-Safe Fallbacks

To ensure absolute reliability in offline environments:
- **Mock Summaries**: If the LLM client encounters API token depletion or connection timeouts, the system gracefully falls back to descriptive rule-based text generation (e.g. summaries of descriptive metrics).
- **Graceful Error Banners**: If a query fails validation, the chat interface displays a polite security note rather than crashing or exposing database tracebacks.
