import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, AlertTriangle, Package, RotateCcw, Brain,
  Activity, ChevronDown, ChevronUp, Loader2, Zap,
  Calendar, MapPin, DollarSign, AlertCircle
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000/api";
const DASHBOARD_COLORS = [
  '#DC2626', '#1D4ED8', '#16A34A', '#D97706', '#7C3AED', '#0891B2', '#DB2777', '#CA8A04',
  '#4F46E5', '#0D9488', '#F59E0B', '#2EC4B6', '#A855F7', '#2DD4BF', '#60A5FA', '#F472B6',
  '#FB923C', '#38BDF8', '#4ADE80', '#E11D48', '#10B981', '#1E48E5', '#FF9F1C', '#E63946',
  '#CBF3F0', '#FFBF69', '#E53935', '#219EBC', '#FB8500', '#6A0572', '#AB83A1', '#C9184A',
  '#FF477E', '#FF85A1', '#FFC2D4', '#590D22', '#800F2F', '#A4133C', '#FF4D6D', '#FF758F',
  '#FFCCD5', '#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#7400B8', '#6930C3',
  '#5E60CE', '#5390D9', '#4EA8DE', '#48CAE4', '#00F5D4', '#00BBF9', '#F15BB5', '#FEE440',
  '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#F8FAFC', '#1B2A3B',
  '#243B55', '#546E7A', '#78909C', '#90A4AE', '#ECEFF1', '#E53935', '#B71C1C', '#FB8C00',
  '#E65100', '#FDD835', '#F9A825', '#43A047', '#2E7D32', '#1E88E5', '#1565C0', '#8E24AA',
  '#3D405B', '#F2CC8F', '#81B29A', '#F4845F', '#588157', '#A3B18A', '#344E41'
];

const LOCAL_TRANSLATIONS = {
  en: {
    predictiveAnalytics: "Predictive Analytics",
    forecastDescription: "AI-powered forecasts and risk predictions for strategic decision making",
    trainingModels: "Training ML Models & Generating Predictions...",
    mlModelsActive: "ML Models Active",
    demandModel: "Demand Model",
    salesModel: "Sales Model",
    trained: "Trained",
    fallback: "Fallback",
    prescriptiveLastRun: "Prescriptive Engine Last Run",
    strategicOutlook: "Strategic Future Outlook",
    geminiInsight: "Gemini AI Prediction Insight",
    multiModelForecast: "Multi-Model Forecast",
    predictionsActive: "Predictions Active",
    forwardEdge: "Forward-Looking Edge",
    salesForecast30d: "30-Day Sales Forecast",
    avgDaily: "Avg daily",
    loading: "Loading...",
    productsExpiryRisk: "Products at Expiry Risk",
    critical: "Critical",
    highRisk: "High Risk",
    predictedDemand: "Predicted Demand",
    marketUnits: "Market entry units for",
    avgReturnProb: "Avg Return Probability",
    prescriptiveActions: "Prescriptive Actions",
    matchEngine: "Match Engine",
    atRisk: "at risk",
    salesForecastDetails: "Sales Forecast Details",
    allRegions: "All Regions",
    days7: "7 Days",
    days14: "14 Days",
    days30: "30 Days",
    days60: "60 Days",
    days90: "90 Days",
    predictedRevenue: "Predicted Revenue",
    expiryRiskAnalysis: "Expiry Risk Analysis",
    riskDistribution: "Risk Distribution",
    preventiveRisks: "All Preventive Risks",
    days: "days",
    valueLoss: "Value Loss",
    units: "units",
    highestDemand: "Highest Projected Demand",
    avgConfidence: "Avg Confidence",
    totalForecast: "Total Forecast",
    trendDirection: "Trend Direction",
    predictionInsight: "Prediction Insight",
    region: "Region"
  },
  ar: {
    predictiveAnalytics: "التحليل التنبئي",
    forecastDescription: "توقعات مدعومة بالذكاء الاصطناعي وتنبؤات المخاطر لاتخاذ القرارات الاستراتيجية",
    trainingModels: "تدريب نماذج التعلم الآلي وتوليد التوقعات...",
    mlModelsActive: "نماذج التعلم الآلي نشطة",
    demandModel: "نموذج الطلب",
    salesModel: "نموذج المبيعات",
    trained: "مدرب",
    fallback: "احتياطي",
    prescriptiveLastRun: "آخر تشغيل للمحرك التوجيهي",
    strategicOutlook: "النظرة المستقبلية الاستراتيجية",
    geminiInsight: "رؤية تنبؤ Gemini AI",
    multiModelForecast: "توقعات متعددة النماذج",
    predictionsActive: "التوقعات النشطة",
    forwardEdge: "ميزة استشراف المستقبل",
    salesForecast30d: "توقعات المبيعات لمدة 30 يوماً",
    avgDaily: "المتوسط اليومي",
    loading: "جاري التحميل...",
    productsExpiryRisk: "المنتجات المعرضة لخطر انتهاء الصلاحية",
    critical: "حرج",
    highRisk: "خطر عالٍ",
    predictedDemand: "الطلب المتوقع",
    marketUnits: "وحدات دخول السوق لشهر",
    avgReturnProb: "متوسط احتمالية الإرجاع",
    prescriptiveActions: "الإجراءات التوجيهية",
    matchEngine: "محرك المطابقة",
    atRisk: "معرض للخطر",
    salesForecastDetails: "تفاصيل توقعات المبيعات",
    allRegions: "جميع المناطق",
    days7: "7 أيام",
    days14: "14 يوماً",
    days30: "30 يوماً",
    days60: "60 يوماً",
    days90: "90 يوماً",
    predictedRevenue: "الإيرادات المتوقعة",
    expiryRiskAnalysis: "تحليل مخاطر انتهاء الصلاحية",
    riskDistribution: "توزيع المخاطر",
    preventiveRisks: "جميع المخاطر الوقائية",
    days: "أيام",
    valueLoss: "خسارة القيمة",
    units: "وحدات",
    highestDemand: "أعلى طلب متوقع",
    avgConfidence: "متوسط الثقة",
    totalForecast: "إجمالي التوقعات",
    trendDirection: "اتجاه الاتجاه",
    predictionInsight: "رؤية التنبؤ",
    region: "المنطقة"
  }
};

