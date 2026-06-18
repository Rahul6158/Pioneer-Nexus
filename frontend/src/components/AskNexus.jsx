import React, { useRef, useEffect, useState } from 'react';
import { Send, ArrowRight, Zap, History, Plus, MessageSquare, Search, Box, Cpu, Settings, PanelLeft, X, FileText, HelpCircle, BarChart3, Rocket, Activity, Shield, TrendingUp, Warehouse, MoreVertical, Edit2, Trash2, Check, Minimize2 } from 'lucide-react';
import { ChatBubble } from './ChatBubble';

const AskNexus = ({
    messages,
    chatInput,
    setChatInput,
    handleSendMessage,
    setExpandedChart,
    threads,
    activeThreadId,
    setActiveThreadId,
    createNewThread,
    renameThread,
    deleteThread,
    onMinimize,
    loadThreadMessages,
    isLoading
}) => {
    const chatEndRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [optionsOpenId, setOptionsOpenId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    const loadingPhrases = [
        "Undulating... (thinking)",
        "Reconstructing Analytical Context...",
        "Synthesizing regional performance metrics...",
        "Identifying logistics bottlenecks...",
        "Processing inventory optimization rules...",
        "Synchronizing model neural state...",
        "Scanning for market anomalies...",
        "Predicting demand-match outcomes..."
    ];

    useEffect(() => {
        let interval;
        if (isLoading) {
            interval = setInterval(() => {
                setCurrentPhraseIndex(prev => (prev + 1) % loadingPhrases.length);
            }, 2000);
        } else {
            setCurrentPhraseIndex(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleChipClick = (label) => {
        handleSendMessage({ key: 'Enter' }, label);
    };

    const handleRenameSubmit = (id) => {
        if (editDraft.trim()) {
            renameThread(id, editDraft.trim());
        }
        setEditingId(null);
        setOptionsOpenId(null);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isLanding = messages.length === 0 || (messages.length === 1 && messages[0]?.role === 'ai' && messages[0]?.text?.includes("Welcome"));

    const row1Suggestions = [
        { label: 'Sales Insights', icon: BarChart3 },
        { label: 'Inventory Status', icon: Warehouse },
        { label: 'R&D Intelligence', icon: Activity },
    ];
    const row2Suggestions = [
        { label: 'Regulatory Alerts', icon: Shield },
        { label: 'Forecast & Strategy', icon: TrendingUp },
    ];

    return (
        <div className="nexus-layout">
            {/* Top Left Actions - Absolute to sit in parent padding area */}
            <div className="nexus-top-actions">
                <button className="action-icon-btn" onClick={createNewThread} title="New Chat">
                    <MessageSquare size={20} />
                    <span className="action-label">New Chat</span>
                </button>
                <button className="action-icon-btn" onClick={() => setIsSidebarOpen(true)} title="Chat History">
                    <History size={20} />
                    <span className="action-label">Chat History</span>
                </button>
                <button className="action-icon-btn" onClick={onMinimize} title="Minimize to Chatbot">
                    <Minimize2 size={20} />
                    <span className="action-label">Minimize</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="nexus-main">
                {isLoading ? (
                    <div className="nexus-loading-area">
                        <div className="nexus-spinner-container">
                            <div className="nexus-loading-spinner"></div>
                            <div className="nexus-spinner-inner"></div>
                            <img src="/Images/chatbot_head.png" alt="Nexus" className="spinner-center-logo" />
                        </div>
                        <div className="loading-text-glow">{loadingPhrases[currentPhraseIndex]}</div>
                        <p className="loading-subtext">Fetching historical database insights and model state</p>
                    </div>
                ) : isLanding ? (
                    <div className="landing-container">
                        <div className="landing-content">
                            <div className="nexus-logo-large">
                                <img src="/Images/chatbot_head.png" alt="Nexus" />
                                <span>KONFIG NEXUS</span>
                            </div>

                            <div className="nexus-search-wrapper">
                                <div className="search-bar">
                                    <input
                                        type="text"
                                        placeholder="Message Nexus..."
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={handleSendMessage}
                                        style={{ marginLeft: '12px' }}
                                    />
                                    <div className="search-actions">
                                        <div className="send-btn-round" onClick={e => handleSendMessage({ key: 'Enter', preventDefault: () => { } })}>
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="suggestion-chips-container">
                                    <div className="suggestion-chips">
                                        {row1Suggestions.map((chip, idx) => (
                                            <div key={idx} className="chip" onClick={() => handleChipClick(chip.label)}>
                                                <chip.icon size={14} />
                                                <span>{chip.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="suggestion-chips">
                                        {row2Suggestions.map((chip, idx) => (
                                            <div key={idx} className="chip" onClick={() => handleChipClick(chip.label)}>
                                                <chip.icon size={14} />
                                                <span>{chip.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="chat-container">
                        <div className="chat-messages premium-scroll">
                            {messages.map((m) => (
                                <ChatBubble key={m.id} message={m} onExpand={setExpandedChart} />
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="chat-input-sticky">
                            <div className="search-bar persistent">
                                <input
                                    type="text"
                                    placeholder="Message Nexus..."
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={handleSendMessage}
                                    style={{ marginLeft: '12px' }}
                                />
                                <div className="search-actions">
                                    <div className="send-btn-round" onClick={e => handleSendMessage({ key: 'Enter', preventDefault: () => { } })}>
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* History Sidebar (Right Side) */}
            <aside className={`nexus-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-header-top" style={{ justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Chat History</span>
                        <button className="sidebar-toggle-btn close" onClick={() => setIsSidebarOpen(false)} title="Close History">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="sidebar-scroll premium-scroll">
                    <div className="history-section">
                        {threads.map(thread => (
                            <div
                                key={thread.id}
                                className={`history-item ${activeThreadId === thread.id ? 'active' : ''}`}
                                onClick={() => loadThreadMessages(thread.id)}
                            >
                                <div className="item-content">
                                    <MessageSquare size={14} className="item-icon" />
                                    {editingId === thread.id ? (
                                        <div className="edit-wrapper" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                className="edit-input"
                                                value={editDraft}
                                                onChange={e => setEditDraft(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleRenameSubmit(thread.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                autoFocus
                                            />
                                            <button className="confirm-btn" onClick={() => handleRenameSubmit(thread.id)}>
                                                <Check size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="item-title">{thread.title}</span>
                                    )}
                                </div>
                                <div className="item-actions" onClick={e => e.stopPropagation()}>
                                    <button
                                        className="options-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOptionsOpenId(optionsOpenId === thread.id ? null : thread.id);
                                        }}
                                    >
                                        <MoreVertical size={14} />
                                    </button>

                                    {optionsOpenId === thread.id && (
                                        <div className="options-dropdown">
                                            <button className="dropdown-item" onClick={(e) => {
                                                e.stopPropagation();
                                                setEditDraft(thread.title);
                                                setEditingId(thread.id);
                                                setOptionsOpenId(null);
                                            }}>
                                                <Edit2 size={12} />
                                                <span>Rename</span>
                                            </button>
                                            <button className="dropdown-item delete" onClick={(e) => {
                                                e.stopPropagation();
                                                deleteThread(thread.id);
                                                setOptionsOpenId(null);
                                            }}>
                                                <Trash2 size={12} />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            <style jsx>{`
                .nexus-layout {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    background: var(--bg);
                    color: var(--text);
                    font-family: 'Inter', sans-serif;
                    overflow: visible;
                    position: relative;
                }

                /* Sidebar Styles */
                .nexus-sidebar {
                    width: 280px;
                    min-width: 280px;
                    flex-shrink: 0;
                    background: var(--surface);
                    border-left: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
                    position: relative;
                    z-index: 20;
                }
                .nexus-sidebar.closed {
                    width: 0;
                    min-width: 0;
                    opacity: 0;
                    transform: translateX(100%);
                    pointer-events: none;
                }
                .sidebar-header {
                    padding: 24px 16px;
                }
                .sidebar-header-top {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .sidebar-toggle-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    border-radius: 8px;
                }
                .sidebar-toggle-btn:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }
                .sidebar-toggle-btn.open {
                    position: absolute;
                    left: 20px;
                    top: 10px;
                    z-index: 30;
                    background: #ffffff;
                    padding: 10px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .new-chat-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    color: var(--text);
                    padding: 12px;
                    border-radius: 20px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: var(--sh);
                }
                .new-chat-btn:hover {
                    background: var(--surface);
                    border-color: var(--primary);
                    transform: translateY(-1px);
                }
                .sidebar-scroll {
                    flex: 1;
                    padding: 8px 12px;
                    overflow-y: auto;
                }
                .section-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    margin: 16px 8px 8px 8px;
                    font-weight: 700;
                }
                .history-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    border-radius: 12px;
                    cursor: pointer;
                    margin-bottom: 4px;
                    transition: all 0.2s ease;
                    color: var(--text2);
                    position: relative;
                }
                .history-item:hover {
                    background: var(--surface2);
                    color: var(--text);
                }
                .history-item.active {
                    background: var(--primary-lt);
                    color: var(--primary);
                    font-weight: 600;
                }
                .item-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                    min-width: 0;
                }
                .item-icon {
                    flex-shrink: 0;
                }
                .item-title {
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* Item Options */
                .options-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.2s ease;
                }
                .history-item:hover .options-btn,
                .options-btn:focus {
                    opacity: 1;
                }
                .options-btn:hover {
                    color: #1e293b;
                    background: #e2e8f0;
                }
                .options-dropdown {
                    position: absolute;
                    right: 8px;
                    top: 36px;
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    box-shadow: var(--sh2);
                    z-index: 50;
                    min-width: 120px;
                    overflow: hidden;
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px 12px;
                    border: none;
                    background: transparent;
                    color: #475569;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-align: left;
                }
                .dropdown-item:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .dropdown-item.delete {
                    color: #ef4444;
                }
                .dropdown-item.delete:hover {
                    background: #fef2f2;
                }

                /* Edit Input */
                .edit-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    flex: 1;
                    min-width: 0;
                }
                .edit-input {
                    flex: 1;
                    font-size: 13px;
                    padding: 4px 8px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    outline: none;
                    width: 100%;
                    min-width: 0;
                }
                .edit-input:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
                }
                .confirm-btn {
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .confirm-btn:hover {
                    background: #4338ca;
                }
                .sidebar-footer {
                    padding: 16px;
                    border-top: 1px solid #e2e8f0;
                }
                .footer-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #64748b;
                    font-size: 13px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .footer-item:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                /* Main Content */
                .nexus-main {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    background: var(--bg);
                    overflow: hidden;
                }

                /* Top Left Actions */
                .nexus-top-actions {
                    position: absolute;
                    top: -32px;
                    left: 0;
                    display: flex;
                    gap: 12px;
                    z-index: 50;
                    flex-shrink: 0;
                }
                .action-icon-btn {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    background: transparent;
                    border: none;
                    color: var(--text3);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 8px;
                    border-radius: 8px;
                }
                .action-icon-btn:hover {
                    color: var(--primary);
                    background: var(--surface2);
                }
                .action-label {
                    font-size: 11px;
                    font-weight: 600;
                }

                /* Landing Page */
                .landing-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding-bottom: 10vh;
                }
                .landing-content {
                    width: 100%;
                    max-width: 800px;
                    padding: 0 40px;
                    text-align: center;
                    animation: fadeIn 0.8s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .nexus-logo-large {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin-bottom: 48px;
                }
                .nexus-logo-large img {
                    width: 64px;
                    height: 64px;
                    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
                }
                .nexus-logo-large span {
                    font-size: 32px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--text);
                }

                /* Search Bar Styles */
                .nexus-search-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 32px;
                    width: 100%;
                }
                .search-bar {
                    width: 100%;
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 4px 6px 4px 14px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.2s ease;
                }
                .search-bar:focus-within {
                    border-color: var(--primary);
                    box-shadow: 0 15px 50px rgba(79, 70, 229, 0.1), 0 0 0 4px rgba(79, 70, 229, 0.05);
                }
                .search-bar input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--text);
                    font-size: 14px;
                    outline: none;
                    padding: 10px 0;
                    font-weight: 500;
                }
                .search-bar input::placeholder {
                    color: var(--text3);
                }
                .icon-left {
                    color: var(--text3);
                }
                .search-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .model-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text2);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .model-selector:hover {
                    background: var(--surface2);
                    color: var(--text);
                }
                .send-btn-round {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary);
                    color: #ffffff;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(255, 119, 0, 0.2);
                }
                .send-btn-round:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(255, 119, 0, 0.3);
                }

                .suggestion-chips-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                }
                .suggestion-chips {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    padding: 10px 24px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text2);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: var(--sh);
                }
                .chip:hover {
                    background: var(--surface2);
                    border-color: var(--primary-md);
                    color: var(--primary);
                    transform: translateY(-1px);
                }

                /* Chat Styles */
                .chat-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    max-width: 900px;
                    margin: 0 auto;
                    width: 100%;
                    min-width: 0;
                }
                .chat-messages {
                    flex: 1;
                    padding: 24px 20px 40px 20px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                .chat-messages :global(table) {
                    display: block;
                    overflow-x: auto;
                    max-width: 100%;
                }
                .chat-messages :global(.bubble-ai) {
                    max-width: 100%;
                    overflow-x: auto;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .chat-input-sticky {
                    padding: 24px;
                    background: transparent;
                    position: relative;
                    z-index: 10;
                }
                .search-bar.persistent {
                    margin-bottom: 12px;
                    box-shadow: var(--sh2);
                }

                /* Premium Scrollbar */
                .premium-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .premium-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .premium-scroll::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 10px;
                }
                .premium-scroll::-webkit-scrollbar-thumb:hover {
                    background: var(--text3);
                }

                /* Chat Bubble Theme Overrides */
                :global(.bubble-ai) {
                    background: var(--surface) !important;
                    color: var(--text) !important;
                    border: 1px solid var(--border) !important;
                }
                :global(.bubble-user) {
                    background: var(--primary) !important;
                    color: #ffffff !important;
                }

                /* Premium Loading Screen */
                .nexus-loading-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg);
                    animation: fadeIn 0.5s ease-out;
                }
                .nexus-spinner-container {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 32px;
                }
                .nexus-loading-spinner {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 3px solid transparent;
                    border-top-color: var(--primary);
                    border-left-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1.5s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
                }
                .nexus-spinner-inner {
                    position: absolute;
                    width: 75%;
                    height: 75%;
                    border: 2px solid transparent;
                    border-bottom-color: var(--blue);
                    border-right-color: var(--blue);
                    border-radius: 50%;
                    animation: spin-reverse 2s linear infinite;
                    opacity: 0.6;
                }
                .spinner-center-logo {
                    width: 48px;
                    height: 48px;
                    z-index: 2;
                    filter: drop-shadow(0 0 10px rgba(255, 119, 0, 0.3));
                    animation: pulse 2s ease-in-out infinite;
                }
                .loading-text-glow {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--text);
                    text-align: center;
                    letter-spacing: -0.01em;
                    text-shadow: 0 0 20px var(--primary-lt);
                    margin-bottom: 8px;
                }
                .loading-subtext {
                    font-size: 14px;
                    color: var(--text3);
                    font-weight: 500;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default AskNexus;
