import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Package, RotateCcw, Zap, Target, Activity } from 'lucide-react';

const ModelDetails = () => {
  const models = [
    {
      id: "sales_forecast",
      name: "Financial Sales Forecasting",
      status: "Active (Trained)",
      icon: TrendingUp,
      color: "#8b5cf6", // Purple
      description: "Generates multi-day revenue predictions based on historical sales volume, seasonality, and regional performance trends.",
      why_necessary: "Traditional static forecasts are often inaccurate. This ML model constantly adjusts to market shifts, allowing finance teams to project cash flow accurately and manage budgets.",
      details: [
        "Algorithm: Prophet (Trained Meta Model)",
        "Input Features: Historical Revenue, Date Variables, Seasonality",
        "Output: Daily Predicted Revenue (IQD) & Confidence Score",
        "Refresh Rate: Daily at Midnight"
      ]
    },
    {
      id: "demand_prediction",
      name: "Geographic Demand Prediction",
      status: "Active (Trained)",
      icon: Package,
      color: "#10b981", // Green
      description: "Predicts precisely how many units of specific products will be demanded in specific regions over the upcoming month.",
      why_necessary: "Prevents stockouts in high-demand areas while reducing overstock in low-demand areas. Essential for efficient supply chain distribution and warehouse balancing.",
      details: [
        "Algorithm: Random Forest Regressor (RFR)",
        "Input Features: Product Categories, Regions, Monthly Cycles",
        "Output: Predicted Unit Demand by Region",
        "Refresh Rate: Weekly"
      ]
    },
    {
      id: "expiry_risk",
      name: "Expiry Risk Detection",
      status: "Active (Engine)",
      icon: AlertTriangle,
      color: "#ef4444", // Red
      description: "Continuously scans global inventory to identify batches that are nearing expiration and calculates the financial risk exposure.",
      why_necessary: "Pharmaceutical products have strict shelf lives. Identifying impending expiries early allows the sales team to apply discounts, saving revenue that would otherwise be entirely lost.",
      details: [
        "Algorithm: Engine-Driven Heuristic Service",
        "Input Features: Expiry Date, Current Date, Batch Quantity, ASP",
        "Output: Risk Level (Critical/High/Medium/Low) & Potential Value Loss",
        "Refresh Rate: Real-time"
      ]
    },
    {
      id: "return_prob",
      name: "Return Probability Classifier",
      status: "Active (Trained)",
      icon: RotateCcw,
      color: "#f59e0b", // Amber
      description: "Analyzes product transaction types and historical return rates to determine the likelihood of future customer returns.",
      why_necessary: "High return rates severely impact logistics efficiency and profitability. This model isolates problematic products so QA teams can investigate issues before more returns occur.",
      details: [
        "Algorithm: Random Forest Classifier",
        "Input Features: Region, Product, Transaction Quantity, Unit Price",
        "Output: Percentage Probability of Return per Product",
        "Refresh Rate: Real-time on Sale"
      ]
    },
    {
      id: "prescriptive",
      name: "Prescriptive Copilot Engine",
      status: "Active (LLM + Logic)",
      icon: Target,
      color: "#2563eb", // Blue
      description: "The core intelligence engine that connects raw data to natural language queries, translating user questions into valid SQL and formatting answers.",
      why_necessary: "Executives need instant answers without writing code. This system bridges the gap between complex PostgreSQL databases and conversational AI, democratizing data access.",
      details: [
        "Algorithm: Gemini 2.0 Flash + Custom SQL Router",
        "Input Features: User Natural Language, DB Schema Context",
        "Output: Parsed Data, Extracted Insights, SQL Queries",
        "Refresh Rate: Real-time on Query"
      ]
    },
    {
      id: "expiry_match",
      name: "Expiry-Demand Match Engine",
      status: "Active (Prescriptive)",
      icon: Zap,
      color: "#0ea5e9", // Light Blue
      description: "Applies prescriptive analytics to match near-expiry inventory batches with geographic regions exhibiting high demand velocity for those specific products.",
      why_necessary: "Identification of risk is only half the battle. This engine closes the loop by automatically suggesting exactly where to move products to maximize recovery value before they expire.",
      details: [
        "Algorithm: Optimized Prescriptive Matching (Vectorized)",
        "Input Features: Batch Expiry, Regional Velocity, Days to Clear, Value at Risk",
        "Output: Recommended Strategy (Push/Promote/Bundle) & Region Assignment",
        "Refresh Rate: Real-time Analysis"
      ]
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: 'var(--green-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--green-md)'
                }}>
                    <Brain size={32} color="var(--green)" />
                </div>
                <div>
                    <div style={{ display: 'inline-flex', padding: '4px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: '8px' }}>🚀 System Transparency</div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text)', margin: 0, letterSpacing: '-1px' }}>AI Model Data Sheet</h1>
                    <p style={{ fontSize: '16px', color: 'var(--text2)', margin: '4px 0 0 0', lineHeight: 1.5 }}>Comprehensive technical details on the 6 live intelligence engines powering your dashboard.</p>
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {models.map(model => (
                <div key={model.id} style={{
                    background: 'var(--surface)',
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    display: 'flex',
                    boxShadow: 'var(--sh2)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }} className="model-card-hover">
                    <div style={{
                        width: '8px',
                        background: model.color,
                        flexShrink: 0
                    }} />
                    
                    <div style={{ padding: '32px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '16px',
                                    background: `${model.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid ${model.color}30`
                                }}>
                                    <model.icon size={32} color={model.color} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>{model.name}</h2>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${model.color}10`, color: model.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: `1px solid ${model.color}30` }}>
                                        <Activity size={14} />
                                        {model.status}
                                    </div>
                                </div>
                            </div>
                        </div>
 
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.5fr) 1fr', gap: '40px' }} className="model-grid">
                            <div>
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px', letterSpacing: '1px' }}>What it Predicts</h4>
                                    <p style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.6', borderLeft: `3px solid ${model.color}`, paddingLeft: '16px' }}>{model.description}</p>
                                </div>
                                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '20px', borderRadius: '16px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px', letterSpacing: '1px' }}>Strategic Value</h4>
                                    <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: '1.6', margin: 0 }}>{model.why_necessary}</p>
                                </div>
                            </div>
 
                            <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: model.color, marginBottom: '16px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Zap size={16} /> Technical Specifications
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text2)', fontSize: '14px', lineHeight: '1.8' }}>
                                    {model.details.map((detail, idx) => (
                                        <li key={idx} style={{ marginBottom: '8px' }}>
                                            <strong style={{ color: 'var(--text)' }}>{detail.split(':')[0]}:</strong> {detail.split(':')[1]}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
            .model-card-hover:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1) !important;
            }
            @media (max-width: 900px) {
                .model-grid {
                    grid-template-columns: 1fr !important;
                }
            }
        `}} />
    </div>
  );
};

export default ModelDetails;