const PredictiveAnalysis = ({ 
  language = 'en',
  demandPred: propDemandPred,
  expiryRisk: propExpiryRisk,
  returnProb: propReturnProb,
  salesForecast: propSalesForecast,
  expiryMatchResults: propExpiryMatchResults,
  modelStatus: propModelStatus,
  isLoading = false,
  onRefresh,
  initialCard = null
}) => {
  const lt = LOCAL_TRANSLATIONS[language] || LOCAL_TRANSLATIONS.en;
  
  // Internal loading state for local filters
  const [localLoading, setLocalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCard, setExpandedCard] = useState(initialCard);

  useEffect(() => {
    if (initialCard) {
      setExpandedCard(initialCard);
    }
  }, [initialCard]);

  // Prediction data states (initialized from props)
  const [salesForecast, setSalesForecast] = useState(propSalesForecast);
  const [expiryRisk, setExpiryRisk] = useState(propExpiryRisk);
  const [returnProb, setReturnProb] = useState(propReturnProb);
  const [demandPred, setDemandPred] = useState(propDemandPred);
  const [expiryMatchResults, setExpiryMatchResults] = useState(propExpiryMatchResults);
  const [modelStatus, setModelStatus] = useState(propModelStatus);

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [forecastDays, setForecastDays] = useState(30);
  const [selectedMonth, setSelectedMonth] = useState(new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date()));

  // AI Summary state
  const [aiSummary, setAiSummary] = useState("AI is predicting future trends and analyzing risk factors...");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState(null);
  const [prescriptivePage, setPrescriptivePage] = useState(1);
  const [prescriptiveRowsPerPage, setPrescriptiveRowsPerPage] = useState(5);

  const regions = ['All Regions', 'Baghdad', 'Basra', 'Erbil', 'Mosul', 'Anbar'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMap = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };

  // Local sync with props if they change globally
  useEffect(() => {
    if (propSalesForecast) setSalesForecast(propSalesForecast);
    if (propExpiryRisk) setExpiryRisk(propExpiryRisk);
    if (propReturnProb) setReturnProb(propReturnProb);
    if (propDemandPred) setDemandPred(propDemandPred);
    if (propExpiryMatchResults) setExpiryMatchResults(propExpiryMatchResults);
    if (propModelStatus) setModelStatus(propModelStatus);
    
    // Stop loading if data is ready OR root fetch finished
    if (propSalesForecast || propExpiryRisk || propDemandPred || (!isLoading && propSalesForecast !== undefined)) {
      setLoading(false);
    }
  }, [propSalesForecast, propExpiryRisk, propReturnProb, propDemandPred, propExpiryMatchResults, propModelStatus, isLoading]);

  // Fallback if component mounts and props are already there
  useEffect(() => {
    if (propSalesForecast || propExpiryRisk || propDemandPred) {
      setLoading(false);
    }
  }, []);

  // Use sessionStorage as fallback if props are missing
  useEffect(() => {
    if (!propSalesForecast) {
      const cachedData = sessionStorage.getItem('predictive_data');
      if (cachedData) {
        try {
          const { allPred, expiry, returns, sales, match, timestamp } = JSON.parse(cachedData);
          // Cache valid for 30 seconds
          if (Date.now() - timestamp < 30 * 1000) {
            setDemandPred(allPred.demand_predictions);
            setExpiryRisk(expiry);
            setReturnProb(returns);
            setSalesForecast(sales);
            setExpiryMatchResults(match);
            setModelStatus(allPred.model_status);
            setLoading(false);
          }
        } catch (e) {
          console.error("Cache parsing error", e);
        }
      }
    }
  }, []);

  const forecastMountRef = React.useRef(true);
  useEffect(() => {
    if (forecastMountRef.current) {
      forecastMountRef.current = false;
      return;
    }
    const handler = setTimeout(() => {
      fetchSalesForecast();
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [selectedRegion, forecastDays]);

  const demandMountRef = React.useRef(true);
  useEffect(() => {
    if (demandPred) {
      if (demandMountRef.current) {
        demandMountRef.current = false;
        return;
      }
      const handler = setTimeout(() => {
        updateDemand();
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [selectedMonth]);

  const updateDemand = async () => {
    try {
      const promises = demandPred.slice(0, 5).map(p =>
        axios.post(`${API_BASE}/predict/demand`, {
          product: p.product,
          region: p.region,
          month: monthMap[selectedMonth],
          language: language
        })
      );
      const results = await Promise.all(promises);
      setDemandPred(results.map(r => r.data));
    } catch (err) {
      console.error("Demand Update Error:", err);
    }
  };

  useEffect(() => {
    if (salesForecast && expiryRisk && demandPred && returnProb) {
      const getPredictiveSummary = async () => {
        try {
          const res = await axios.post(`${API_BASE}/predictive-summary`, {
            expiry_risk: expiryRisk,
            demand_pred: demandPred,
            return_prob: returnProb,
            prescriptive_match: expiryMatchResults,
            language: language
          });
          setAiSummary(res.data.summary);
        } catch (err) {
          console.error("Predictive Summary Error:", err);
        }
      };
      getPredictiveSummary();
    }
  }, [salesForecast, expiryRisk, demandPred, returnProb]);

  const fetchAllPredictions = async () => {
    try {
      setLoading(true);
      const [allPred, expiry, returns, sales, match] = await Promise.all([
        axios.get(`${API_BASE}/predict/all`),
        axios.get(`${API_BASE}/predict/expiry-risk`),
        axios.get(`${API_BASE}/predict/return-probability`),
        axios.get(`${API_BASE}/predict/sales-forecast?days=30`),
        axios.get(`${API_BASE}/predict/expiry-demand-match`)
      ]);

      setAllPredictions(allPred.data);
      setExpiryRisk(expiry.data);
      setReturnProb(returns.data);
      setSalesForecast(sales.data);
      setDemandPred(allPred.data.demand_predictions);
      setExpiryMatchResults(match.data);

      // Save to cache
      sessionStorage.setItem('predictive_data', JSON.stringify({
        allPred: allPred.data,
        expiry: expiry.data,
        returns: returns.data,
        sales: sales.data,
        match: match.data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const [isFetchingForecast, setIsFetchingForecast] = useState(false);

  const fetchSalesForecast = async () => {
    try {
      setIsFetchingForecast(true);
      const regionParam = selectedRegion !== 'All Regions' ? `&region=${selectedRegion}` : '';
      const url = `${API_BASE}/predict/sales-forecast?days=${forecastDays}${regionParam}`;
      console.log('Fetching:', url);
      const response = await axios.get(url);
      setSalesForecast(response.data);
    } catch (error) {
      console.error('Error fetching sales forecast:', error);
    } finally {
      setIsFetchingForecast(false);
    }
  };

  const handlePredictDemand = async (product, region) => {
    try {
      const response = await axios.post(`${API_BASE}/predict/demand`, {
        product,
        region,
        month: new Date().getMonth() + 1
      });
      return response.data;
    } catch (error) {
      console.error('Error predicting demand:', error);
      return null;
    }
  };

  const toggleCard = (card) => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  // KPI Card Component
  const KPICard = ({ title, value, subtitle, icon: Icon, color, trend, onClick, isExpanded }) => (
    <div
      className={`kpi-card predictive ${color} ${isExpanded ? 'expanded' : ''}`}
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        padding: '24px',
        color: 'var(--text)',
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid var(--border)`,
        boxShadow: isExpanded ? `0 0 0 2px ${color}` : 'var(--sh)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: color
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}30`
        }}>
          <Icon size={24} color={color} />
        </div>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: trend > 0 ? 'var(--green)' : 'var(--red)',
            fontSize: '13px',
            fontWeight: '800',
            background: trend > 0 ? 'var(--green-lt)' : 'var(--red-lt)',
            padding: '4px 10px',
            borderRadius: '12px',
            border: `1px solid ${trend > 0 ? 'var(--green-md)' : 'var(--red-md)'}`
          }}>
            <TrendingUp size={14} />
            {trend}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text)', marginBottom: '4px', letterSpacing: '-1px' }}>{value}</div>
      <div style={{ fontSize: '15px', color: 'var(--text2)', fontWeight: '700', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '13px', color: 'var(--text3)' }}>{subtitle}</div>
      {onClick && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          color: color,
          opacity: 0.8
        }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px'
      }}>
        <Loader2 size={48} className="spin" style={{ color: '#2563eb' }} />
        <div style={{ color: '#64748b', fontSize: '16px' }}>
          {lt.trainingModels}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      {!expandedCard ? (
        <>
          <div className="category-header">
            <div className="heading-badge">🧠 Predict, Prevent, Optimize</div>
            <h1 className="category-title">{lt.predictiveAnalytics}</h1>
            <p className="category-desc">{lt.forecastDescription}</p>
          </div>

          {/* Model Status Banner */}
          {modelStatus && (
            <div style={{
              background: 'var(--green-lt)',
              border: '1px solid var(--green-md)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Zap size={20} color="var(--green)" />
                <div>
                  <span style={{ fontWeight: '600', color: 'var(--text)' }}>{lt.mlModelsActive}: </span>
                  <span style={{ color: 'var(--green)' }}>
                    {lt.demandModel}: {modelStatus.demand_model === 'trained' ? `✓ ${lt.trained}` : `⚠ ${lt.fallback}`},
                    {' '}{lt.salesModel}: {modelStatus.sales_model === 'trained' ? `✓ ${lt.trained}` : `⚠ ${lt.fallback}`}
                  </span>
                </div>
              </div>
              {expiryMatchResults?.last_updated && (
                <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 'bold', background: 'var(--surface)', border: '1px solid var(--green-lt)', padding: '4px 8px', borderRadius: '6px' }}>
                  {lt.prescriptiveLastRun}: {new Date(expiryMatchResults.last_updated).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

          {/* AI Key Insight Box */}
          {salesForecast && expiryRisk && (
            <div className="descriptive-summary-card AI-powered" style={{ marginBottom: '32px' }}>
              <div className="summary-icon-box"><Zap style={{ color: '#8b5cf6' }} size={24} /></div>
              <div className="summary-text-content">
                <div className="ai-badge-sm" style={{ background: '#8b5cf6' }}>{lt.geminiInsight}</div>
                <h3>{lt.strategicOutlook}</h3>
                <p className="ai-summary-text">{aiSummary || lt.trainingModels}</p>
                <div className="summary-meta-row">
                  <span className="summary-meta-item" style={{ color: '#8b5cf6', borderColor: '#c4b5fd' }}>🔮 {lt.multiModelForecast}</span>
                  <span className="summary-meta-item" style={{ color: '#8b5cf6', borderColor: '#c4b5fd' }}>📍 {demandPred ? demandPred.length : 0} {lt.predictionsActive}</span>
                  <span className="summary-meta-item" style={{ color: '#8b5cf6', borderColor: '#c4b5fd' }}>⚡ {lt.forwardEdge}</span>
                </div>
              </div>
            </div>
          )}

          {/* Predictive KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <KPICard
              title={lt.salesForecast30d}
              value={salesForecast?.summary?.total_predicted_revenue
                ? `${(salesForecast.summary.total_predicted_revenue / 1000000).toFixed(2)}M IQD`
                : lt.loading}
              subtitle={`${lt.avgDaily}: ${salesForecast?.summary?.avg_daily_revenue
                ? `${(salesForecast.summary.avg_daily_revenue / 1000).toFixed(0)}K IQD`
                : '...'}`}
              icon={TrendingUp}
              color="#8b5cf6"
              trend={5.4}
              onClick={() => toggleCard('sales')}
              isExpanded={expandedCard === 'sales'}
            />

            <KPICard
              title={lt.productsExpiryRisk}
              value={expiryRisk?.summary?.total_products_at_risk ?? '...'}
              subtitle={`${expiryRisk?.summary?.critical_count ?? 0} ${lt.critical} | ${expiryRisk?.summary?.high_count ?? 0} ${lt.highRisk}`}
              icon={AlertTriangle}
              color="#ef4444"
              onClick={() => toggleCard('expiry')}
              isExpanded={expandedCard === 'expiry'}
            />

            <KPICard
              title={`${lt.predictedDemand} (${selectedMonth})`}
              value={demandPred?.length > 0
                ? `${(demandPred.reduce((acc, d) => acc + d.predicted_demand, 0) / 1000).toFixed(1)}K`
                : '...'}
              subtitle={`${lt.marketUnits} ${selectedMonth}`}
              icon={Package}
              color="#10b981"
              onClick={() => toggleCard('demand')}
              isExpanded={expandedCard === 'demand'}
            />

            <KPICard
              title={lt.avgReturnProb}
              value={returnProb?.summary?.avg_return_rate
                ? `${returnProb.summary.avg_return_rate.toFixed(1)}%`
                : '...'}
              subtitle={`${returnProb?.summary?.high_risk_count ?? 0} High | ${returnProb?.summary?.medium_risk_count ?? 0} Medium Risks`}
              icon={RotateCcw}
              color="#f59e0b"
              onClick={() => toggleCard('returns')}
              isExpanded={expandedCard === 'returns'}
            />

            <KPICard
              title={lt.prescriptiveActions}
              value={expiryMatchResults?.summary?.at_risk_count ?? '...'}
              subtitle={`${lt.matchEngine}: ${expiryMatchResults?.summary?.total_value_at_risk ? (expiryMatchResults.summary.total_value_at_risk / 1000000).toFixed(1) + 'M IQD ' + lt.atRisk : lt.loading}`}
              icon={Zap}
              color="#3b82f6"
              onClick={() => toggleCard('prescriptive')}
              isExpanded={expandedCard === 'prescriptive'}
            />
          </div>
        </>
      ) : (
        <div style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => setExpandedCard(null)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'var(--surface2)', 
              border: '1px solid var(--border)', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              color: 'var(--text2)',
              fontWeight: '600',
              marginBottom: '24px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary-lt)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text2)'; }}
          >
            ← Back to Overview
          </button>
          
          <div className="category-header">
            <div className="heading-badge">
              {expandedCard === 'sales' ? '📈 Forecast Management' : 
               expandedCard === 'expiry' ? '⚠ Risk Mitigation' : 
               expandedCard === 'demand' ? '📦 Procurement Intelligence' : 
               expandedCard === 'returns' ? '🔄 Quality Control' : '⚡ Action Center'}
            </div>
            <h1 className="category-title">
              {expandedCard === 'sales' ? lt.salesForecast30d : 
               expandedCard === 'expiry' ? lt.productsExpiryRisk : 
               expandedCard === 'demand' ? lt.predictedDemand : 
               expandedCard === 'returns' ? lt.avgReturnProb : lt.prescriptiveActions}</h1>
            <p className="category-desc">Detailed AI analysis and drill-down metrics for this specific module.</p>
          </div>
        </div>
      )}

      {/* Expanded Cards Detail View */}
      {expandedCard === 'sales' && salesForecast && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--sh)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
              <Calendar size={18} style={{ display: 'inline', marginRight: '8px', color: '#8b5cf6' }} />
              Sales Forecast Details
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              >
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
          </div>

          <div style={{ position: 'relative', height: '300px', marginBottom: '20px', width: '100%' }}>
            {isFetchingForecast && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(255,255,255,0.7)', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Loader2 size={32} className="spin" style={{ color: '#8b5cf6' }} />
              </div>
            )}
            {(() => {
              const REGION_COLORS = {
                "Baghdad": "#8b5cf6", // Vibrant Violet
                "Basra": "#0ea5e9",   // Bright Sky Blue
                "Erbil": "#10b981",   // Emerald Green
                "Mosul": "#ec4899",   // Pink
                "Anbar": "#f59e0b"    // Amber
              };

              const DEFAULT_COLOR = "#94a3b8"; // Neutral Grey for unknown regions

              let chartData = salesForecast?.forecast?.slice(0, forecastDays) || [];
              let forecastRegions = [];

              if (salesForecast?.regional_forecasts) {
                forecastRegions = Object.keys(salesForecast.regional_forecasts);
                // Merge data for unified X-Axis
                const merged = [];
                const dates = chartData.map(d => d.date);
                dates.forEach((date, i) => {
                  const entry = { date };
                  forecastRegions.forEach(reg => {
                    entry[reg] = salesForecast.regional_forecasts[reg][i]?.predicted_revenue || 0;
                  });
                  merged.push(entry);
                });
                chartData = merged;
              }

              return (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedRegion !== 'All Regions' ? (REGION_COLORS[selectedRegion] || DEFAULT_COLOR) : "#8b5cf6"} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={selectedRegion !== 'All Regions' ? (REGION_COLORS[selectedRegion] || DEFAULT_COLOR) : "#8b5cf6"} stopOpacity={0} />
                      </linearGradient>
                      {forecastRegions.map((r) => (
                        <linearGradient key={`grad-${r}`} id={`color-${r}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={REGION_COLORS[r] || DEFAULT_COLOR} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={REGION_COLORS[r] || DEFAULT_COLOR} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickMargin={10}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: 'var(--text2)' }}
                      tickFormatter={(str) => {
                        if (!str) return "";
                        const date = new Date(str);
                        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                      }}
                      padding={{ left: 10, right: 10 }}
                      minTickGap={30}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: 'var(--text2)' }}
                      tickMargin={10}
                      width={50}
                    />
                    <Tooltip
                      labelFormatter={(label) => {
                        if (!label) return "";
                        const date = new Date(label);
                        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                      }}
                      formatter={(v, name) => [`${Number(v).toLocaleString()} IQD`, name]}
                    />
                    <Legend verticalAlign="top" align="right" height={36} />
                    {forecastRegions.length > 0 ? (
                      forecastRegions.map((reg) => (
                        <Area
                          key={reg}
                          type="linear"
                          dataKey={reg}
                          name={reg}
                          stroke={REGION_COLORS[reg] || DEFAULT_COLOR}
                          strokeWidth={2}
                          fillOpacity={0}
                          fill="none"
                          isAnimationActive={false}
                        />
                      ))
                    ) : (
                      <Area
                        type="linear"
                        dataKey="predicted_revenue"
                        name={selectedRegion !== 'All Regions' ? selectedRegion : "Total Forecast"}
                        stroke={selectedRegion !== 'All Regions' ? (REGION_COLORS[selectedRegion] || DEFAULT_COLOR) : "#8b5cf6"}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              );
            })()}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            padding: '16px',
            background: 'var(--surface2)',
            borderRadius: '12px',
            opacity: isFetchingForecast ? 0.5 : 1
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Total Forecast</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
                {salesForecast?.summary?.total_predicted_revenue?.toLocaleString()} IQD
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Average Daily</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
                {Math.round(salesForecast?.summary?.avg_daily_revenue || 0).toLocaleString()} IQD
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Trend Direction</div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: salesForecast?.summary?.trend === 'upward' ? '#10b981' : '#64748b',
                textTransform: 'capitalize'
              }}>
                {salesForecast?.summary?.trend || 'stable'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Avg Confidence</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
                {(salesForecast?.forecast?.reduce((acc, f) => acc + f.confidence, 0) / (salesForecast?.forecast?.length || 1) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '16px 20px',
            background: 'var(--surface2)',
            borderRadius: '12px',
            borderLeft: '4px solid #8b5cf6',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Zap size={20} color="#8b5cf6" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '800', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prediction Insight</h4>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text2)', lineHeight: '1.5' }}>
                Based on the current trajectory, the sales forecast shows a <strong style={{ color: 'var(--text)' }}>{salesForecast.summary?.trend}</strong> trend. Averaging <strong style={{ color: 'var(--text)' }}>{Math.round(salesForecast.summary?.avg_daily_revenue || 0).toLocaleString()} IQD</strong> daily, the confidence level of this {forecastDays}-day projection is robust at {(salesForecast.forecast?.reduce((acc, f) => acc + f.confidence, 0) / (salesForecast.forecast?.length || 1) * 100).toFixed(0)}%.
              </p>
            </div>
          </div>
        </div>
      )}

      {expandedCard === 'expiry' && expiryRisk && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--sh)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
              <AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px', color: '#ef4444' }} />
              Expiry Risk Analysis
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div
              onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'Critical' ? null : 'Critical')}
              style={{
                background: 'var(--red-lt)',
                padding: '16px',
                borderRadius: '12px',
                border: selectedRiskFilter === 'Critical' ? '3px solid var(--red)' : '1px solid var(--red-md)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: selectedRiskFilter && selectedRiskFilter !== 'Critical' ? 0.5 : 1,
                transform: selectedRiskFilter === 'Critical' ? 'scale(1.02)' : 'scale(1)'
              }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--red)' }}>{expiryRisk.summary?.critical_count || 0}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginTop: '4px' }}>Critical (≤30d)</div>
            </div>
            <div
              onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'High' ? null : 'High')}
              style={{
                background: 'var(--amber-lt)',
                padding: '16px',
                borderRadius: '12px',
                border: selectedRiskFilter === 'High' ? '3px solid var(--amber)' : '1px solid var(--amber-md)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: selectedRiskFilter && selectedRiskFilter !== 'High' ? 0.5 : 1,
                transform: selectedRiskFilter === 'High' ? 'scale(1.02)' : 'scale(1)'
              }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--amber)' }}>{expiryRisk.summary?.high_count || 0}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginTop: '4px' }}>High (31-60d)</div>
            </div>
            <div
              onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'Medium' ? null : 'Medium')}
              style={{
                background: 'var(--primary-lt)',
                padding: '16px',
                borderRadius: '12px',
                border: selectedRiskFilter === 'Medium' ? '3px solid var(--primary)' : '1px solid var(--primary-md)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: selectedRiskFilter && selectedRiskFilter !== 'Medium' ? 0.5 : 1,
                transform: selectedRiskFilter === 'Medium' ? 'scale(1.02)' : 'scale(1)'
              }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{expiryRisk.summary?.medium_count || 0}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginTop: '4px' }}>Medium (61-120d)</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>Risk Distribution</h4>
              <div style={{ height: '320px', width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={[
                        { name: 'Critical (≤30d)', value: expiryRisk.summary?.critical_count || 0, color: '#ef4444' },
                        { name: 'High (31-60d)', value: expiryRisk.summary?.high_count || 0, color: '#f59e0b' },
                        { name: 'Medium (61-120d)', value: expiryRisk.summary?.medium_count || 0, color: '#8b5cf6' }
                      ]}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={75}
                      dataKey="value"
                      labelLine={false}
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#8b5cf6'][index]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      formatter={(value) => <span style={{ color: 'var(--text2)', fontSize: '12px', fontWeight: '600' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>
                {selectedRiskFilter ? `${selectedRiskFilter} Risk Products` : 'All Preventive Risks'}
              </h4>
              <div style={{ height: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {(expiryRisk.expiry_risks || [])
                  .filter(p => {
                    const dte = p.days_to_expiry || 0;
                    const risk = p.risk_level;

                    // Exclude everything that is already expired or has no risk
                    if (dte <= 0 || risk === 'Expired (Already Written Off)' || risk === 'Low') return false;

                    // If a filter is selected, show only that exact category
                    if (selectedRiskFilter) return risk === selectedRiskFilter;

                    // Default view: all preventive risks
                    return true;
                  })
                  .slice(0, 15).map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: idx % 2 === 0 ? 'var(--surface2)' : 'transparent',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      border: '1px solid var(--border)',
                      transition: 'transform 0.2s',
                      cursor: 'default'
                    }} className="risk-item-random">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '25px',
                          background: item.risk_level === 'Critical' ? 'var(--red-lt)' : item.risk_level === 'High' ? 'var(--amber-lt)' : 'var(--primary-lt)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '900',
                          color: item.risk_level === 'Critical' ? 'var(--red)' : item.risk_level === 'High' ? 'var(--amber)' : 'var(--primary)',
                          border: `2px solid ${item.risk_level === 'Critical' ? 'var(--red-md)' : item.risk_level === 'High' ? 'var(--amber-md)' : 'var(--primary-md)'}`
                        }}>
                          {item.days_to_expiry}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text)' }}>{item.product}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.warehouse} • {item.batch}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444' }}>
                          -{item.potential_value_loss ? (item.potential_value_loss / 1000).toFixed(0) + 'K IQD' : 'Value Loss'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                          {item.quantity?.toLocaleString()} units • {item.risk_level}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {expiryRisk.recommendations && (
            <div style={{
              background: '#fef3c7',
              borderRadius: '12px',
              padding: '16px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                <Zap size={16} style={{ display: 'inline', marginRight: '8px' }} />
                AI Recommendations
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350f' }}>
                {expiryRisk.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {expandedCard === 'demand' && demandPred && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--sh)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
              <Package size={18} style={{ display: 'inline', marginRight: '8px', color: '#10b981' }} />
              Demand Predictions for {selectedMonth}
            </h3>
          </div>

          <div style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandPred} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={10}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: 'var(--text2)' }}
                  tickFormatter={(v) => `${v}`}
                />
                <YAxis
                  dataKey="product"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: 'var(--text2)' }}
                  width={100}
                />
                <Tooltip
                  formatter={(v, n, props) => [`${Number(v).toLocaleString()} units`, 'Predicted Demand']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--sh)', background: 'var(--surface2)', color: 'var(--text)' }}
                />
                <Bar dataKey="predicted_demand" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {demandPred.map((pred, idx) => (
              <div key={idx} style={{
                background: 'var(--green-lt)',
                border: '1px solid var(--green-md)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text)' }}>{pred.product}</span>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--green)',
                    color: 'white'
                  }}>
                    {(pred.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--green)' }}>
                  {pred.predicted_demand?.toLocaleString()} units
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {pred.region} • Next Month
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expandedCard === 'returns' && returnProb && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--sh)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
              <RotateCcw size={18} style={{ display: 'inline', marginRight: '8px', color: '#f59e0b' }} />
              Return Probability Analysis
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ background: 'var(--red-lt)', padding: '16px', borderRadius: '12px', border: '1px solid var(--red-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--red)' }}>{returnProb.summary?.high_risk_count || 0}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginTop: '4px' }}>High Quality Risk (≥10%)</div>
            </div>
            <div style={{ background: 'var(--amber-lt)', padding: '16px', borderRadius: '12px', border: '1px solid var(--amber-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--amber)' }}>{returnProb.summary?.medium_risk_count || 0}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginTop: '4px' }}>Emerging Risks (≥5%)</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b' }}>Tracked Potential Risks (High & Medium)</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '12px'
            }}>
              {(returnProb.return_predictions || [])
                .filter(p => p.risk_level === 'High' || p.risk_level === 'Medium')
                .sort((a, b) => {
                  const order = { 'High': 1, 'Medium': 2, 'Low': 3 };
                  if (order[a.risk_level] !== order[b.risk_level]) return order[a.risk_level] - order[b.risk_level];
                  return (b.return_probability || 0) - (a.return_probability || 0);
                })
                .slice(0, 8)
                .map((pred, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: pred.risk_level === 'High' ? 'var(--red-lt)' : 'var(--amber-lt)',
                    border: `1px solid ${pred.risk_level === 'High' ? 'var(--red-md)' : 'var(--amber-md)'}`,
                    borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text)' }}>{pred.product}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
                        {pred.region} • {pred.warehouse}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'var(--red)'
                      }}>
                        {pred.return_probability}%
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                        {pred.returns}/{pred.total_transactions} returns
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {returnProb.insights && (
            <div style={{
              background: 'var(--blue-lt)',
              borderRadius: '12px',
              padding: '16px',
              borderLeft: '4px solid var(--blue)'
            }}>
              <div style={{ fontWeight: '600', color: 'var(--blue)', marginBottom: '8px' }}>
                <Activity size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Insights
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text)' }}>
                {returnProb.insights.map((insight, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Prescriptive Engine Results */}
      {expandedCard === 'prescriptive' && expiryMatchResults && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--sh)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
              <Zap size={18} style={{ display: 'inline', marginRight: '8px', color: '#3b82f6' }} />
              Prescriptive Engine: Expiry-to-Demand Match
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
              Total Financial Risk: <strong style={{ color: 'var(--red)' }}>{expiryMatchResults.summary?.total_value_at_risk?.toLocaleString()} IQD</strong>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '20px' }}>
            The engine has matched near-expiry batches to the regions with the highest sales velocity for those specific products.
            Move inventory to the **Recommended Region** to maximize clearance before expiration.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderBottom: 'none', background: 'var(--surface2)', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Rows per page:</span>
                <select 
                  value={prescriptiveRowsPerPage} 
                  onChange={(e) => { 
                    setPrescriptiveRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value)); 
                    setPrescriptivePage(1); 
                  }}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', outline: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value="All">All</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '0', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Product & Batch</th>
                  <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Days Left</th>
                  <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Best Region</th>
                  <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Clearance Time</th>
                  <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Value at Risk</th>
                  <th style={{ textAlign: 'center', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>System Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {(expiryMatchResults.results || [])
                  .slice(prescriptiveRowsPerPage === 'All' ? 0 : (prescriptivePage - 1) * prescriptiveRowsPerPage, prescriptiveRowsPerPage === 'All' ? undefined : prescriptivePage * prescriptiveRowsPerPage)
                  .map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--surface2)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text)' }}>{row.product}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'monospace' }}>{row.batch}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{
                        color: row.days_to_expiry <= 30 ? 'var(--red)' : row.days_to_expiry <= 60 ? 'var(--amber)' : 'var(--text2)',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {row.days_to_expiry <= 30 && <AlertCircle size={14} />}
                        {row.days_to_expiry}d
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--blue)' }}>
                        <MapPin size={14} />
                        {row.best_region}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: 'var(--text)' }}>
                        {row.days_to_clear} days <span style={{ fontSize: '10px', color: 'var(--text3)' }}>(estimated)</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text)' }}>
                      {row.value_at_risk.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text3)' }}>IQD</span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: row.recommended_action === 'Push to region' ? '#dcfce7' :
                          row.recommended_action === 'Promote aggressively' ? '#fee2e2' : '#fef3c7',
                        color: row.recommended_action === 'Push to region' ? '#166534' :
                          row.recommended_action === 'Promote aggressively' ? '#991b1b' : '#92400e',
                        border: `1px solid ${row.recommended_action === 'Push to region' ? '#bbf7d0' :
                          row.recommended_action === 'Promote aggressively' ? '#fecaca' : '#fde68a'
                          }`
                      }}>
                        {row.recommended_action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderTop: 'none', background: 'var(--surface2)', borderRadius: '0 0 12px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text3)' }}>
                Page {prescriptivePage} of {prescriptiveRowsPerPage === 'All' ? 1 : Math.max(1, Math.ceil((expiryMatchResults.results || []).length / prescriptiveRowsPerPage))}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  disabled={prescriptivePage === 1 || prescriptiveRowsPerPage === 'All'}
                  onClick={() => setPrescriptivePage(p => Math.max(1, p - 1))}
                  style={{ 
                    padding: '6px 16px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border)', 
                    background: prescriptivePage === 1 || prescriptiveRowsPerPage === 'All' ? 'var(--surface)' : 'var(--surface2)', 
                    color: prescriptivePage === 1 || prescriptiveRowsPerPage === 'All' ? 'var(--text3)' : 'var(--text)', 
                    cursor: prescriptivePage === 1 || prescriptiveRowsPerPage === 'All' ? 'not-allowed' : 'pointer', 
                    fontSize: '13px', 
                    transition: 'all 0.2s' 
                  }}
                >Previous</button>
                <button 
                  disabled={prescriptiveRowsPerPage === 'All' || prescriptivePage >= Math.ceil((expiryMatchResults.results || []).length / prescriptiveRowsPerPage)}
                  onClick={() => setPrescriptivePage(p => p + 1)}
                  style={{ 
                    padding: '6px 16px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border)', 
                    background: prescriptiveRowsPerPage === 'All' || prescriptivePage >= Math.ceil((expiryMatchResults.results || []).length / prescriptiveRowsPerPage) ? 'var(--surface)' : 'var(--surface2)', 
                    color: prescriptiveRowsPerPage === 'All' || prescriptivePage >= Math.ceil((expiryMatchResults.results || []).length / prescriptiveRowsPerPage) ? 'var(--text3)' : 'var(--text)', 
                    cursor: prescriptiveRowsPerPage === 'All' || prescriptivePage >= Math.ceil((expiryMatchResults.results || []).length / prescriptiveRowsPerPage) ? 'not-allowed' : 'pointer', 
                    fontSize: '13px', 
                    transition: 'all 0.2s' 
                  }}
                >Next</button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
      {/* Quick Actions */}
      <div style={{
        background: 'var(--blue-lt)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--blue-md)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: 'var(--blue)', display: 'flex', alignItems: 'center' }}>
          <Zap size={20} style={{ marginRight: '8px' }} />
          <span style={{ color: 'var(--text)' }}>AI-Powered Actions</span>
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{
            padding: '12px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Package size={16} />
            Optimize Inventory
          </button>
          <button style={{
            padding: '12px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            Address Expiry Risks
          </button>
          <button style={{
            padding: '12px 20px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingUp size={16} />
            Export Forecast Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis;