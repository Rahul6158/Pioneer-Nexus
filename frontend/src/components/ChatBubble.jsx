import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { BarChart2, Maximize2, Zap, Clock, Cpu, DollarSign, Activity, Terminal } from 'lucide-react';

export const DASHBOARD_COLORS = [
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

export const formatAxisValue = (val) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
    return val;
};

export const ChatBubble = React.memo(({ message, onExpand }) => {
    const isAI = message.role === 'ai';
    const text = message.text || '';
    
    const chartMatch = text.match(/\[CHART\]([\s\S]*?)(?:\[\/CHART\]|$)/);
    const cleanText = text.replace(/\[CHART\][\s\S]*?(?:\[\/CHART\]|$)/g, '').trim();

    const [isMetricsCollapsed, setIsMetricsCollapsed] = useState(true);
    const [showMetricDetail, setShowMetricDetail] = useState(null);
    const [displayedText, setDisplayedText] = useState(() => {
        if (!isAI || message.isTemp || !message.isNew) return cleanText || text;
        return "";
    });
    const [isTyping, setIsTyping] = useState(isAI && !message.isTemp && !!message.isNew);

    useEffect(() => {
        if (isAI && !message.isTemp && message.isNew && cleanText && displayedText === "") {
            let i = 0;
            const speed = 5;
            const timer = setInterval(() => {
                if (i < cleanText.length) {
                    setDisplayedText(cleanText.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(timer);
                    setIsTyping(false);
                    if (message.onComplete) message.onComplete();
                }
            }, speed);
            return () => clearInterval(timer);
        }
    }, [cleanText, isAI, message.isTemp, message.isNew]);

    const metricExplanations = {
        latency: {
            title: "Latency Calculation",
            desc: "Latency measures the total round-trip time from the moment you send a message until the AI finishes its response. This includes time spent fetching database context and the model's processing time. Calculated using high-precision timers in our backend engine.",
            icon: <Clock size={16} />
        },
        tokens: {
            title: "Token Analysis (In vs Out)",
            desc: "Input tokens represent the 'Attention Context' — your query plus the massive amount of database insights and dashboard state we inject to make the AI smart. Output tokens reflect the 'Generation Effort' — the actual response produced. Monitoring this split helps balance analytical depth with response speed.",
            icon: <Cpu size={16} />
        },
        cost: {
            title: "Cost Allocation",
            desc: "This estimate is based on the Gemini 2.5 Flash pricing tier ($0.10/1M input, $0.40/1M output tokens). It tracks the specific cloud computing costs incurred by this single request for transparent resource management.",
            icon: <DollarSign size={16} />
        },
        requestId: {
            title: "System Trace ID",
            desc: "A unique fingerprint for this specific interaction. This UUID is used for internal logging and auditing. Sharing this ID with administrators allows them to trace the exact computational path of this request for debugging or verification.",
            icon: <Terminal size={16} />
        }
    };

    const renderCharts = () => {
        if (!chartMatch) return null;
        let chartData;
        try {
            chartData = JSON.parse(chartMatch[1]);
        } catch (e) {
            return null;
        }
        if (isTyping) return null;
        const { type, title, data } = chartData;

        const commonAxisStyle = {
            fontSize: '9px',
            fontWeight: '600',
            fill: 'var(--text3)'
        };

        return (
            <div className="chat-chart-container" style={{ animation: 'fadeUp 0.5s ease-out' }}>
                <div className="chat-chart-header">
                    <h5 className="chat-chart-title">
                        <BarChart2 size={13} />
                        {title}
                    </h5>
                    <button 
                        className="chart-expand-btn" 
                        onClick={() => onExpand(chartData)}
                        title="View Full Graph"
                    >
                        <Maximize2 size={12} />
                    </button>
                </div>
                <div style={{ height: '200px', width: '100%', marginTop: '10px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {type === 'bar' ? (
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={commonAxisStyle} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                />
                                <YAxis 
                                    tick={commonAxisStyle} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={formatAxisValue}
                                />
                                <Tooltip
                                    formatter={(value) => [new Intl.NumberFormat().format(value) + ' IQD', 'Amount']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--sh2)', fontSize: '11px', background: 'rgba(255,255,255,0.95)' }}
                                />
                                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        ) : type === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={index} fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     formatter={(value) => [new Intl.NumberFormat().format(value) + ' IQD', 'Amount']}
                                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--sh2)', fontSize: '11px' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            </PieChart>
                        ) : (
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="chatColorBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={commonAxisStyle} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    angle={-15}
                                    textAnchor="end"
                                />
                                <YAxis 
                                    tick={commonAxisStyle} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={formatAxisValue}
                                />
                                <Tooltip 
                                    formatter={(value) => [new Intl.NumberFormat().format(value) + ' IQD', 'Amount']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--sh2)', fontSize: '11px' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--blue)" strokeWidth={2} fill="url(#chatColorBlue)" />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className={`bubble-container ${isAI ? 'ai' : 'user'}`}>
            <div className="ai-message-row">
                {isAI && (
                    <div className="ai-icon-outside">
                        <img src="/Images/chatbot_head.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                )}
                <div className={`bubble ${isAI ? 'bubble-ai' : 'bubble-user'} ${message.isTemp ? 'loading' : ''}`}>
                    {message.isTemp ? (
                        <div className="dot-typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    ) : (
                        <div className="message-content">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({node, ...props}) => (
                                        <div className="table-container">
                                            <table {...props} />
                                        </div>
                                    )
                                }}
                            >
                                {displayedText}
                            </ReactMarkdown>
                            {renderCharts()}

                            {/* Usage Metrics Section */}
                            {isAI && message.usage && !isTyping && (
                                <div className={`usage-metrics-container ${!isMetricsCollapsed ? 'expanded' : ''}`}>
                                    <div 
                                        className="metrics-collapsible-header" 
                                        onClick={() => setIsMetricsCollapsed(!isMetricsCollapsed)}
                                    >
                                        <div className="usage-title">
                                            <Activity size={10} className="text-primary" />
                                            <span>AI Performance Trace</span>
                                        </div>
                                        <div className="metrics-summary-badges">
                                            <div className="model-badge mini">
                                                <Terminal size={9} />
                                                <span>{message.usage.model || 'Gemini 2.5 Flash'}</span>
                                            </div>
                                            <div className={`chevron-icon ${isMetricsCollapsed ? '' : 'expanded'}`}>
                                                <Maximize2 size={10} />
                                            </div>
                                        </div>
                                    </div>

                                    {!isMetricsCollapsed && (
                                        <div className="metrics-content-wrapper fade-up">
                                            <div className="metrics-grid">
                                                <div 
                                                    className={`metric-item clickable ${showMetricDetail === 'latency' ? 'active' : ''}`} 
                                                    onClick={() => setShowMetricDetail(showMetricDetail === 'latency' ? null : 'latency')}
                                                >
                                                    <Clock size={12} className="metric-icon latency" />
                                                    <div className="metric-info">
                                                        <span className="metric-value">{message.usage.latency_ms}ms</span>
                                                        <span className="metric-label">Latency</span>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={`metric-item clickable ${showMetricDetail === 'tokens' ? 'active' : ''}`}
                                                    onClick={() => setShowMetricDetail(showMetricDetail === 'tokens' ? null : 'tokens')}
                                                >
                                                    <Cpu size={12} className="metric-icon tokens" />
                                                    <div className="metric-info">
                                                        <div className="token-breakdown-badges">
                                                            <span className="token-badge-in">
                                                                <span className="badge-lbl">IN</span>
                                                                {message.usage.prompt_tokens}
                                                            </span>
                                                            <div className="token-v-divider"></div>
                                                            <span className="token-badge-out">
                                                                <span className="badge-lbl">OUT</span>
                                                                {message.usage.output_tokens}
                                                            </span>
                                                        </div>
                                                        <span className="metric-label">Token Breakdown</span>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={`metric-item clickable ${showMetricDetail === 'cost' ? 'active' : ''}`}
                                                    onClick={() => setShowMetricDetail(showMetricDetail === 'cost' ? null : 'cost')}
                                                >
                                                    <DollarSign size={12} className="metric-icon cost" />
                                                    <div className="metric-info">
                                                        <span className="metric-value">${message.usage.cost_usd.toFixed(6)}</span>
                                                        <span className="metric-label">Est. Cost</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metric Detail Popover */}
                                            {showMetricDetail && (
                                                <div className="metric-detail-popover">
                                                    <div className="detail-header">
                                                        <div className="detail-icon">{metricExplanations[showMetricDetail].icon}</div>
                                                        <span className="detail-title">{metricExplanations[showMetricDetail].title}</span>
                                                    </div>
                                                    <p className="detail-desc">{metricExplanations[showMetricDetail].desc}</p>
                                                </div>
                                            )}

                                            <div 
                                                className="request-id clickable" 
                                                onClick={() => setShowMetricDetail(showMetricDetail === 'requestId' ? null : 'requestId')}
                                            >
                                                Request ID: {message.usage.request_id.split('-')[0]}...
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                .bubble.loading {
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    padding: 12px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 60px;
                    height: 38px;
                    box-shadow: var(--sh);
                    animation: pulse-border 2s infinite ease-in-out;
                }
                .dot-typing {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .dot-typing span {
                    width: 6px;
                    height: 6px;
                    background: var(--primary);
                    border-radius: 50%;
                    display: inline-block;
                    animation: dot-elastic 1.4s infinite ease-in-out;
                }
                .dot-typing span:nth-child(2) {
                    animation-delay: 0.2s;
                    opacity: 0.7;
                }
                .dot-typing span:nth-child(3) {
                    animation-delay: 0.4s;
                    opacity: 0.4;
                }

                @keyframes dot-elastic {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.4); opacity: 1; }
                }
                @keyframes pulse-border {
                    0% { border-color: var(--border); }
                    50% { border-color: var(--primary-lt); }
                    100% { border-color: var(--border); }
                }
            `}</style>
            <style jsx>{`
                .usage-metrics-container {
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px dashed var(--border);
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    transition: all 0.3s ease;
                }
                .metrics-collapsible-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: background 0.2s ease;
                }
                .metrics-collapsible-header:hover {
                    background: var(--surface2);
                }
                .metrics-summary-badges {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .usage-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text3);
                }
                .model-badge.mini {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: var(--surface2);
                    padding: 2px 8px;
                    border-radius: 100px;
                    font-size: 9px;
                    font-weight: 600;
                    color: var(--text2);
                    border: 1px solid var(--border);
                }
                .chevron-icon {
                    color: var(--text2);
                    transition: transform 0.3s ease;
                }
                .chevron-icon.expanded {
                    transform: rotate(180deg);
                    color: var(--primary);
                }
                .metrics-content-wrapper {
                    margin-top: 15px;
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                .metric-item {
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    padding: 10px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .metric-item.clickable {
                    cursor: pointer;
                }
                .metric-item.clickable:hover {
                    background: var(--surface);
                    transform: translateY(-2px);
                    box-shadow: var(--sh);
                    border-color: var(--primary-md);
                }
                .metric-item.active {
                    background: var(--surface);
                    border-color: var(--primary);
                    box-shadow: 0 0 0 1px var(--primary), var(--sh2);
                }
                .metric-icon {
                    flex-shrink: 0;
                }
                .metric-icon.latency { color: var(--amber); }
                .metric-icon.tokens { color: var(--blue); }
                .metric-icon.cost { color: var(--green); }
                
                .metric-info {
                    display: flex;
                    flex-direction: column;
                }
                .metric-value {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text);
                }
                .metric-label {
                    font-size: 9px;
                    font-weight: 600;
                    color: var(--text3);
                }
 
                .token-breakdown-badges {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 2px;
                }
                .token-badge-in, .token-badge-out {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: -0.2px;
                }
                .token-badge-in { color: var(--blue); }
                .token-badge-out { color: var(--purple); }
                
                .badge-lbl {
                    font-size: 8px;
                    font-weight: 900;
                    opacity: 0.6;
                    background: var(--primary-lt);
                    padding: 1px 4px;
                    border-radius: 4px;
                }
                .token-v-divider {
                    width: 1px;
                    height: 12px;
                    background: var(--border);
                }
 
                /* Metric Detail Popover */
                .metric-detail-popover {
                    margin-top: 12px;
                    padding: 14px;
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    box-shadow: var(--sh2);
                    animation: slideUpFade 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .detail-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                .detail-icon {
                    color: var(--primary);
                    background: var(--primary-lt);
                    padding: 6px;
                    border-radius: 8px;
                    display: flex;
                }
                .detail-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text);
                }
                .detail-desc {
                    font-size: 12px;
                    line-height: 1.5;
                    color: var(--text2);
                    margin: 0;
                }
 
                .request-id {
                    margin-top: 10px;
                    font-size: 8px;
                    color: var(--text3);
                    text-align: right;
                    transition: color 0.2s ease;
                }
                .request-id.clickable {
                    cursor: pointer;
                }
                .request-id:hover {
                    color: var(--text2);
                }
 
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
});
