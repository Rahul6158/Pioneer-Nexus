import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import Navbar from './components/Navbar';
import KPICard from './components/KPICard';
import PredictiveAnalysis from './components/PredictiveAnalysis';
import ModelDetails from './components/ModelDetails';
import AskNexus from './components/AskNexus';
import { ChatBubble, formatAxisValue } from './components/ChatBubble';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend, ComposedChart,
  Treemap, ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  DollarSign, Package, TrendingUp, Zap, FileText, BarChart3, HelpCircle,
  Activity, MapPin, Warehouse, Layers, Target, Info, X, ExternalLink, Send,
  PieChart as PieChartIcon, Search, ArrowRight, MessageSquare, ArrowLeft, ChevronRight, BarChart2,
  GripHorizontal, Maximize2, RotateCcw, AlertTriangle, AlertCircle, Calendar
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const DASHBOARD_COLORS = [
  '#7C3AED', '#3b82f6', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#0ea5e9', '#CA8A04',
  '#4F46E5', '#0D9488', '#2EC4B6', '#2DD4BF', '#60A5FA', '#F472B6',
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

const CustomTreemapContent = (props) => {
  const { x, y, width, height, index, name, value, depth } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: DASHBOARD_COLORS[index % DASHBOARD_COLORS.length],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1),
          strokeOpacity: 1 / (depth + 1),
        }}
      />
      {width > 30 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={10} fontWeight="700">
          {name}
        </text>
      )}
    </g>
  );
};

// Modal Component
const ChartModal = ({ chart, onClose, onShowInSidebar, language = 'en' }) => {
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chart && (language === 'ar' || !chart.overview)) {
      setLoading(true);
      axios.post(`${API_BASE}/modal-insight`, {
        title: chart.title,
        what: chart.overview || chart.title,
        data: chart.data || [],
        language: language
      }).then(res => {
        setAiInsight(res.data.insight);
        setLoading(false);
      }).catch(err => {
        console.error("Modal Insight Error:", err);
        setLoading(false);
      });
    } else {
      setAiInsight("");
    }
  }, [chart, language]);

  if (!chart) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Info size={20} className="text-primary" />
            <span>Visualization Details: {chart.title}</span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body premium-scroll">
          <div className="modal-insight-section">
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px', color: 'var(--text2)' }}>
                <Zap size={20} className="spin text-primary" />
                <span>AI is generating localized business analysis...</span>
              </div>
            ) : aiInsight ? (
              <div className="ai-insight-content premium-scroll">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiInsight}
                </ReactMarkdown>
              </div>
            ) : (
              <>
                {/* Key Data Insights - MOVED TO TOP */}
                {chart.dynamicInsight && chart.data && chart.data.length > 0 && (
                  <div className="insight-card premium">
                    <div className="insight-icon">
                      <Zap size={22} fill="white" />
                    </div>
                    <div className="insight-content">
                      <span className="insight-badge">Live Intelligence</span>
                      <div className="insight-label">Key Analytical Insight</div>
                      <div
                        className="insight-text"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chart.dynamicInsight(chart.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }}
                      />
                    </div>
                  </div>
                )}

                {/* Graph Overview */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Graph Overview</div>
                  <div style={{ borderLeft: '3px solid var(--blue)', paddingLeft: '16px', color: 'var(--text)', fontSize: '15px', lineHeight: '1.6' }}>
                    {chart.overview}
                  </div>
                </div>

                {/* Data Analysis Table */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Data Analysis</div>
                  <div style={{ borderLeft: '3px solid var(--purple)', paddingLeft: '16px', color: 'var(--text)', fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '12px' }}>A breakdown of the specific data values currently represented in the chart:</div>
                    {chart.data && chart.data.length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="premium-table" style={{ width: '100%', minWidth: '300px' }}>
                          <thead>
                            <tr>
                              {Object.keys(chart.data[0]).filter(k => k !== 'fill' && k !== 'trend').map((k, i) => (
                                <th key={i}>{k.replace(/_/g, ' ')}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {chart.data.map((row, i) => (
                              <tr key={i}>
                                {Object.entries(row).filter(([k]) => k !== 'fill' && k !== 'trend').map(([k, v], j) => (
                                  <td key={j}>
                                    {typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text3)' }}>No localized data provided yet.</div>
                    )}
                  </div>
                </div>

                {/* What This Graph Conveys */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>What This Graph Conveys</div>
                  <div style={{ borderLeft: '3px solid var(--green)', paddingLeft: '16px', color: 'var(--text)', fontSize: '15px', lineHeight: '1.6' }}>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {chart.conveys && chart.conveys.map((point, index) => (
                        <li key={index} style={{ marginBottom: '12px' }}>
                          <strong>{point.title}:</strong> {point.desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn secondary" onClick={onClose} style={{ width: '20%', justifyContent: 'center' }}>Close Details</button>
        </div>
      </div>
    </div>
  );
};

const ChartInteractionMenu = ({ chartInfo, onClose, onShowModal, onAskCopilot }) => {
  if (!chartInfo) return null;
  const { chart, x, y } = chartInfo;

  const menuX = Math.min(x, window.innerWidth - 220);
  const menuY = Math.min(y, window.innerHeight - 150);

  return (
    <div className="interaction-overlay" onClick={onClose} onContextMenu={e => { e.preventDefault(); onClose(); }}>
      <div className="interaction-menu" style={{ left: menuX, top: menuY }} onClick={e => e.stopPropagation()}>
        <div className="interaction-title">Options: {chart.title}</div>
        <div className="interaction-options">
          <button className="int-opt" onClick={() => onShowModal(chart)}>
            <Info size={14} className="text-blue" />
            <span>Show Details</span>
          </button>
          <button className="int-opt copilot" onClick={() => onAskCopilot(chart)}>
            <Zap size={14} className="text-purple" fill="currentColor" />
            <span>Ask Copilot</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ChatBubble is now imported from components/ChatBubble.jsx

const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    executiveDashboard: "Executive Dashboard",
    descriptive: "Descriptive",
    predictive: "Predictive",
    prescriptive: "Prescriptive",
    askNexus: "Ask Nexus",
    settings: "Settings",
    totalRevenue: "Total Revenue",
    totalUnits: "Total Units Sold",
    regionalSales: "Regional Sales Trends",
    topProducts: "Top Selling Products",
    theme: "Theme Mode",
    language: "Language",
    light: "Light",
    dark: "Dark",
    english: "English",
    arabic: "Arabic (العربية)",
    salesForecast: "Sales Forecast",
    expiryRisk: "Expiry Risk",
    predictedDemand: "Predicted Demand",
    returnProbability: "Return Probability",
    prescriptiveEngine: "Prescriptive Engine",
    modelDetails: "Model Details",
    databaseRecords: "Data Hub",
    strategicOutlook: "Strategic Future Outlook",
    nexusGreeting: "Hi, I'm Nexus! ✨",
    nexusHelp: "How can I help you today?",
    nexusTagline: "Central Brain of Pharmaceutical Analytics",
    regionalPerformance: "Regional Performance",
    warehouseOperations: "Warehouse Operations",
    marketPosition: "Market Position",
    avgSellingPrice: "Avg Selling Price"
  },
  ar: {
    dashboard: "لوحة القيادة",
    executiveDashboard: "لوحة القيادة التنفيذية",
    descriptive: "التحليل الوصفي",
    predictive: "التحليل التنبئي",
    prescriptive: "التحليل التوجيهي",
    askNexus: "اسأل نكسس",
    settings: "الإعدادات",
    totalRevenue: "إجمالي الإيرادات",
    totalUnits: "إجمالي الوحدات المباعة",
    regionalSales: "اتجاهات المبيعات الإقليمية",
    topProducts: "المنتجات الأكثر مبيعاً",
    theme: "وضع المظهر",
    language: "اللغة",
    light: "فاتح",
    dark: "داكن",
    english: "English",
    arabic: "العربية",
    salesForecast: "توقعات المبيعات",
    expiryRisk: "مخاطر انتهاء الصلاحية",
    predictedDemand: "الطلب المتوقع",
    returnProbability: "احتمالية الإرجاع",
    prescriptiveEngine: "المحرك التوجيهي",
    modelDetails: "تفاصيل النموذج",
    databaseRecords: "سجلات قاعدة البيانات",
    strategicOutlook: "النظرة المستقبلية الاستراتيجية",
    nexusGreeting: "مرحباً، أنا نكسس! ✨",
    nexusHelp: "كيف يمكنني مساعدتك اليوم؟",
    nexusTagline: "الدماغ المركزي للتحليلات الدوائية",
    regionalPerformance: "الأداء الإقليمي",
    warehouseOperations: "عمليات المستودعات",
    marketPosition: "موقع السوق",
    avgSellingPrice: "متوسط سعر البيع"
  }
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [bannerText, setBannerText] = useState(localStorage.getItem('bannerText') || 'Pioneer Pharma Insights');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.body.className = language === 'ar' ? 'lang-ar' : '';
  }, [language]);

  useEffect(() => {
    localStorage.setItem('bannerText', bannerText);
  }, [bannerText]);

  const t = TRANSLATIONS[language];
  const [copilotCollapsed, setCopilotCollapsed] = useState(true);
  const [activeView, setActiveView] = useState("Descriptive");
  const [selectedChart, setSelectedChart] = useState(null);
  const [pendingInteraction, setPendingInteraction] = useState(null);
  const [drillStates, setDrillStates] = useState({}); // { [chartId]: { level: 1, filterLabel: 'Baghdad', ... } }

  // Data State
  const [kpis, setKpis] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [regionalTrend, setRegionalTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [regionalRevenue, setRegionalRevenue] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [warehouseVolume, setWarehouseVolume] = useState([]);
  const [productContribution, setProductContribution] = useState([]);
  const [revenueByType, setRevenueByType] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [expiryData, setExpiryData] = useState([]);
  const [demandDistribution, setDemandDistribution] = useState([]);
  const [dbData, setDbData] = useState([]);
  const [activeDbTable, setActiveDbTable] = useState("pharmasales");
  const [dbCurrentPage, setDbCurrentPage] = useState(1);
  const [dbRowsPerPage, setDbRowsPerPage] = useState(5);
  const [dbTotalRows, setDbTotalRows] = useState(0);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("AI is analyzing the operational landscape...");

  // Root Predictive Data (Shared with Executive Dashboard)
  const [salesForecast, setSalesForecast] = useState(null);
  const [expiryRisk, setExpiryRisk] = useState(null);
  const [returnProb, setReturnProb] = useState(null);
  const [demandPred, setDemandPred] = useState(null);
  const [expiryMatchResults, setExpiryMatchResults] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [predictiveLoading, setPredictiveLoading] = useState(false);

  // Exec Dashboard Interactive Sales Forecast
  const [execSelectedRegion, setExecSelectedRegion] = useState('All Regions');
  const [execForecastDays, setExecForecastDays] = useState(90);
  const [execSalesForecast, setExecSalesForecast] = useState(null);
  const [isFetchingExecForecast, setIsFetchingExecForecast] = useState(false);


  // Copilot State (Floating Chatbot - stays as is)
  const [chatInput, setChatInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState([
    { id: 1, role: "ai", text: "Welcome to Konfig Nexus AI! I am your primary analytical intelligence. You can ask me to deep-dive into any chart, summarize regional performance, or identify logistics bottlenecks." }
  ]);

  // Ask Nexus State (Dedicated Page - Multi-thread)
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [isNexusLoading, setIsNexusLoading] = useState(false);

  // Load saved chat sessions from the database on mount
  useEffect(() => {
    const loadSavedSessions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/chat-sessions`);
        if (res.data && res.data.length > 0) {
          const savedThreads = res.data.map(session => ({
            id: String(session.session_id),
            title: session.title && session.title.length > 30
              ? session.title.substring(0, 30) + '...'
              : (session.title || 'Untitled'),
            messages: [], // Messages loaded on click
            fromDb: true
          }));
          setThreads(savedThreads);
        }
      } catch (err) {
        console.error("Failed to load chat sessions:", err);
      }
    };
    loadSavedSessions();
  }, []);

  // Load messages when a saved thread is clicked
  const loadThreadMessages = async (threadId) => {
    setActiveThreadId(threadId);
    const thread = threads.find(t => t.id === threadId);
    if (thread && thread.fromDb && thread.messages.length === 0) {
      setIsNexusLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/chat-history/${threadId}`);
        if (res.data && res.data.length > 0) {
          const messages = [];
          res.data.forEach((item, idx) => {
            messages.push({ id: idx * 2 + 1, role: "user", text: item.question, timestamp: item.interaction_time });
            // Reconstruct usage object from DB columns
            const usage = item.latency_ms ? {
              latency_ms: item.latency_ms,
              prompt_tokens: item.prompt_tokens,
              output_tokens: item.output_tokens,
              total_tokens: item.total_tokens,
              cost_usd: item.cost_usd,
              model: item.model_name,
              request_id: item.request_id,
              timestamp: item.interaction_time
            } : null;
            messages.push({ id: idx * 2 + 2, role: "ai", text: item.answer, usage: usage });
          });
          setThreads(prev => prev.map(t => t.id === threadId ? { ...t, messages } : t));
        }
      } catch (err) {
        console.error("Failed to load thread messages:", err);
      } finally {
        setIsNexusLoading(false);
      }
    }
  };

  const activeThread = threads.find(t => t.id === activeThreadId);
  const nexusMessages = activeThread ? activeThread.messages : [];

  const handleCreateNewThread = () => {
    const newId = Date.now().toString();
    setThreads(prev => [
      { id: newId, title: 'New Conversation', messages: [] },
      ...prev
    ]);
    setActiveThreadId(newId);
  };

  const renameThread = (id, newTitle) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  const deleteThread = async (id) => {
    // Delete from backend DB
    try {
      await axios.delete(`${API_BASE}/chat-history/${id}`);
    } catch (err) {
      console.error("Failed to delete from DB:", err);
    }
    setThreads(prev => {
      const remaining = prev.filter(t => t.id !== id);
      if (activeThreadId === id) {
        setActiveThreadId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const markMessageAsOld = (id, isCopilot = true) => {
    if (isCopilot) {
      setCopilotMessages(prev => prev.map(m => m.id === id ? { ...m, isNew: false } : m));
    } else {
      setThreads(prev => prev.map(t => ({
        ...t,
        messages: t.messages.map(m => m.id === id ? { ...m, isNew: false } : m)
      })));
    }
  };
  const [showSuggestion, setShowSuggestion] = useState(true);
  const chatEndRef = useRef(null);

  // Trend Chart Filter & Resize State
  const [selectedTrendMonth, setSelectedTrendMonth] = useState("Jan");
  const [selectedTrendRegion, setSelectedTrendRegion] = useState("All");
  const [selectedRevenueMonth, setSelectedRevenueMonth] = useState("Jan");
  const [trendCardSize, setTrendCardSize] = useState({ height: 420 });
  const [revenueTrendCardSize, setRevenueTrendCardSize] = useState({ height: 400 });
  const [revenueVelocityCardSize, setRevenueVelocityCardSize] = useState({ height: 400 });
  const [batchCardSize, setBatchCardSize] = useState({ height: 500 });
  const [warehouseIntensityCardSize, setWarehouseIntensityCardSize] = useState({ height: 600 });
  const [isTrendResizing, setIsTrendResizing] = useState(null); // 'copilot', 'regional', 'revenue', 'velocity', 'batch', 'warehouse'
  const [expandedChart, setExpandedChart] = useState(null);
  const trendResizeStart = useRef({ y: 0, h: 0 });

  const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const availableMonths = React.useMemo(() => {
    if (!regionalTrend || regionalTrend.length === 0) return ["All"];
    const months = new Set(regionalTrend.map(d => d.date.split(' ')[0]));
    const sorted = Array.from(months).sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
    return ["All", ...sorted];
  }, [regionalTrend]);

  const availableRevenueMonths = React.useMemo(() => {
    if (!revenueTrend || revenueTrend.length === 0) return ["All"];
    const months = new Set(revenueTrend.map(d => d.date.split(' ')[0]));
    const sorted = Array.from(months).sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
    return ["All", ...sorted];
  }, [revenueTrend]);

  const filteredTrendData = React.useMemo(() => {
    if (selectedTrendMonth === "All") return regionalTrend;
    return regionalTrend.filter(d => d.date.startsWith(selectedTrendMonth));
  }, [regionalTrend, selectedTrendMonth]);

  const filteredRevenueData = React.useMemo(() => {
    if (selectedRevenueMonth === "All") return revenueTrend;
    return revenueTrend.filter(d => d.date.startsWith(selectedRevenueMonth));
  }, [revenueTrend, selectedRevenueMonth]);

  // Constants for Home Position/Size
  const HOME_POS = { x: window.innerWidth - 590, y: 80 };
  const HOME_SIZE = { width: 480, height: 550 };

  // Floating & Resizing State
  const [copilotPos, setCopilotPos] = useState(HOME_POS);
  const [copilotSize, setCopilotSize] = useState(HOME_SIZE);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null); // 't', 'b', 'l', 'r', 'tl', 'tr', 'bl', 'br'
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, posX: 0, posY: 0 });

  // Reset to home when opening
  const handleToggleCopilot = () => {
    if (copilotCollapsed) {
      setCopilotPos(HOME_POS);
      setCopilotSize(HOME_SIZE);
    }
    setCopilotCollapsed(!copilotCollapsed);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setCopilotPos({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y
        });
      } else if (isResizing) {
        let { x: startX, y: startY, w: startW, h: startH, posX: startPosX, posY: startPosY } = resizeStart.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        let newW = Math.max(300, isResizing.includes('r') ? startW + deltaX : isResizing.includes('l') ? startW - deltaX : startW);
        let newH = Math.max(400, isResizing.includes('b') ? startH + deltaY : isResizing.includes('t') ? startH - deltaY : startH);
        let newX = isResizing.includes('l') && newW > 300 ? startPosX + deltaX : startPosX;
        let newY = isResizing.includes('t') && newH > 400 ? startPosY + deltaY : startPosY;
        setCopilotSize({ width: newW, height: newH });
        setCopilotPos({ x: newX, y: newY });
      } else if (isTrendResizing) {
        const deltaY = e.clientY - trendResizeStart.current.y;
        const newH = Math.max(300, trendResizeStart.current.h + (isTrendResizing.includes('b') ? deltaY : -deltaY));
        if (isTrendResizing.startsWith('regional')) {
          setTrendCardSize({ height: newH });
        } else if (isTrendResizing.startsWith('revenue')) {
          setRevenueTrendCardSize({ height: newH });
        } else if (isTrendResizing.startsWith('velocity')) {
          setRevenueVelocityCardSize({ height: newH });
        } else if (isTrendResizing.startsWith('batch')) {
          setBatchCardSize({ height: newH });
        } else if (isTrendResizing.startsWith('warehouse')) {
          setWarehouseIntensityCardSize({ height: newH });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
      setIsTrendResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const handleDragStart = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - copilotPos.x,
      y: e.clientY - copilotPos.y
    };
  };

  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(direction);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: copilotSize.width,
      h: copilotSize.height,
      posX: copilotPos.x,
      posY: copilotPos.y
    };
  };

  const handleTrendResizeStart = (e, dir, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTrendResizing(`${type}-${dir}`);
    let currentH;
    if (type === 'regional') currentH = trendCardSize.height;
    else if (type === 'revenue') currentH = revenueTrendCardSize.height;
    else if (type === 'velocity') currentH = revenueVelocityCardSize.height;
    else if (type === 'batch') currentH = batchCardSize.height;
    else if (type === 'warehouse') currentH = warehouseIntensityCardSize.height;
    trendResizeStart.current = { y: e.clientY, h: currentH };
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [copilotMessages, threads, activeThreadId]);


  const fetchAllData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/dashboard-summary`);

      setKpis(data.kpis);
      setRevenueTrend(data.revenueTrend);
      setRegionalTrend(data.regionalSalesTrend);
      setTopProducts(data.topProducts);
      setRegionalRevenue(data.revenueByRegion);
      setWarehouseData(data.warehousePerformance);
      setWarehouseVolume(data.warehouseVolume);
      setProductContribution(data.productContribution);
      setRevenueByType(data.revenueByType);
      setBatchData(data.batchPerformance.map(d => ({ name: d.batch.replace('B-', 'Batch '), value: d.revenue })));
      setExpiryData(data.expiryDistribution);
      setDemandDistribution(data.demandDistribution);

      // 2. Fetch Predictive Data for Executive View (Resilient Individual Fetches)
      setPredictiveLoading(true);

      const fetchMetric = async (endpoint, setter, transform = (d) => d) => {
        try {
          const res = await axios.get(`${API_BASE}/${endpoint}`);
          setter(transform(res.data));
        } catch (err) {
          console.error(`Error fetching ${endpoint}:`, err);
        }
      };

      await Promise.all([
        fetchMetric('predict/all', (data) => {
          setDemandPred(data.demand_predictions);
          setModelStatus(data.model_status);
        }),
        fetchMetric('predict/expiry-risk', setExpiryRisk),
        fetchMetric('predict/return-probability', setReturnProb),
        fetchMetric('predict/sales-forecast?days=30', setSalesForecast),
        fetchMetric('predict/expiry-demand-match', setExpiryMatchResults)
      ]);

      setPredictiveLoading(false);


    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchAllData();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDbCurrentPage(1);
  }, [activeDbTable, activeView]);

  useEffect(() => {
    const fetchTableData = async () => {
      if (activeView === 'Data Hub') {
        setIsDbLoading(true);
        try {
          const pageSize = dbRowsPerPage === 'All' ? -1 : dbRowsPerPage;
          const dbRes = await axios.get(`${API_BASE}/database/tables?table_name=${activeDbTable}&page=${dbCurrentPage}&page_size=${pageSize}`);
          if (dbRes.data && !Array.isArray(dbRes.data)) {
            setDbData(dbRes.data.data || []);
            setDbTotalRows(dbRes.data.total_rows || 0);
          } else {
            setDbData(dbRes.data || []);
            setDbTotalRows((dbRes.data || []).length);
          }
        } catch (err) {
          console.error("Table Fetch Error:", err);
        } finally {
          setIsDbLoading(false);
        }
      }
    };
    fetchTableData();
  }, [activeDbTable, activeView, dbCurrentPage, dbRowsPerPage]);

  const execForecastMountRef = useRef(true);
  useEffect(() => {
    if (execForecastMountRef.current) {
      execForecastMountRef.current = false;
      return;
    }
    const fetchExecForecast = async () => {
      try {
        setIsFetchingExecForecast(true);
        const regionParam = execSelectedRegion !== 'All Regions' ? `&region=${execSelectedRegion}` : '';
        const url = `${API_BASE}/predict/sales-forecast?days=${execForecastDays}${regionParam}`;
        const response = await axios.get(url);
        setExecSalesForecast(response.data);
      } catch (err) {
        console.error("Exec Forecast Fetch Error:", err);
      } finally {
        setIsFetchingExecForecast(false);
      }
    };
    fetchExecForecast();
  }, [execSelectedRegion, execForecastDays]);

  useEffect(() => {
    if (['Descriptive', 'Sales Panel', 'Regional Performance', 'Warehouse Operations'].includes(activeView) && kpis) {
      const getSummary = async () => {
        try {
          const res = await axios.post(`${API_BASE}/descriptive-summary`, {
            kpis: kpis,
            regional_data: regionalRevenue,
            warehouse_data: warehouseData,
            view: activeView,
            language: language,
            predictive: activeView === 'Executive Dashboard' ? {
              sales: salesForecast,
              expiry: expiryRisk,
              demand: demandPred,
              returns: returnProb
            } : null
          });
          setAiSummary(res.data.summary);
        } catch (err) {
          console.error("Summary Error:", err);
        }
      };
      getSummary();
    }
  }, [activeView, kpis]);

  const handleSendMessage = async (e, chart = null, isCopilot = true, textOverride = null) => {
    if (e.key === 'Enter' || chart || textOverride) {
      const currentInput = isCopilot ? chatInput : nexusChatInput;
      const text = textOverride || (chart ? `Tell me more about the data point in **${chart.title}**.` : currentInput);
      if (!chart && !text.trim()) return;

      const currentMessages = isCopilot ? copilotMessages : nexusMessages;
      if (currentMessages.some(m => m.isTemp)) return;

      if (isCopilot) setChatInput("");
      else setNexusChatInput("");

      const userId = Date.now();
      const aiTempId = Date.now() + 1;

      let newId = activeThreadId;

      if (!isCopilot && !activeThreadId) {
        // Auto-create thread if none exists
        newId = Date.now().toString();
        setThreads(prev => [{
          id: newId,
          title: text.length > 30 ? text.substring(0, 30) + '...' : text,
          messages: [
            { id: userId, role: "user", text: text },
            { id: aiTempId, role: "ai", text: "...", isTemp: true, isNew: true }
          ]
        }, ...prev]);
        setActiveThreadId(newId);
      } else {
        if (isCopilot) {
          setCopilotMessages(p => [...p,
          { id: userId, role: "user", text: text },
          { id: aiTempId, role: "ai", text: "...", isTemp: true, isNew: true }
          ]);
        } else {
          setThreads(prev => {
            const target = prev.find(t => t.id === activeThreadId);
            if (!target) return prev;
            const updated = {
              ...target,
              messages: [...target.messages,
              { id: userId, role: "user", text: text },
              { id: aiTempId, role: "ai", text: "...", isTemp: true, isNew: true }
              ]
            };
            return [updated, ...prev.filter(t => t.id !== activeThreadId)];
          });
        }
      }

      try {
        const res = await axios.post(`${API_BASE}/copilot-chat`, {
          message: text,
          context: {
            descriptive: {
              kpis: kpis || {},
              regional_revenue: regionalRevenue || [],
              warehouse_load: warehouseData || [],
              top_products: topProducts || []
            },
            predictive: {
              sales_forecast: salesForecast || {},
              expiry_risk: expiryRisk || {},
              demand_prediction: demandPred || [],
              return_probability: returnProb || {},
              prescriptive_rebalancing: expiryMatchResults || {}
            },
            active_view: activeView,
            specific_chart: chart ? { title: chart.title, insight: chart.dynamicInsight ? chart.dynamicInsight(chart.data) : "No live insight" } : null
          },
          language: language
        }, { timeout: 60000 });

        const aiId = Date.now() + 2;
        const aiResponse = {
          id: aiId,
          role: "ai",
          text: res.data.response,
          usage: res.data.usage,
          isNew: true,
          onComplete: () => markMessageAsOld(aiId, isCopilot)
        };

        if (isCopilot) {
          setCopilotMessages(p => p.filter(m => !m.isTemp).concat(aiResponse));
        } else {
          setThreads(prev => {
            const target = prev.find(t => t.id === newId);
            if (!target) return prev;
            const newTitle = target.title === 'New Conversation' ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : target.title;
            const updated = {
              ...target,
              title: newTitle,
              messages: target.messages.filter(m => !m.isTemp).concat(aiResponse)
            };
            return [updated, ...prev.filter(t => t.id !== newId)];
          });
        }

        // Save the interaction to the database (for both Copilot and Ask Nexus)
        try {
          await axios.post(`${API_BASE}/chat-history`, {
            session_id: isCopilot ? "floating-copilot" : newId,
            question: text,
            answer: res.data.response,
            usage: res.data.usage
          });
        } catch (dbErr) {
          console.error("Failed to save to DB:", dbErr);
        }
      } catch (error) {
        console.error("Chat Error:", error);
        const errId = Date.now() + 3;
        const errResponse = {
          id: errId,
          role: "ai",
          text: "PharmaIQ brain is offline or taking too long. Please try again.",
          isNew: true,
          onComplete: () => markMessageAsOld(errId, isCopilot)
        };
        if (isCopilot) {
          setCopilotMessages(p => p.filter(m => !m.isTemp).concat(errResponse));
        } else {
          setThreads(prev => prev.map(t => t.id === newId ? {
            ...t,
            messages: t.messages.filter(m => !m.isTemp).concat(errResponse)
          } : t));
        }
      }
    }
  };

  // Need to pass these down
  const [nexusChatInput, setNexusChatInput] = useState("");
  const handleDrill = (chartId, dataPoint) => {
    if (!dataPoint) return;

    // Support various Recharts event payloads
    let label = '';
    if (dataPoint.activeLabel) label = dataPoint.activeLabel;
    else if (dataPoint.name) label = dataPoint.name;
    else if (dataPoint.payload && dataPoint.payload.name) label = dataPoint.payload.name;
    else if (dataPoint.payload && dataPoint.payload.region) label = dataPoint.payload.region;
    else if (dataPoint.payload && dataPoint.payload.warehouse) label = dataPoint.payload.warehouse;
    else if (dataPoint.activePayload && dataPoint.activePayload[0]) {
      label = dataPoint.activePayload[0].payload.name || dataPoint.activePayload[0].payload.region || dataPoint.activePayload[0].payload.category;
    }

    if (!label) return;

    setDrillStates(prev => ({
      ...prev,
      [chartId]: {
        level: 1,
        filterValue: label,
        parentTitle: chartExplanations[chartId]?.title || 'Parent'
      }
    }));
  };

  const resetDrill = (chartId) => {
    setDrillStates(prev => {
      const newState = { ...prev };
      delete newState[chartId];
      return newState;
    });
  };

  const getDrilledData = (chartId, filterValue) => {
    if (!dbData || dbData.length === 0) return [];

    if (chartId === 'revenue_region') {
      // Drill into Region -> Category Breakdown
      const filtered = dbData.filter(d => d.region === filterValue);
      const groups = {};
      filtered.forEach(d => {
        const cat = d.product_name || 'Unknown';
        groups[cat] = (groups[cat] || 0) + (d.revenue_iqd || 0);
      });
      return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }

    if (chartId === 'product_contribution') {
      // Drill into Category -> Top 10 Products
      const filtered = dbData.filter(d => d.product_name === filterValue);
      const groups = {};
      filtered.forEach(d => {
        const prod = d.product_name || 'Unknown';
        groups[prod] = (groups[prod] || 0) + (d.revenue_iqd || 0);
      });
      return Object.entries(groups)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }

    if (chartId === 'warehouse_sales') {
      // Drill into Warehouse -> Transaction Type Breakdown
      const filtered = dbData.filter(d => d.warehouse === filterValue);
      const groups = {};
      filtered.forEach(d => {
        const type = d.transaction_type || 'Direct';
        groups[type] = (groups[type] || 0) + (d.revenue_iqd || 0);
      });
      return Object.entries(groups).map(([name, revenue]) => ({ name, revenue }));
    }

    if (chartId === 'regional') {
      // Drill into Regional Time Series -> Regional Product breakdown (latest aggregated)
      const filtered = dbData.filter(d => d.region === filterValue);
      const groups = {};
      filtered.forEach(d => {
        groups[d.product_name] = (groups[d.product_name] || 0) + (d.revenue_iqd || 0);
      });
      return Object.entries(groups).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    }

    return [];
  };

  const handleShowInSidebar = (chart, dataPoint = null) => {
    const dynamicText = chart.dynamicInsight && chart.data ? chart.dynamicInsight(chart.data) : "";
    const cleanedInsight = dynamicText.replace(/\*\*(.*?)\*\*/g, '$1');

    let contextualMessage = `I've analyzed the **${chart.title}** visualization for you.\n\n` +
      `**Live Insight:** ${cleanedInsight}\n\n` +
      `**What it shows:** ${chart.overview}\n\n`;

    if (dataPoint) {
      contextualMessage += `**Drill-down Focus:** You clicked on **${dataPoint.activeLabel || dataPoint.name || 'this point'}** which shows a value of **${dataPoint.activePayload ? dataPoint.activePayload[0].value : (dataPoint.value || '')}**.\n\n`;
    }

    contextualMessage += `I'm ready to answer any deep-dive questions about this data. What else would you like to know?`;

    setMessages(p => [...p, { role: "ai", text: contextualMessage }]);
    setSelectedChart(null);
    setPendingInteraction(null);
    setCopilotCollapsed(false);
  };

  const handleInteraction = (e, chart) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingInteraction({
      chart,
      x: e.clientX,
      y: e.clientY
    });
  };

  const chartExplanations = {
    asp: {
      title: "Average Selling Price (ASP) Gauge",
      overview: "This is a single-value visualization acting as a gauge. It represents a single critical number: the average price that products are being sold for across the entire business. There are no X or Y axes here, just the pure figure representing revenue per unit sold.",
      conveys: [
        { title: "Pricing Pulse", desc: "Instantly tells us if we are relying on high-volume cheap sales, or low-volume premium sales." },
        { title: "Market Strategy", desc: "A rising number indicates customers are willing to pay more or are buying premium products. A declining number could mean we are offering too many discounts." }
      ],
      dynamicInsight: (data) => `Our currently active Average Selling Price is ${data[0].value.toLocaleString()} IQD, reflecting our current market position.`,
      data: kpis?.avg_selling_price ? [kpis.avg_selling_price] : [{ value: 450, suffix: 'IQD' }]
    },
    regional: {
      title: "Regional Sales Trends",
      overview: "This is a line chart tracking financial momentum over time.\n\nX-Axis (Horizontal): Represents the progression of time (Dates).\nY-Axis (Vertical): Represents the total revenue generated (in IQD).\nEach colored line represents a different city or region.",
      conveys: [
        { title: "Growth Trajectory", desc: "Reveals the momentum of our sales. Lines trending upwards show successful growth strategies." },
        { title: "Seasonal Spikes", desc: "Sharp, sudden peaks in the lines indicate a strong reaction to a marketing campaign or a seasonal event." },
        { title: "Regional Comparison", desc: "By comparing the height of the lines on any given day, we can instantly tell which region is serving as our financial backbone." }
      ],
      dynamicInsight: (data) => {
        if (!data || data.length === 0) return "Analyzing regional trends...";
        const lastDay = data[data.length - 1];
        const regions = Object.keys(lastDay).filter(k => k !== 'date');
        const topRegion = regions.reduce((a, b) => lastDay[a] > lastDay[b] ? a : b);
        return `Based on the latest data from ${lastDay.date}, **${topRegion}** is currently leading in sales performance compared to other regions.`;
      },
      data: regionalTrend
    },
    batch: {
      title: "Batch Performance Analysis",
      overview: "This is a treemap visualizing the success of various manufacturing production runs. There are no standard axes here. Instead, the size of each rectangular box is proportional to the total revenue generated by that specific batch of products.",
      conveys: [
        { title: "Production Success", desc: "The largest boxes represent our most successful and lucrative production batches." },
        { title: "Quality Assurance", desc: "If a normally highly-produced batch yields a very small box, it may indicate a recall, quality control issue, or sudden drop in market demand for that specific formula." }
      ],
      dynamicInsight: (data) => {
        const top = [...data].sort((a, b) => b.value - a.value)[0];
        return `Analysis shows that **${top?.name}** is our most profitable production run, contributing the largest share of revenue in this view.`;
      },
      data: batchData
    },
    warehouse: {
      title: "Warehouse Intensity",
      overview: "This is a scatter plot used to identify bottlenecks in our logistics network. Every dot represents one of our warehouses.\n\nX-Axis (Horizontal): The total number of items handled by the warehouse.\nY-Axis (Vertical): The frequency or total number of separate orders processed.",
      conveys: [
        { title: "Operational Overload", desc: "Warehouses plotting high and to the right are doing the most work and are at the highest risk of delays. We may need to route shipments away from these." },
        { title: "Underutilized Assets", desc: "Warehouses plotting low and to the left have plenty of capacity and can handle more of our supply chain load." }
      ],
      dynamicInsight: (data) => {
        const top = [...data].sort((a, b) => b.volume - a.volume)[0];
        return `Current logistics scan: **${top?.warehouse}** is handling the highest volume of items (${top?.volume?.toLocaleString()}), identifying it as a critical operational node.`;
      },
      data: warehouseVolume
    },
    demand: {
      title: "Product Demand",
      overview: "This is a histogram (bar chart) showing how customers prefer to buy our products.\n\nX-Axis (Horizontal): Groups order quantities into 'buckets' (e.g., orders of 1-10 items, 11-20 items).\nY-Axis (Vertical): Shows how many times an order of that size was placed.",
      conveys: [
        { title: "Customer Behavior", desc: "A tall bar on the left means customers usually buy one or two items at a time (retail style). A tall bar on the right means customers buy massive wholesale bulk orders." },
        { title: "Packaging Strategy", desc: "If bulk orders are high, we should focus on larger pallet shipments. If small orders are high, we should focus on individual, shelf-ready packaging." }
      ],
      dynamicInsight: (data) => {
        const top = [...data].sort((a, b) => b.count - a.count)[0];
        return `Market analysis indicates that orders in the **${top?.bin}** range occur most frequently, suggesting this is our primary customer order profile.`;
      },
      data: demandDistribution
    },
    expiry: {
      title: "Expiry Risk",
      overview: "This is a stacked area chart showing the health and safety of our current inventory.\n\nX-Axis (Horizontal): The upcoming months.\nY-Axis (Vertical): The quantity of stock in our warehouses.\nGreen Area: Products that are safe and far from expiring.\nRed Area: Products that will expire in the corresponding month.",
      conveys: [
        { title: "Financial Risk", desc: "A large red spike in the near future means we have a lot of product that will expire. This represents a huge financial loss if not sold immediately." },
        { title: "Discount Triggers", desc: "Seeing an incoming red wave signals the sales team to start offering heavy discounts to move the product before we have to throw it away." }
      ],
      dynamicInsight: (data) => {
        const peakRisk = [...data].sort((a, b) => b.near_expiry - a.near_expiry)[0];
        return `Logistics Warning: Expiry risk peaks in **${peakRisk?.month}** with ${peakRisk?.near_expiry?.toLocaleString()} units nearing expiration. Sales intervention recommended.`;
      },
      data: expiryData
    },
    total_rev: {
      title: "Total Revenue Overview",
      overview: "This is a high-level summary card focusing on our absolute most critical metric. There are no axes. It simply displays the grand total sum of all revenue generated.",
      conveys: [
        { title: "Bottom Line Health", desc: "This is the ultimate indicator of whether Konfig Pharma is making money." },
        { title: "Instant Status Check", desc: "Allows executives to quickly glance and understand the scale of the operation." }
      ],
      dynamicInsight: (data) => {
        if (!data || data.length === 0) return "No revenue data available.";
        return `Our current total revenue stands at **${data[0].value?.toLocaleString()} IQD**, indicating the overall financial scale of operations.`;
      },
      data: kpis?.total_revenue ? [kpis.total_revenue] : []
    },
    total_units: {
      title: "Total Units Sold",
      overview: "This is a high-level summary card tracking the physical scale of our sales. There are no axes. It simply shows the exact count of individual products shipped to customers.",
      conveys: [
        { title: "Market Reach", desc: "Highlights how much physical product is out there in the market." },
        { title: "Logistics Scale", desc: "Helps the warehouse and shipping teams understand the sheer volume of boxes they've had to move." }
      ],
      dynamicInsight: (data) => {
        if (!data || data.length === 0) return "No unit sales data available.";
        return `We have successfully sold **${data[0].value?.toLocaleString()} units** to date, reflecting our market reach and product distribution.`;
      },
      data: kpis?.total_units_sold ? [kpis.total_units_sold] : []
    },
    revenue_trend: {
      title: "Revenue Trend Over Time",
      overview: "This is an area chart mapping out the heartbeat of our daily sales.\n\nX-Axis (Horizontal): The date.\nY-Axis (Vertical): Total revenue made on that date.",
      conveys: [
        { title: "Business Momentum", desc: "If the shaded shape generally rises from left to right, our business is growing." },
        { title: "Identifying Dry Spells", desc: "Deep dips in the shape instantly highlight bad days or dead seasons where sales dropped dramatically." }
      ],
      dynamicInsight: (data) => {
        const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
        return `Sales reached a peak of **${sorted[0]?.revenue?.toLocaleString()} IQD** on ${sorted[0]?.date}, showing strong volatility across the tracked period.`;
      },
      data: revenueTrend
    },
    top_products: {
      title: "Top Selling Products",
      overview: "This is a horizontal bar chart ranking our catalog.\n\nX-Axis (Horizontal): The number of units sold.\nY-Axis (Vertical): The name of the specific product.",
      conveys: [
        { title: "Hero Products", desc: "The longest bars at the top represent our flagship products. These are the lifeblood of our company and we can never allow them to go out of stock." },
        { title: "Underperformers", desc: "Products at the bottom with short bars might need redesigns, better marketing, or to be discontinued outright." }
      ],
      dynamicInsight: (data) => {
        const top = data[0];
        return `Inventory Priority: **${top?.name}** is currently our top performer by volume. Ensure stock levels for this item are prioritized.`;
      },
      data: topProducts
    },
    revenue_region: {
      title: "Revenue by Region",
      overview: "This is a vertical bar chart comparing the financial performance across different regional territories.\n\nX-Axis (Horizontal): The specific city or region.\nY-Axis (Vertical): The total revenue generated in that region.",
      conveys: [
        { title: "Top Performer", desc: "The tallest bar immediately identifies our most lucrative market. This is where our strategy is working best." },
        { title: "Significant Disparity", desc: "We can easily visualize the gaps between our highest-performing cities and those that are lagging behind, like the difference between Erbil and Baghdad." },
        { title: "Untapped Opportunities", desc: "Very short bars might represent major cities where we have poor distribution. These are prime targets for aggressive expansion." }
      ],
      dynamicInsight: (data) => {
        const best = [...data].sort((a, b) => b.revenue - a.revenue)[0];
        const least = [...data].sort((a, b) => a.revenue - b.revenue)[0];
        return `**${best?.region}** shows the highest market dominance with ${best?.revenue?.toLocaleString()} IQD, while **${least?.region}** represents our largest growth opportunity.`;
      },
      data: regionalRevenue
    },
    warehouse_sales: {
      title: "Warehouse Sales Performance",
      overview: "This is a bar chart evaluating which logistics hubs are shipping our most valuable orders.\n\nX-Axis (Horizontal): The name of the specific warehouse.\nY-Axis (Vertical): The total financial value of all orders fulfilled by that warehouse.",
      conveys: [
        { title: "Financial Hubs", desc: "A tall bar shows that a warehouse handles premium, expensive, or massive orders. This warehouse is critical to our cash flow." },
        { title: "Resource Allocation", desc: "We should ensure our highest-revenue warehouses have the best security, the most staff, and the most reliable delivery trucks." }
      ],
      dynamicInsight: (data) => {
        const top = [...data].sort((a, b) => b.sales - a.sales)[0];
        return `Logistics Hub **${top?.warehouse}** is our most efficient financial node, fulfilling orders totaling ${top?.sales?.toLocaleString()} IQD.`;
      },
      data: warehouseData
    },
    product_contribution: {
      title: "Product Revenue Contribution",
      overview: "This is a pie chart illustrating how our revenue is split. There are no X or Y axes. The entire pie represents 100% of our revenue, and each colored slice represents a different product.",
      conveys: [
        { title: "Market Diversification", desc: "If the pie is split relatively evenly among many slices, our business is safe and diversified." },
        { title: "Dangerous Reliance", desc: "If one single slice takes up half the pie, it means our entire company relies heavily on just one product. If that product fails, the company suffers." }
      ],
      dynamicInsight: (data) => {
        const top = [...data].sort((a, b) => b.value - a.value)[0];
        return `**${top?.name}** is your primary revenue anchor, accounting for roughly ${Math.round((top?.value / data.reduce((s, r) => s + r.value, 0)) * 100)}% of the total product contribution.`;
      },
      data: productContribution
    },
    revenue_type: {
      title: "Revenue by Transaction Type",
      overview: "This is a bar chart analyzing the nature of our sales channels.\n\nX-Axis (Horizontal): The type of transaction (e.g., Wholesale, Retail, Direct).\nY-Axis (Vertical): The amount of revenue generated through that channel.",
      conveys: [
        { title: "Core Business Mode", desc: "The tallest bar reveals how we actually make our money—whether we're primarily a B2B (business-to-business) wholesale supplier, or a direct retailer." },
        { title: "Strategy Shifts", desc: "If we try to launch a new retail initiative, checking this chart will tell us if it's actually making a dent in our revenue compared to our traditional channels." }
      ],
      dynamicInsight: (data) => {
        const top = [...data].sort((a, b) => b.revenue - a.revenue)[0];
        return `Channel Analysis: Our most lucrative transaction type is currently **${top?.type}**, which accounts for the most revenue in our stream.`;
      },
      data: revenueByType
    },
    sales_forecast: {
      title: "Strategic Sales Forecast",
      overview: "AI-driven 90-day projection of revenue streams based on historical patterns and market volatility.",
      dynamicInsight: (data) => {
        if (!data || data.length === 0) return "Analyzing forecast patterns...";
        const total = data.reduce((acc, d) => acc + (d.predicted_revenue || 0), 0);
        const peak = [...data].sort((a, b) => b.predicted_revenue - a.predicted_revenue)[0];
        return `Predictive Model: Total forecasted revenue for the next 90 days is **${Math.round(total).toLocaleString()} IQD**, with a peak activity projected on **${new Date(peak?.date).toLocaleDateString()}**.`;
      },
      data: salesForecast?.forecast
    },
    demand_forecast: {
      title: "Strategic Demand Forecast",
      overview: "Machine learning prediction of product demand for the upcoming month to optimize inventory levels.",
      dynamicInsight: (data) => {
        if (!data || data.length === 0) return "Calculating demand projections...";
        const top = [...data].sort((a, b) => b.predicted_demand - a.predicted_demand)[0];
        return `Inventory Insight: **${top?.product}** has the highest projected product demand (${Math.round(top?.predicted_demand).toLocaleString()} units) for next month. Recommend prioritizing stock fulfillment for this item.`;
      },
      data: demandPred
    },
    expiry_risk_pie: {
      title: "Expiry Risk Distribution",
      overview: "Breakdown of inventory segments by their remaining shelf life.",
      dynamicInsight: (data) => {
        const critical = data.find(d => d.name.includes('Critical'))?.value || 0;
        return `Immediate Action Required: There are **${critical.toLocaleString()} batches** in the critical expiry window (≤30 days). Immediate clearance strategies should be deployed.`;
      },
      data: [] // Handled in render
    }
  };


  const renderExecutiveDashboard = () => (
    <div className="descriptive-page executive-dashboard">
      <div className="category-header">
        <div className="heading-badge">📊 {t.executiveDashboard}</div>
        <h1 className="category-title">{t.executiveDashboard}</h1>
        <p className="category-desc">A refined overview of critical pharmaceutical operations and ML-driven forecasts.</p>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <KPICard
          title={t.totalRevenue}
          value={kpis?.total_revenue?.value}
          suffix="IQD"
          trend={kpis?.total_revenue?.trend}
          icon={DollarSign}
          color="blue"
        />
        <KPICard
          title={t.salesForecast}
          value={salesForecast?.summary?.total_predicted_revenue}
          suffix="IQD"
          icon={TrendingUp}
          color="purple"
          subtitle="AI Predicted Stream"
        />
        <KPICard
          title={t.expiryRisk}
          value={expiryRisk?.summary?.total_products_at_risk}
          icon={AlertTriangle}
          color="red"
          subtitle={`${expiryRisk?.summary?.critical_count || 0} Critical Batches`}
        />
        <KPICard
          title={t.predictedDemand}
          value={demandPred?.reduce((acc, d) => acc + d.predicted_demand, 0)}
          suffix="Units"
          icon={Package}
          color="green"
          subtitle="Next 30 Days"
        />
        <KPICard
          title={t.avgSellingPrice}
          value={kpis?.avg_selling_price?.value}
          suffix="IQD"
          icon={Activity}
          color="amber"
          subtitle={t.marketPosition}
        />
        <KPICard
          title={t.returnProbability}
          value={returnProb?.summary?.avg_return_rate}
          suffix="%"
          icon={RotateCcw}
          color="teal"
          subtitle={`${returnProb?.summary?.high_risk_count || 0} High Risk Items`}
        />
      </div>

      <div className="analysis-grid">
        {/* Full Length: Regional Sales Trend */}
        <div className="card-container full-width">
          <div className="card executive-chart-card">
            <div className="card-header">
              <h3 className="card-title"><MapPin size={18} /> Regional Sales Trends</h3>
              <div className="filter-group" style={{ display: 'flex', gap: '12px' }}>
                <select
                  className="premium-select"
                  value={selectedTrendRegion}
                  onChange={(e) => setSelectedTrendRegion(e.target.value)}
                >
                  <option value="All">All Regions</option>
                  {regionalRevenue.map(r => (
                    <option key={r.region} value={r.region}>{r.region}</option>
                  ))}
                </select>
                <select
                  className="premium-select"
                  value={selectedTrendMonth}
                  onChange={(e) => setSelectedTrendMonth(e.target.value)}
                >
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="card-body" style={{ height: 'auto', padding: '24px' }}>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'var(--text2)', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--text2)', fontWeight: 600 }}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={v => v.toLocaleString()}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    {regionalRevenue
                      .filter(r => selectedTrendRegion === "All" || r.region === selectedTrendRegion)
                      .map((r) => {
                        const colorIndex = regionalRevenue.findIndex(orig => orig.region === r.region);
                        const color = DASHBOARD_COLORS[colorIndex % DASHBOARD_COLORS.length];
                        return (
                          <Line
                            key={r.region}
                            type="linear"
                            dataKey={r.region}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        );
                      })
                    }
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {chartExplanations.regional.dynamicInsight && (
                <div className="card-insight" style={{ marginTop: '24px' }}>
                  <Zap size={14} className="text-amber" />
                  <div dangerouslySetInnerHTML={{ __html: chartExplanations.regional.dynamicInsight(filteredTrendData).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              )}
            </div>
          </div>
        </div>



        <div className="grid-2">
          <div className="card-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card executive-chart-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <h3 className="card-title"><AlertTriangle size={18} /> Expiry Risk Analysis</h3>
              </div>
              <div className="card-body" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fee2e2', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#dc2626' }}>{expiryRisk?.summary?.critical_count || 0}</div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase', marginTop: '4px' }}>Critical (≤30d)</div>
                  </div>
                  <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fef3c7', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#d97706' }}>{expiryRisk?.summary?.high_count || 0}</div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', marginTop: '4px' }}>High (31-60d)</div>
                  </div>
                  <div style={{ background: '#f5f3ff', padding: '16px', borderRadius: '12px', border: '1px solid #ede9fe', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#7c3aed' }}>{expiryRisk?.summary?.medium_count || 0}</div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#5b21b6', textTransform: 'uppercase', marginTop: '4px' }}>Medium (61-120d)</div>
                  </div>
                </div>

                <div style={{ flex: 1, minHeight: '230px', marginBottom: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical (≤30d)', value: expiryRisk?.summary?.critical_count || 0 },
                          { name: 'High (31-60d)', value: expiryRisk?.summary?.high_count || 0 },
                          { name: 'Medium (61-120d)', value: expiryRisk?.summary?.medium_count || 0 }
                        ]}
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#8b5cf6" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="card-insight" style={{ marginTop: 'auto' }}>
                  <Zap size={14} className="text-amber" style={{ flexShrink: 0 }} />
                  <div dangerouslySetInnerHTML={{
                    __html: chartExplanations.expiry_risk_pie.dynamicInsight([
                      { name: 'Critical (≤30d)', value: expiryRisk?.summary?.critical_count || 0 },
                      { name: 'High (31-60d)', value: expiryRisk?.summary?.high_count || 0 },
                      { name: 'Medium (61-120d)', value: expiryRisk?.summary?.medium_count || 0 }
                    ]).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card executive-chart-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <h3 className="card-title"><PieChartIcon size={18} /> Product Revenue Contribution</h3>
              </div>
              <div className="card-body" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                <div style={{ flex: 1, minHeight: '300px', marginBottom: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productContribution}
                        cx="50%"
                        cy="40%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {productContribution.map((e, i) => (
                          <Cell key={i} fill={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => v.toLocaleString()} />
                      <Legend
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', lineHeight: '14px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {chartExplanations.product_contribution.dynamicInsight && (
                  <div className="card-insight" style={{ marginTop: 'auto' }}>
                    <Zap size={14} className="text-amber" style={{ flexShrink: 0 }} />
                    <div dangerouslySetInnerHTML={{ __html: chartExplanations.product_contribution.dynamicInsight(productContribution).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Demand Forecast Snapshot (Full Width) */}
        <div className="card-container full-width">
          <div className="card executive-chart-card">
            <div className="card-header">
              <h3 className="card-title"><Package size={18} /> Strategic Demand Forecast Snapshot (Next Month)</h3>
            </div>
            <div className="card-body" style={{ height: '450px', padding: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandPred?.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="product"
                    tick={{ fontSize: 9, fill: 'var(--text2)', fontWeight: 600 }}
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text2)', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="predicted_demand" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {chartExplanations.demand_forecast.dynamicInsight && (
              <div className="card-insight" style={{ marginTop: '24px', marginInline: '24px', marginBottom: '24px' }}>
                <Zap size={14} className="text-amber" />
                <div dangerouslySetInnerHTML={{ __html: chartExplanations.demand_forecast.dynamicInsight(demandPred || []).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            )}
          </div>
        </div>

        {/* Interactive Sales Forecast Details from Predictive Pages */}
        {execSalesForecast && (
          <div className="card-container full-width">
            <div className="card executive-chart-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title"><Calendar size={18} /> Sales Forecast Details</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select
                    value={execSelectedRegion}
                    onChange={(e) => setExecSelectedRegion(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      fontSize: '13px',
                      color: 'var(--text)'
                    }}
                  >
                    {["All Regions", "Baghdad", "Basra", "Erbil", "Mosul", "Anbar"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select
                    value={execForecastDays}
                    onChange={(e) => setExecForecastDays(Number(e.target.value))}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      fontSize: '13px',
                      color: 'var(--text)'
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

              <div className="card-body" style={{ padding: '24px' }}>
                <div style={{ position: 'relative', height: '300px', marginBottom: '24px', width: '100%' }}>
                  {isFetchingExecForecast && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(255,255,255,0.7)', zIndex: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Zap size={32} className="spin text-blue" />
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
                    const DEFAULT_COLOR = "#94a3b8";

                    let chartData = execSalesForecast.forecast?.slice(0, execForecastDays) || [];
                    let forecastRegions = [];

                    if (execSalesForecast.regional_forecasts) {
                      forecastRegions = Object.keys(execSalesForecast.regional_forecasts);
                      const merged = [];
                      const dates = chartData.map(d => d.date);
                      dates.forEach((date, i) => {
                        const entry = { date };
                        forecastRegions.forEach(reg => {
                          entry[reg] = execSalesForecast.regional_forecasts[reg][i]?.predicted_revenue || 0;
                        });
                        merged.push(entry);
                      });
                      chartData = merged;
                    }

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenueExec" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={execSelectedRegion !== 'All Regions' ? (REGION_COLORS[execSelectedRegion] || DEFAULT_COLOR) : "#8b5cf6"} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={execSelectedRegion !== 'All Regions' ? (REGION_COLORS[execSelectedRegion] || DEFAULT_COLOR) : "#8b5cf6"} stopOpacity={0} />
                            </linearGradient>
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
                              name={execSelectedRegion !== 'All Regions' ? execSelectedRegion : "Total Forecast"}
                              stroke={execSelectedRegion !== 'All Regions' ? (REGION_COLORS[execSelectedRegion] || DEFAULT_COLOR) : "#8b5cf6"}
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorRevenueExec)"
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
                  background: '#f8fafc',
                  borderRadius: '12px',
                  opacity: isFetchingExecForecast ? 0.5 : 1
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Forecast</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>
                      {execSalesForecast.summary?.total_predicted_revenue?.toLocaleString()} <span style={{ fontSize: '11px' }}>IQD</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '4px' }}>Average Daily</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>
                      {Math.round(execSalesForecast.summary?.avg_daily_revenue || 0).toLocaleString()} <span style={{ fontSize: '11px' }}>IQD</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '4px' }}>Market Trend</div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '900',
                      color: execSalesForecast.summary?.trend === 'upward' ? 'var(--green)' : 'var(--text)',
                      textTransform: 'capitalize'
                    }}>
                      {execSalesForecast.summary?.trend || 'stable'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '4px' }}>Prediction confidence</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>
                      {(execSalesForecast.forecast?.reduce((acc, f) => acc + f.confidence, 0) / (execSalesForecast.forecast?.length || 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Prescriptive Engine Expiry-to-Demand Match */}
        {expiryMatchResults && (
          <div className="executive-chart-card" style={{
            padding: '24px',
            marginTop: '32px'
          }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
                <Zap size={18} style={{ display: 'inline', marginRight: '8px', color: '#2563eb' }} />
                Prescriptive Engine: Expiry-to-Demand Match
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                Total Financial Risk: <strong style={{ color: '#ef4444' }}>{expiryMatchResults.summary?.total_value_at_risk?.toLocaleString()} IQD</strong>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '20px' }}>
              The engine has matched near-expiry batches to the regions with the highest sales velocity. Move inventory to the **Recommended Region** to maximize clearance.
            </p>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Product & Batch</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Days Left</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Best Region</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Clearance Time</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>Value at Risk</th>
                    <th style={{ textAlign: 'center', padding: '16px', fontWeight: '700', color: 'var(--text)' }}>System Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {(expiryMatchResults.results || []).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>{row.product}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'monospace' }}>{row.batch}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{
                          color: row.days_to_expiry <= 30 ? '#ef4444' : row.days_to_expiry <= 60 ? '#f59e0b' : 'var(--text2)',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#2563eb' }}>
                          <MapPin size={14} />
                          {row.best_region}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: 'var(--text2)' }}>
                          {row.days_to_clear} days <span style={{ fontSize: '10px', color: 'var(--text3)' }}>(estimated)</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text)' }}>
                        {Math.round(row.value_at_risk || 0).toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text3)' }}>IQD</span>
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
          </div>
        )}
      </div>
    </div>
  );

  const renderDescriptiveAnalysis = () => (
    <>
      <div className="descriptive-page">
        <div className="category-header">
          {activeView === 'Descriptive' ? (
            <>
              <div className="heading-badge">📖 KPI Dictionary & Insight</div>
              <h1 className="category-title">Descriptive Analysis</h1>
              <p className="category-desc">Deep-dive visualizations for every defined pharmaceutical business metric.</p>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveView('Descriptive')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  color: 'var(--text2)',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  transition: 'all 0.2s'
                }}
              >
                ← Back to Overview
              </button>
              <div className="heading-badge">
                {activeView === 'Sales Panel' ? '💰 Financial Performance' :
                  activeView === 'Regional Performance' ? '🌍 Geographic Analysis' : '📦 Logistics Depth'}
              </div>
              <h1 className="category-title">{activeView}</h1>
              <p className="category-desc">Focused module: {activeView === 'Sales Panel' ? 'Revenue, ASP, and Portfolio Analytics' :
                activeView === 'Regional Performance' ? 'Map breakdown and Regional Growth' : 'Inventory and Warehouse Efficiency'}.</p>
            </>
          )}
        </div>

        {['Descriptive', 'Sales Panel', 'Regional Performance', 'Warehouse Operations'].includes(activeView) && (
          <div className="descriptive-summary-card AI-powered">
            <div className="summary-icon-box"><Zap style={{ color: 'var(--amber)' }} size={24} /></div>
            <div className="summary-text-content">
              <div className="ai-badge-sm">Gemini AI Analysis</div>
              <h3>{t.strategicOutlook}</h3>
              <p className="ai-summary-text">{aiSummary || t.aiAnalysisInitializing}</p>
              <div className="summary-meta-row">
                {activeView === 'Sales Panel' ? (
                  <>
                    <span className="summary-meta-item">📊 6 Sales KPIs</span>
                    <span className="summary-meta-item">💰 Financial Focus</span>
                    <span className="summary-meta-item">⚡ Revenue Analytics</span>
                  </>
                ) : activeView === 'Regional Performance' ? (
                  <>
                    <span className="summary-meta-item">📍 {regionalRevenue.length} Regions Active</span>
                    <span className="summary-meta-item">🌍 Geographic Depth</span>
                    <span className="summary-meta-item">📈 Market Capture</span>
                  </>
                ) : activeView === 'Warehouse Operations' ? (
                  <>
                    <span className="summary-meta-item">🏢 {warehouseData.length} Warehouses</span>
                    <span className="summary-meta-item">📦 Inventory Flow</span>
                    <span className="summary-meta-item">⚙️ Operational Load</span>
                  </>
                ) : (
                  <>
                    <span className="summary-meta-item">📊 14 Active KPIs</span>
                    <span className="summary-meta-item">📍 {regionalRevenue.length} Regions Active</span>
                    <span className="summary-meta-item">⚡ Live Data Edge</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="analysis-grid">
          {/* ROW: Overall KPIs */}
          {['Descriptive', 'Sales Panel'].includes(activeView) && (
            <div className="grid-2">
              <div className="card-container">
                <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.total_rev)} onContextMenu={(e) => handleInteraction(e, chartExplanations.total_rev)}>
                  <div className="card-header">
                    <h3 className="card-title"><DollarSign size={18} /> {t.totalRevenue}</h3>
                    <div className="card-info-icon"><Zap size={14} /></div>
                  </div>
                  <div className="card-body flex-center" style={{ height: 'auto', minHeight: '150px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--blue)' }}>{kpis?.total_revenue?.value?.toLocaleString() || 0}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: '800' }}>IQD</div>
                    {chartExplanations.total_rev.dynamicInsight && (
                      <div className="card-insight" style={{ marginTop: '20px' }}>
                        <Zap size={14} className="text-amber" />
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chartExplanations.total_rev.dynamicInsight(chartExplanations.total_rev.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-container">
                <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.total_units)} onContextMenu={(e) => handleInteraction(e, chartExplanations.total_units)}>
                  <div className="card-header">
                    <h3 className="card-title"><Package size={18} /> {t.totalUnits}</h3>
                    <div className="card-info-icon"><Zap size={14} /></div>
                  </div>
                  <div className="card-body flex-center" style={{ height: 'auto', minHeight: '150px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--green)' }}>{kpis?.total_units_sold?.value?.toLocaleString() || 0}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: '800' }}>Units</div>
                    {chartExplanations.total_units.dynamicInsight && (
                      <div className="card-insight" style={{ marginTop: '20px' }}>
                        <Zap size={14} className="text-amber" />
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chartExplanations.total_units.dynamicInsight(chartExplanations.total_units.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          )}
          {/* ROW: High Priority Targets & Distributions */}
          {['Descriptive', 'Sales Panel', 'Regional Performance', 'ML Predictions'].includes(activeView) && (
            <div className="grid-2">
              <div className="card-container">
                <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.asp)} onContextMenu={(e) => handleInteraction(e, chartExplanations.asp)}>
                  <div className="card-header">
                    <h3 className="card-title"><Target size={18} /> Average Selling Price (ASP)</h3>
                    <div className="card-info-icon" style={{ color: 'var(--amber)' }}><Zap size={14} /></div>
                  </div>
                  <div className="card-body flex-center" style={{ height: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[{ value: kpis?.avg_selling_price?.value || 0 }, { value: 1000 - (kpis?.avg_selling_price?.value || 0) }]}
                          cx="50%" cy="100%"
                          startAngle={180} endAngle={0}
                          innerRadius={80} outerRadius={110}
                          paddingAngle={0} dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="var(--blue)" />
                          <Cell fill="var(--border)" />
                        </Pie>
                        <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: '-50px', marginBottom: '20px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text)' }}>
                        {Number(kpis?.avg_selling_price?.value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} IQD
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', marginTop: '4px' }}>Target: 500 IQD</div>
                    </div>
                    {chartExplanations.asp.dynamicInsight && (
                      <div className="card-insight" style={{ width: '100%' }}>
                        <Zap size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chartExplanations.asp.dynamicInsight(chartExplanations.asp.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-container">
                <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.demand)} onContextMenu={(e) => handleInteraction(e, chartExplanations.demand)}>
                  <div className="card-header">
                    <h3 className="card-title"><BarChart3 size={18} /> Product Demand</h3>
                    <div className="card-info-icon"><Zap size={14} /></div>
                  </div>
                  <div className="card-body" style={{ height: 'auto', padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demandDistribution}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {chartExplanations.demand.dynamicInsight && (
                      <div className="card-insight">
                        <Zap size={14} className="text-amber" />
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chartExplanations.demand.dynamicInsight(chartExplanations.demand.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FULL WIDTH ROW: Regional Sales Trends */}
          {['Descriptive', 'Sales Panel', 'Regional Performance'].includes(activeView) && (
            <div className="card-container" style={{ position: 'relative' }}>
              <div
                className={`card resizable-card ${isTrendResizing ? 'resizing' : ''}`}
                style={{ height: trendCardSize.height }}
                onClick={(e) => handleInteraction(e, chartExplanations.regional)}
                onContextMenu={(e) => handleInteraction(e, chartExplanations.regional)}
              >
                <div className="card-header">
                  <h3 className="card-title">
                    {drillStates.regional ? (
                      <div className="drill-breadcrumb">
                        <button className="drill-back-btn" onClick={(e) => { e.stopPropagation(); resetDrill('regional'); }}><ArrowLeft size={14} /></button>
                        <span>{drillStates.regional.parentTitle}</span>
                        <ChevronRight size={12} className="text-gray-400" />
                        <span className="text-blue">{drillStates.regional.filterValue}</span>
                      </div>
                    ) : (
                      <><MapPin size={18} /> Regional Sales Trends</>
                    )}
                  </h3>

                  <div className="filter-group" style={{ display: 'flex', gap: '12px' }} onClick={e => e.stopPropagation()}>
                    <select
                      className="premium-select"
                      value={selectedTrendRegion}
                      onChange={(e) => setSelectedTrendRegion(e.target.value)}
                    >
                      <option value="All">All Regions</option>
                      {regionalRevenue.map(r => (
                        <option key={r.region} value={r.region}>{r.region}</option>
                      ))}
                    </select>
                    <select
                      className="premium-select"
                      value={selectedTrendMonth}
                      onChange={(e) => setSelectedTrendMonth(e.target.value)}
                    >
                      {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="card-body" style={{ flex: 1, padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                  <div style={{ height: 'calc(100% - 40px)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={drillStates.regional ? getDrilledData('regional', drillStates.regional.filterValue) : filteredTrendData}
                        onClick={(dp) => !drillStates.regional && handleDrill('regional', dp)}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey={drillStates.regional ? "name" : "date"} tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                        <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        {drillStates.regional ? (
                          <Line type="linear" dataKey="value" stroke={DASHBOARD_COLORS[0]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        ) : (
                          regionalRevenue
                            .filter(r => selectedTrendRegion === "All" || r.region === selectedTrendRegion)
                            .map((r) => {
                              const colorIndex = regionalRevenue.findIndex(orig => orig.region === r.region);
                              const color = DASHBOARD_COLORS[colorIndex % DASHBOARD_COLORS.length];
                              return (
                                <Line
                                  key={r.region}
                                  type="linear"
                                  dataKey={r.region}
                                  stroke={color}
                                  strokeWidth={3}
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5 }}
                                />
                              );
                            })
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {chartExplanations.regional.dynamicInsight && !drillStates.regional && (
                    <div className="card-insight">
                      <Zap size={14} className="text-amber" />
                      <div dangerouslySetInnerHTML={{ __html: chartExplanations.regional.dynamicInsight(filteredTrendData).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  )}
                </div>

                {/* Card Resizers */}
                <div className="resizer t" onMouseDown={(e) => handleTrendResizeStart(e, 't', 'regional')}></div>
                <div className="resizer b" onMouseDown={(e) => handleTrendResizeStart(e, 'b', 'regional')}></div>
              </div>
            </div>
          )}
          {/* FULL WIDTH ROW: Batch Performance */}
          {['Descriptive', 'Warehouse Operations'].includes(activeView) && (
            <div className="card-container" style={{ position: 'relative', marginTop: '32px' }}>
              <div
                className={`card resizable-card ${isTrendResizing?.startsWith('batch') ? 'resizing' : ''}`}
                style={{ height: batchCardSize.height }}
                onClick={(e) => handleInteraction(e, chartExplanations.batch)}
                onContextMenu={(e) => handleInteraction(e, chartExplanations.batch)}
              >
                <div className="card-header">
                  <h3 className="card-title"><Layers size={18} /> Batch Performance</h3>
                  <div className="card-info-icon"><Zap size={14} /></div>
                </div>
                <div className="card-body" style={{ flex: 1, padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                  <div style={{ height: 'calc(100% - 40px)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <Treemap
                        data={batchData}
                        dataKey="value"
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomTreemapContent />}
                        onClick={() => { }}
                      />
                    </ResponsiveContainer>
                  </div>
                  {chartExplanations.batch.dynamicInsight && (
                    <div className="card-insight">
                      <Zap size={14} className="text-amber" />
                      <div dangerouslySetInnerHTML={{ __html: chartExplanations.batch.dynamicInsight(chartExplanations.batch.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  )}
                </div>

                {/* Card Resizers */}
                <div className="resizer t" onMouseDown={(e) => handleTrendResizeStart(e, 't', 'batch')}></div>
                <div className="resizer b" onMouseDown={(e) => handleTrendResizeStart(e, 'b', 'batch')}></div>
              </div>
            </div>
          )}

          {/* FULL WIDTH ROW: Warehouse Intensity */}
          {['Descriptive', 'Warehouse Operations'].includes(activeView) && (
            <div className="card-container" style={{ position: 'relative', marginTop: '32px' }}>
              <div
                className={`card resizable-card ${isTrendResizing?.startsWith('warehouse') ? 'resizing' : ''}`}
                style={{ height: warehouseIntensityCardSize.height }}
                onClick={(e) => handleInteraction(e, chartExplanations.warehouse)}
                onContextMenu={(e) => handleInteraction(e, chartExplanations.warehouse)}
              >
                <div className="card-header">
                  <h3 className="card-title"><Warehouse size={18} /> {t.warehouseOperations}</h3>
                  <div className="card-info-icon"><Zap size={14} /></div>
                </div>
                <div className="card-body" style={{ flex: 1, padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                  <div style={{ height: 'calc(100% - 40px)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 100, right: 50, bottom: 20, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="category" dataKey="warehouse" name="Warehouse" tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                        <YAxis type="number" dataKey="volume" name="Volume" tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} domain={[0, 'dataMax + 10000']} />
                        <ZAxis
                          type="number"
                          dataKey="orders"
                          range={[400, 4000]}
                          domain={[0, 'auto']}
                          name="Orders"
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="premium-tooltip" style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                  <div style={{ fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>{data.warehouse} Warehouse</div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>Volume: <strong style={{ color: '#1e293b' }}>{data.volume.toLocaleString()}</strong></div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>Orders: <strong style={{ color: '#1e293b' }}>{data.orders.toLocaleString()}</strong></div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Transaction Intensity" data={warehouseVolume} fill="#DC2626" shape="circle" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  {chartExplanations.warehouse.dynamicInsight && (
                    <div className="card-insight">
                      <Zap size={14} className="text-amber" />
                      <div dangerouslySetInnerHTML={{ __html: chartExplanations.warehouse.dynamicInsight(chartExplanations.warehouse.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  )}
                </div>

                {/* Card Resizers */}
                <div className="resizer t" onMouseDown={(e) => handleTrendResizeStart(e, 't', 'warehouse')}></div>
                <div className="resizer b" onMouseDown={(e) => handleTrendResizeStart(e, 'b', 'warehouse')}></div>
              </div>
            </div>
          )}
          {/* ROW: Distributions & Contributions */}
          {['Descriptive', 'Regional Performance', 'ML Predictions'].includes(activeView) && (
            <div className="card-container" style={{ marginTop: '32px' }}>
              <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.product_contribution)} onContextMenu={(e) => handleInteraction(e, chartExplanations.product_contribution)}>
                <div className="card-header">
                  <h3 className="card-title">
                    <PieChartIcon size={18} /> Product Revenue Contribution
                  </h3>
                  <div className="card-info-icon"><Zap size={14} /></div>
                </div>
                <div className="card-body" style={{ height: 'auto', padding: '30px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                  <div className="grid-2" style={{ gap: '40px', alignItems: 'center' }}>
                    <div style={{ height: '350px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={productContribution}
                            innerRadius={0}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                          >
                            {productContribution.map((e, i) => (
                              <Cell key={i} fill={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => typeof value === 'number' ? `${value.toLocaleString()}%` : value} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }} className="custom-scrollbar">
                      <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '12px 8px', fontSize: '12px', color: 'var(--text2)' }}>Product Portfolio</th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', color: 'var(--text2)', textAlign: 'right' }}>Revenue Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productContribution.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="hover-highlight">
                              <td style={{ padding: '12px 8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '3px',
                                  backgroundColor: DASHBOARD_COLORS[i % DASHBOARD_COLORS.length],
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}></div>
                                <span style={{ fontWeight: '500' }}>{item.name}</span>
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '13px', textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>
                                {item.value}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {chartExplanations.product_contribution.dynamicInsight && (
                    <div className="card-insight" style={{ marginTop: '24px' }}>
                      <Zap size={14} className="text-amber" />
                      <div dangerouslySetInnerHTML={{ __html: chartExplanations.product_contribution.dynamicInsight(chartExplanations.product_contribution.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FULL WIDTH ROW: Revenue Trend Over Time */}
          {['Descriptive', 'Sales Panel'].includes(activeView) && (
            <div className="card-container" style={{ position: 'relative', marginTop: '32px' }}>
              <div
                className={`card resizable-card ${isTrendResizing?.startsWith('revenue') ? 'resizing' : ''}`}
                style={{ height: revenueTrendCardSize.height }}
                onClick={(e) => handleInteraction(e, chartExplanations.revenue_trend)}
                onContextMenu={(e) => handleInteraction(e, chartExplanations.revenue_trend)}
              >
                <div className="card-header">
                  <h3 className="card-title"><TrendingUp size={18} /> {t.regionalSales}</h3>

                  <div className="filter-group" onClick={e => e.stopPropagation()}>
                    <select
                      className="premium-select"
                      value={selectedRevenueMonth}
                      onChange={(e) => setSelectedRevenueMonth(e.target.value)}
                    >
                      {availableRevenueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="card-body" style={{ flex: 1, padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                  <div style={{ height: 'calc(100% - 40px)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredRevenueData}>
                        <defs>
                          <linearGradient id="gradRev2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                        <YAxis hide />
                        <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                        <Area type="linear" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#gradRev2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {chartExplanations.revenue_trend.dynamicInsight && (
                    <div className="card-insight">
                      <Zap size={14} className="text-amber" />
                      <div dangerouslySetInnerHTML={{ __html: chartExplanations.revenue_trend.dynamicInsight(filteredRevenueData).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  )}
                </div>

                {/* Card Resizers */}
                <div className="resizer t" onMouseDown={(e) => handleTrendResizeStart(e, 't', 'revenue')}></div>
                <div className="resizer b" onMouseDown={(e) => handleTrendResizeStart(e, 'b', 'revenue')}></div>
              </div>
            </div>
          )}
          {/* ROW: Breakdowns */}
          {['Descriptive', 'Sales Panel'].includes(activeView) && (
            <div className="grid-2">
              <div className="card-container">
                <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.top_products)} onContextMenu={(e) => handleInteraction(e, chartExplanations.top_products)}>
                  <div className="card-header">
                    <h3 className="card-title"><BarChart3 size={18} /> {t.topProducts}</h3>
                    <div className="card-info-icon"><Zap size={14} /></div>
                  </div>
                  <div className="card-body" style={{ height: 'auto', padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--text2)' }} width={80} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                          <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                          <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {chartExplanations.top_products.dynamicInsight && (
                      <div className="card-insight">
                        <Zap size={14} className="text-amber" />
                        <div dangerouslySetInnerHTML={{ __html: chartExplanations.top_products.dynamicInsight(chartExplanations.top_products.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-container">
                <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.revenue_type)} onContextMenu={(e) => handleInteraction(e, chartExplanations.revenue_type)}>
                  <div className="card-header">
                    <h3 className="card-title"><Layers size={18} /> Revenue by Transaction Type</h3>
                    <div className="card-info-icon"><Zap size={14} /></div>
                  </div>
                  <div className="card-body" style={{ height: 'auto', padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueByType}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="type" tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                          <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                          <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {chartExplanations.revenue_type.dynamicInsight && (
                      <div className="card-insight">
                        <Zap size={14} className="text-amber" />
                        <div dangerouslySetInnerHTML={{ __html: chartExplanations.revenue_type.dynamicInsight(chartExplanations.revenue_type.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          )}
          {/* ROW: Geographic and Storage */}
          {['Descriptive', 'Regional Performance', 'Warehouse Operations'].includes(activeView) && (
            <div className="grid-2">
              <div className="card-container">
                <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.revenue_region)} onContextMenu={(e) => handleInteraction(e, chartExplanations.revenue_region)}>
                  <div className="card-header">
                    <h3 className="card-title">
                      {drillStates.revenue_region ? (
                        <div className="drill-breadcrumb">
                          <button className="drill-back-btn" onClick={(e) => { e.stopPropagation(); resetDrill('revenue_region'); }}><ArrowLeft size={14} /></button>
                          <span>{drillStates.revenue_region.parentTitle}</span>
                          <ChevronRight size={12} className="text-gray-400" />
                          <span className="text-blue">{drillStates.revenue_region.filterValue}</span>
                        </div>
                      ) : (
                        <><MapPin size={18} /> Revenue by Region</>
                      )}
                    </h3>
                    {!drillStates.revenue_region && <div className="card-info-icon"><Zap size={14} /></div>}
                  </div>
                  <div className="card-body" style={{ height: 'auto', padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={drillStates.revenue_region ? getDrilledData('revenue_region', drillStates.revenue_region.filterValue) : regionalRevenue}
                          onClick={(dp) => !drillStates.revenue_region && handleDrill('revenue_region', dp)}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey={drillStates.revenue_region ? "name" : "region"} tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                          <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                          <Bar dataKey={drillStates.revenue_region ? "value" : "revenue"} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {chartExplanations.revenue_region.dynamicInsight && (
                      <div className="card-insight">
                        <Zap size={14} className="text-amber" />
                        <div dangerouslySetInnerHTML={{ __html: chartExplanations.revenue_region.dynamicInsight(chartExplanations.revenue_region.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-container">
                <div className="card interactable" onClick={(e) => handleInteraction(e, chartExplanations.warehouse_sales)} onContextMenu={(e) => handleInteraction(e, chartExplanations.warehouse_sales)}>
                  <div className="card-header">
                    <h3 className="card-title">
                      {drillStates.warehouse_sales ? (
                        <div className="drill-breadcrumb">
                          <button className="drill-back-btn" onClick={(e) => { e.stopPropagation(); resetDrill('warehouse_sales'); }}><ArrowLeft size={14} /></button>
                          <span>{drillStates.warehouse_sales.parentTitle}</span>
                          <ChevronRight size={12} className="text-gray-400" />
                          <span className="text-blue">{drillStates.warehouse_sales.filterValue}</span>
                        </div>
                      ) : (
                        <><Warehouse size={18} /> Warehouse Sales Performance</>
                      )}
                    </h3>
                    {!drillStates.warehouse_sales && <div className="card-info-icon"><Zap size={14} /></div>}
                  </div>
                  <div className="card-body" style={{ height: 'auto', padding: '20px' }} onClick={e => e.stopPropagation()} onContextMenu={e => e.stopPropagation()}>
                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={drillStates.warehouse_sales ? getDrilledData('warehouse_sales', drillStates.warehouse_sales.filterValue) : warehouseData}
                          onClick={(dp) => !drillStates.warehouse_sales && handleDrill('warehouse_sales', dp)}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey={drillStates.warehouse_sales ? "name" : "warehouse"} tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                          <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                          <Bar dataKey={drillStates.warehouse_sales ? "revenue" : "sales"} fill="#0d9488" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {chartExplanations.warehouse_sales.dynamicInsight && (
                      <div className="card-insight">
                        <Zap size={14} className="text-amber" />
                        <div dangerouslySetInnerHTML={{ __html: chartExplanations.warehouse_sales.dynamicInsight(chartExplanations.warehouse_sales.data).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div> {/* analysis-grid */}
      </div> {/* descriptive-page */}
      <ChartModal chart={selectedChart} onClose={() => setSelectedChart(null)} onShowInSidebar={handleShowInSidebar} language={language} />
      <ChartInteractionMenu
        chartInfo={pendingInteraction}
        onClose={() => setPendingInteraction(null)}
        onShowModal={(c) => { setSelectedChart(c); setPendingInteraction(null); }}
        onAskCopilot={handleShowInSidebar}
      />
    </>
  );

  return (
    <div id="root" className={`theme-${theme}`}>
      <Navbar
        toggleCopilot={() => setCopilotCollapsed(!copilotCollapsed)}
        copilotCollapsed={copilotCollapsed}
        activeView={activeView}
        onViewChange={setActiveView}
        onTableChange={setActiveDbTable}
        activeDbTable={activeDbTable}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        t={t}
        language={language}
        setLanguage={setLanguage}
        bannerText={bannerText}
        setBannerText={setBannerText}
      />
      {bannerText && bannerText.trim() !== '' && (
        <div style={{
          background: 'var(--surface2)',
          color: 'var(--primary)',
          textAlign: 'center',
          padding: '12px 24px',
          fontWeight: 800,
          fontSize: '18px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          {bannerText}
        </div>
      )}
      <div className="app-container">
        <main className="main-content">
          {activeView.startsWith("Predictive") || activeView === "ML Predictions" ? (
            <PredictiveAnalysis
              language={language}
              demandPred={demandPred}
              expiryRisk={expiryRisk}
              returnProb={returnProb}
              salesForecast={salesForecast}
              expiryMatchResults={expiryMatchResults}
              modelStatus={modelStatus}
              isLoading={predictiveLoading}
              onRefresh={fetchAllData}
              initialCard={
                activeView === "Predictive:Sales" ? "sales" :
                  activeView === "Predictive:Expiry" ? "expiry" :
                    activeView === "Predictive:Demand" ? "demand" :
                      activeView === "Predictive:Returns" ? "returns" :
                        activeView === "Predictive:Actions" ? "prescriptive" : null
              }
            />
          ) : activeView === "Model Details" ? (
            <ModelDetails />
          ) : activeView === "Ask Nexus" ? (
            <AskNexus
              messages={nexusMessages}
              chatInput={nexusChatInput}
              setChatInput={setNexusChatInput}
              handleSendMessage={(e, text) => handleSendMessage(e, null, false, text)}
              setExpandedChart={setExpandedChart}
              threads={threads}
              activeThreadId={activeThreadId}
              setActiveThreadId={loadThreadMessages}
              createNewThread={handleCreateNewThread}
              renameThread={renameThread}
              deleteThread={deleteThread}
              loadThreadMessages={loadThreadMessages}
              isLoading={isNexusLoading}
              onMinimize={() => {
                const thread = threads.find(t => t.id === activeThreadId);
                if (thread && thread.messages.length > 0) {
                  setCopilotMessages([...thread.messages]);
                }
                setActiveView('Descriptive');
                setCopilotCollapsed(false);
              }}
            />
          ) : ["Sales Panel", "Regional Performance", "Warehouse Operations", "Descriptive"].includes(activeView) ? renderDescriptiveAnalysis() : activeView === "Data Hub" ? (
            <section className="section-view">
              <div className="category-header" style={{ marginBottom: '12px' }}>
                <div className="heading-badge">“Š Live Database Explorer</div>
                <h1 className="category-title">Data Hub</h1>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '12px 24px', borderRadius: '12px 12px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text2)', fontWeight: '500', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue)' }}></div>
                      Schema: <strong style={{ color: 'var(--text)' }}>liveapp</strong>
                    </span>
                    <span style={{ color: 'var(--border)' }}>|</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--purple)' }}></div>
                      Table: <strong style={{ color: 'var(--text)' }}>{activeDbTable}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Rows per page:</span>
                    <select
                      value={dbRowsPerPage}
                      onChange={(e) => {
                        setDbRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                        setDbCurrentPage(1);
                      }}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', outline: 'none', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="All">All</option>
                    </select>
                  </div>
                </div>
                <div className="table-container" style={{ overflowX: 'auto', margin: 0, borderRadius: '0', border: '1px solid var(--border)', borderTop: '1px solid var(--border)', borderBottom: 'none', position: 'relative', minHeight: '300px' }}>
                  {isDbLoading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', opacity: 0.85, backdropFilter: 'blur(2px)', zIndex: 10 }}>
                      <Zap size={36} color="var(--blue)" className="pulse" style={{ animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                      <span style={{ marginTop: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--text)', letterSpacing: '0.5px' }}>Loading Records...</span>
                    </div>
                  )}
                  <table className="premium-table">
                    <thead><tr>{dbData[0] && Object.keys(dbData[0]).map(k => <th key={k}>{k.replace(/_/g, ' ').toUpperCase()}</th>)}</tr></thead>
                    <tbody>
                      {dbData.map((r, i) => (
                        <tr key={i}>{Object.entries(r).map(([k, v], j) => <td key={j} style={{ whiteSpace: k === 'messages' || k === 'question' || k === 'answer' ? 'normal' : 'nowrap', verticalAlign: 'top', maxWidth: k === 'answer' ? '400px' : 'auto' }}><div style={{ maxHeight: '150px', overflowY: 'auto' }}>{String(v)}</div></td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: 'var(--surface)', padding: '12px 24px', borderRadius: '0 0 12px 12px', border: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text3)' }}>
                      Page {dbCurrentPage} of {dbRowsPerPage === 'All' ? 1 : Math.max(1, Math.ceil(dbTotalRows / dbRowsPerPage))}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        disabled={dbCurrentPage === 1 || dbRowsPerPage === 'All'}
                        onClick={() => setDbCurrentPage(p => Math.max(1, p - 1))}
                        style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: dbCurrentPage === 1 || dbRowsPerPage === 'All' ? 'var(--surface)' : 'var(--surface2)', color: dbCurrentPage === 1 || dbRowsPerPage === 'All' ? 'var(--text3)' : 'var(--text)', cursor: dbCurrentPage === 1 || dbRowsPerPage === 'All' ? 'not-allowed' : 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
                      >Previous</button>
                      <button
                        disabled={dbRowsPerPage === 'All' || dbCurrentPage >= Math.ceil(dbTotalRows / dbRowsPerPage)}
                        onClick={() => setDbCurrentPage(p => p + 1)}
                        style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: (dbRowsPerPage === 'All' || dbCurrentPage >= Math.ceil(dbTotalRows / dbRowsPerPage)) ? 'var(--surface)' : 'var(--surface2)', color: (dbRowsPerPage === 'All' || dbCurrentPage >= Math.ceil(dbTotalRows / dbRowsPerPage)) ? 'var(--text3)' : 'var(--text)', cursor: (dbRowsPerPage === 'All' || dbCurrentPage >= Math.ceil(dbTotalRows / dbRowsPerPage)) ? 'not-allowed' : 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
                      >Next</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : activeView === "Settings" ? (
            <section className="section-view">
              <div className="category-header">
                <div className="heading-badge">⚙️ System Configuration</div>
                <h1 className="category-title">{t.settings}</h1>
                <p className="category-desc">Customize your dashboard experience, themes, and localization settings.</p>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title"><Zap size={18} /> {t.theme}</h3>
                  </div>
                  <div className="card-body" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button
                        className={`modal-btn ${theme === 'light' ? 'primary' : 'secondary'}`}
                        onClick={() => setTheme('light')}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {t.light}
                      </button>
                      <button
                        className={`modal-btn ${theme === 'dark' ? 'primary' : 'secondary'}`}
                        onClick={() => setTheme('dark')}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {t.dark}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title"><MapPin size={18} /> {t.language}</h3>
                  </div>
                  <div className="card-body" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button
                        className={`modal-btn ${language === 'en' ? 'primary' : 'secondary'}`}
                        onClick={() => setLanguage('en')}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {t.english}
                      </button>
                      <button
                        className={`modal-btn ${language === 'ar' ? 'primary' : 'secondary'}`}
                        onClick={() => setLanguage('ar')}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {t.arabic}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="p-12 text-center text-gray-500"><h2>{activeView} Analysis Module Initializing...</h2></div>
          )}
        </main>

        {/* Floating & Moveable AI Chatbot */}
        {!copilotCollapsed && (
          <div
            className={`copilot floating-window ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
            style={{
              position: 'fixed',
              left: copilotPos.x,
              top: copilotPos.y,
              width: copilotSize.width,
              height: copilotSize.height,
              zIndex: 9999,
              userSelect: isDragging || isResizing ? 'none' : 'auto'
            }}
          >
            <div className="copilot-header">
              <div
                className="move-handle"
                onMouseDown={handleDragStart}
                title="Click and drag to move"
              >
                <GripHorizontal size={20} />
              </div>

              <div className="copilot-header-left">
                <img src="/Images/chatbot_head.png" alt="Nexus" style={{ width: '22px', height: '22px' }} />
                <div className="header-text">
                  <span className="title">Konfig Nexus</span>
                </div>
              </div>
              <div className="status-indicator"></div>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  className="copilot-expand-btn"
                  onClick={() => {
                    if (copilotMessages.length > 1) {
                      const firstUserMsg = copilotMessages.find(m => m.role === 'user');
                      const title = firstUserMsg ? (firstUserMsg.text.length > 30 ? firstUserMsg.text.substring(0, 30) + '...' : firstUserMsg.text) : 'Copilot Session';
                      const newId = Date.now().toString();
                      setThreads(prev => [{
                        id: newId,
                        title: title,
                        messages: [...copilotMessages],
                        fromDb: false
                      }, ...prev]);
                      setActiveThreadId(newId);
                      setCopilotMessages([{ id: 1, role: "ai", text: "Welcome to Konfig Nexus AI! I am your primary analytical intelligence. You can ask me to deep-dive into any chart, summarize regional performance, or identify logistics bottlenecks." }]);
                    }
                    setActiveView('Ask Nexus');
                    setCopilotCollapsed(true);
                  }}
                  title="Expand to Full Page"
                >
                  <Maximize2 size={16} />
                </button>
                <button className="copilot-hide-btn" onClick={() => setCopilotCollapsed(true)} title="Close Chatbot">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="copilot-body premium-scroll">
              {copilotMessages.map((m) => (
                <ChatBubble key={m.id} message={m} onExpand={setExpandedChart} />
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="copilot-input-area">
              <div className="input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={(e) => handleSendMessage(e, null, true)}
                  disabled={copilotMessages.some(m => m.isTemp)}
                />
                <button className="send-btn" onClick={() => handleSendMessage({ key: 'Enter' }, null, true)}><ArrowRight size={18} /></button>
              </div>
            </div>

            {/* Resize Handles - All 4 Sides & Corners */}
            <div className="resizer r" onMouseDown={(e) => handleResizeStart(e, 'r')}></div>
            <div className="resizer l" onMouseDown={(e) => handleResizeStart(e, 'l')}></div>
            <div className="resizer t" onMouseDown={(e) => handleResizeStart(e, 't')}></div>
            <div className="resizer b" onMouseDown={(e) => handleResizeStart(e, 'b')}></div>
            <div className="resizer tr" onMouseDown={(e) => handleResizeStart(e, 'tr')}></div>
            <div className="resizer tl" onMouseDown={(e) => handleResizeStart(e, 'tl')}></div>
            <div className="resizer br" onMouseDown={(e) => handleResizeStart(e, 'br')}></div>
            <div className="resizer bl" onMouseDown={(e) => handleResizeStart(e, 'bl')}></div>
          </div>
        )}

        {/* Floating Action Button & Suggestion Bubble */}
        {activeView !== "Ask Nexus" && (
          <div className="copilot-fab-container">
            {copilotCollapsed && showSuggestion && (
              <div className="nexus-bubble" onClick={handleToggleCopilot}>
                <span className="close-icon" onClick={(e) => { e.stopPropagation(); setShowSuggestion(false); }}>✕</span>
                <div className="nexus-avatar-wrapper">
                  <img src="/Images/chatbot_head.png" alt="Nexus AI" className="nexus-avatar-sm" />
                </div>
                <div className="nexus-content-wrapper">
                  <h2 className="nexus-text-header">{t.nexusGreeting}</h2>
                  <p className="nexus-text-body">{t.nexusHelp}</p>
                </div>
              </div>
            )}
            <button
              className="copilot-fab"
              onClick={handleToggleCopilot}
              aria-label="Toggle Chatbot"
            >
              {!copilotCollapsed && (
                <img src="/Images/chatbot_open.png" alt="Close" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              )}
              {copilotCollapsed && (
                <img src="/Images/chatbot.png" alt="Chat" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              )}
            </button>
          </div>
        )}
      </div>
      {/* Expanded Chart Modal */}
      {expandedChart && (
        <div className="chart-expand-overlay" onClick={() => setExpandedChart(null)}>
          <div className="chart-expand-content" onClick={e => e.stopPropagation()}>
            <div className="chart-expand-header">
              <h3>{expandedChart.title}</h3>
              <button onClick={() => setExpandedChart(null)}><X size={24} /></button>
            </div>
            <div className="chart-expand-body">
              <ResponsiveContainer width="100%" height="100%">
                {expandedChart.type === 'bar' ? (
                  <BarChart data={expandedChart.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text3)' }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text3)' }}
                      tickFormatter={formatAxisValue}
                    />
                    <Tooltip
                      formatter={(value) => [new Intl.NumberFormat().format(value) + ' IQD', 'Amount']}
                    />
                    <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                ) : expandedChart.type === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={expandedChart.data}
                      cx="50%" cy="50%"
                      innerRadius={80} outerRadius={150}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expandedChart.data.map((entry, index) => (
                        <Cell key={index} fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [new Intl.NumberFormat().format(value) + ' IQD', 'Amount']}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                ) : (
                  <AreaChart data={expandedChart.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <defs>
                      <linearGradient id="modalColorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text3)' }}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text3)' }}
                      tickFormatter={formatAxisValue}
                    />
                    <Tooltip
                      formatter={(value) => [new Intl.NumberFormat().format(value) + ' IQD', 'Amount']}
                    />
                    <Area type="linear" dataKey="value" stroke="var(--blue)" strokeWidth={3} fill="url(#modalColorBlue)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
