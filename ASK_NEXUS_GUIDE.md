# Ask Nexus Implementation Guide

This guide provides the complete source code and integration steps for the "Ask Nexus" premium chatbot interface. It features a modern light theme, collapsible history sidebar, and a "floating" minimalist input design.

## 1. Prerequisites

Ensure you have the following dependencies installed in your React project:
```bash
npm install lucide-react recharts react-markdown remark-gfm
```

## 2. Recommended Folder Structure
```text
src/
  ├── components/
  │    ├── AskNexus.jsx      (Main Page)
  │    └── ChatBubble.jsx    (Message Component)
  ├── Images/
  │    ├── chatbot_head.png  (Small robot head)
  │    └── chatbot.png       (Floating icon)
  └── index.css              (Global styles & Variables)
```

## 3. CSS Foundation (index.css)

Add these design tokens to your `:root` or global CSS file to ensure consistent colors.

```css
:root {
    --primary: #ff7700;
    --primary-lt: #fff7ed;
    --primary-md: #ffedd5;
    --bg: #f0f2f4;
    --surface: #ffffff;
    --surface2: #f8fafc;
    --border: #e2e8f0;
    --text: #1e293b;
    --text2: #6d6e71;
    --text3: #94a3b8;
    --blue: #2563eb;
    --blue-lt: #eff6ff;
    --sh: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    --sh2: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

/* Helper class for full-screen integration */
.main-content.no-padding {
    padding: 0 !important;
    overflow: hidden !important;
}

/* Custom premium scrollbar */
.premium-scroll::-webkit-scrollbar {
    width: 6px;
}
.premium-scroll::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 10px;
}
```

## 4. Message Component (ChatBubble.jsx)

This component handles AI and User bubbles, markdown rendering, and interactive Recharts.

```javascript
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { BarChart2, Maximize2 } from 'lucide-react';

export const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f43f5e', '#a855f7'];

export const formatAxisValue = (val) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
    return val;
};

export const ChatBubble = React.memo(({ message, onExpand }) => {
    const isAI = message.role === 'ai';
    const text = message.text || '';
    
    // Logic to extract chart JSON from [CHART] tags
    const chartMatch = text.match(/\[CHART\]([\s\S]*?)\[\/CHART\]/);
    const cleanText = text.replace(/\[CHART\][\s\S]*?\[\/CHART\]/, '').trim();

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
                }
            }, speed);
            return () => clearInterval(timer);
        }
    }, [cleanText, isAI, message.isTemp, message.isNew]);

    const renderCharts = () => {
        if (!chartMatch || isTyping) return null;
        let chartData;
        try { chartData = JSON.parse(chartMatch[1]); } catch (e) { return null; }
        
        const { type, title, data } = chartData;
        const commonAxisStyle = { fontSize: '9px', fontWeight: '600', fill: 'var(--text3)' };

        return (
            <div className="chat-chart-container" style={{ marginTop: '15px' }}>
                <div className="chat-chart-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h5 className="chat-chart-title" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart2 size={13} /> {title}
                    </h5>
                    <button className="chart-expand-btn" onClick={() => onExpand(chartData)}>
                        <Maximize2 size={12} />
                    </button>
                </div>
                <div style={{ height: '200px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {type === 'bar' ? (
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" tick={commonAxisStyle} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                                <YAxis tick={commonAxisStyle} axisLine={false} tickLine={false} tickFormatter={formatAxisValue} />
                                <Tooltip formatter={(value) => [new Intl.NumberFormat().format(value), 'Amount']} />
                                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        ) : type === 'pie' ? (
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                                    {data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" />
                            </PieChart>
                        ) : (
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                                <XAxis dataKey="name" tick={commonAxisStyle} />
                                <YAxis tick={commonAxisStyle} tickFormatter={formatAxisValue} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="var(--blue)" fillOpacity={0.1} />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className={`bubble-container ${isAI ? 'ai' : 'user'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end', width: '100%', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: '85%' }}>
                {isAI && (
                    <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                        <img src="/Images/chatbot_head.png" alt="AI" style={{ width: '100%' }} />
                    </div>
                )}
                <div className={`bubble ${isAI ? 'bubble-ai' : 'bubble-user'}`} style={{ 
                    padding: '14px 18px', borderRadius: '18px', fontSize: '14px', lineHeight: '1.5',
                    background: isAI ? '#f1f5f9' : 'var(--primary)',
                    color: isAI ? '#1e293b' : '#fff'
                }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText}</ReactMarkdown>
                    {renderCharts()}
                </div>
            </div>
        </div>
    );
});
```

## 5. Main Component (AskNexus.jsx)

This is the full page layout with the collapsible sidebar and landing/chat toggle.

```javascript
import React, { useRef, useEffect, useState } from 'react';
import { Send, ArrowRight, Plus, MessageSquare, PanelLeft, X, FileText, HelpCircle, BarChart3, Rocket, Activity, Shield } from 'lucide-react';
import { ChatBubble } from './ChatBubble';

const AskNexus = ({ messages, chatInput, setChatInput, handleSendMessage, setExpandedChart, threads, activeThreadId, setActiveThreadId, createNewThread }) => {
    const chatEndRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const isLanding = messages.length <= 1;

    const row1Suggestions = [
        { label: 'Sales Insights', icon: BarChart3 },
        { label: 'Inventory Status', icon: Warehouse },
        { label: 'R&D Intelligence', icon: Activity },
    ];
    const row2Suggestions = [
        { label: 'Regulatory Alerts', icon: Shield },
        { label: 'Forecast & Strategy', icon: TrendingUp },
    ];

    const handleChipClick = (label) => {
        handleSendMessage({ key: 'Enter' }, label);
    };

    return (
        <div className="nexus-layout">
            <style jsx>{`
                .nexus-layout { display: flex; height: 100%; width: 100%; background: #f0f2f4; overflow: hidden; }
                .nexus-sidebar { width: 280px; background: #f8fafc; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; transition: all 0.3s ease; position: relative; }
                .nexus-sidebar.closed { width: 0; opacity: 0; transform: translateX(-100%); }
                .sidebar-toggle-btn.open { position: absolute; left: 20px; top: 10px; z-index: 30; background: #fff; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: var(--sh); cursor: pointer; }
                .chat-container { flex: 1; display: flex; flex-direction: column; overflow: hidden; width: 100%; }
                .chat-messages { flex: 1; padding: 40px 20px; overflow-y: auto; display: flex; flex-direction: column; align-items: center; gap: 32px; }
                .chat-messages > :global(div) { width: 100%; max-width: 900px; }
                .suggestion-chips-container { display: flex; flex-direction: column; gap: 16px; width: 100%; margin: 32px 0; }
                .suggestion-chips { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
                .chip { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; padding: 10px 24px; border-radius: 20px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.3s ease; }
                .chip:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; transform: translateY(-1px); }
                .search-bar { width: 100%; max-width: 900px; background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 4px 6px 4px 14px; display: flex; align-items: center; gap: 12px; }
                .search-bar input { flex: 1; background: transparent; border: none; outline: none; padding: 10px 0; font-size: 14px; }
                .send-btn-round { width: 44px; height: 44px; background: #4f46e5; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
            `}</style>

            {!isSidebarOpen && (
                <button className="sidebar-toggle-btn open" onClick={() => setIsSidebarOpen(true)}>
                    <PanelLeft size={20} />
                </button>
            )}

            <aside className={`nexus-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                {/* Sidebar Header & Conversation List */}
                <div style={{ padding: '24px 16px' }}>
                    <button className="new-chat-btn" onClick={createNewThread} style={{ width: '100%', padding: '12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                        <Plus size={18} /> New Conversation
                    </button>
                </div>
                <div className="sidebar-scroll premium-scroll" style={{ flex: 1, padding: '0 12px' }}>
                    {threads.map(t => (
                        <div key={t.id} onClick={() => setActiveThreadId(t.id)} style={{ padding: '10px 16px', borderRadius: '20px', cursor: 'pointer', background: activeThreadId === t.id ? '#eef2ff' : 'transparent', color: activeThreadId === t.id ? '#4f46e5' : '#475569', marginBottom: '4px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MessageSquare size={14} /> {t.title}
                        </div>
                    ))}
                </div>
                <button style={{ margin: '16px', border: 'none', background: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setIsSidebarOpen(false)}>
                    <X size={18} /> Close History
                </button>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div className="chat-container">
                    <div className="chat-messages premium-scroll">
                        {messages.map((m) => <ChatBubble key={m.id} message={m} onExpand={setExpandedChart} />)}
                        <div ref={chatEndRef} />
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div className="search-bar">
                            <input type="text" placeholder="Message Nexus..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleSendMessage} />
                            <div className="send-btn-round" onClick={() => handleSendMessage({ key: 'Enter' })}>
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AskNexus;
```

## 6. Dashboard Integration (App.jsx)

To make it fit perfectly without scrollbars, you need to handle the main area padding and layout height.

```javascript
// Inside App.jsx
const [activeView, setActiveView] = useState("Dashboard");

return (
  <div id="root">
    <Navbar activeView={activeView} onViewChange={setActiveView} />
    <div className="app-container">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      {/* Conditionally apply 'no-padding' for the chatbot to fill the screen */}
      <main className={`main-content ${activeView === "Ask Nexus" ? "no-padding" : ""}`}>
        {activeView === "Ask Nexus" ? (
          <AskNexus 
            messages={nexusMessages}
            // ... props
          />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
    
    {/* Option to hide the floating FAB when already in full chat view */}
    {activeView !== "Ask Nexus" && (
        <div className="copilot-fab">
            <img src="/Images/chatbot.png" />
        </div>
    )}
  </div>
);
```

## 7. Responsive & Animations

The layout uses `flexbox` to ensure the input bar stays sticky at the bottom while the message list fills the remaining space.
- **Fade In**: `animation: fadeIn 0.8s ease-out` on the landing page.
- **Slide Sidebar**: `transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)` for the history drawer.
- **Glassmorphism**: Use `backdrop-filter: blur(12px)` for premium suggestion chips.

---
*Created by Antigravity AI for Pioneer Nexus Dashboard.*
