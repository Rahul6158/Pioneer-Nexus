import React, { useState } from 'react';
import { LayoutDashboard, Package, Truck, BarChart3, BarChart2, Settings, HelpCircle, FileText, DollarSign, MapPin, Warehouse, Activity, ChevronDown, ChevronRight, BarChart, TrendingUp, MessageSquare } from 'lucide-react';

const Sidebar = ({ isCollapsed, activeView, onViewChange, t }) => {
    const [descriptiveOpen, setDescriptiveOpen] = useState(false);
    const [predictiveOpen, setPredictiveOpen] = useState(false);
    const [prescriptiveOpen, setPrescriptiveOpen] = useState(false);
    const mainItems = [
        { title: "Dashboard", icon: LayoutDashboard },
    ];

    const descriptiveItems = [
        { title: "Sales Panel", icon: DollarSign, key: 'salesPanel' },
        { title: "Regional Performance", icon: MapPin, key: 'regionalPerformance' },
        { title: "Warehouse Operations", icon: Warehouse, key: 'warehouseOperations' },
    ];

    const predictiveItems = [
        { title: "ML Predictions", icon: Activity, key: 'predictive' },
    ];

    const prescriptiveItems = [
    ];

    const bottomItems = [
        { title: "Data Hub", icon: FileText, key: 'databaseRecords' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-content">
                <div className="sidebar-group">
                    <div className="group-title">Main Menu</div>

                    {mainItems.map((item, idx) => (
                        <div
                            key={`main-${idx}`}
                            className={`sidebar-item ${activeView === item.title ? 'active' : ''}`}
                            onClick={() => onViewChange(item.title)}
                        >
                            <item.icon className="sidebar-icon" size={20} />
                            <span>{t[item.title.toLowerCase()] || item.title}</span>
                        </div>
                    ))}

                    <div
                        className={`sidebar-item ${(descriptiveItems.some(i => i.title === activeView) || activeView === "Descriptive") ? 'active' : ''}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewChange("Descriptive");
                            }}
                        >
                            <BarChart className="sidebar-icon" size={20} />
                            <span>{t.descriptive}</span>
                        </div>
                        {!isCollapsed && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDescriptiveOpen(!descriptiveOpen);
                                }}
                                style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', margin: '-0.5rem', cursor: 'pointer' }}
                            >
                                {descriptiveOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                        )}
                    </div>

                    {!isCollapsed && descriptiveOpen && (
                        <div className="sidebar-submenu" style={{ marginLeft: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                            {descriptiveItems.map((item, idx) => (
                                <div
                                    key={`desc-${idx}`}
                                    className={`sidebar-item submenu-item ${activeView === item.title ? 'active' : ''}`}
                                    onClick={() => onViewChange(item.title)}
                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9em', minHeight: 'auto' }}
                                >
                                    <item.icon className="sidebar-icon" size={16} />
                                    <span>{t[item.key] || item.title}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        className={`sidebar-item ${(predictiveItems.some(i => i.title === activeView) || activeView === "Predictive") ? 'active' : ''}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewChange("Predictive");
                            }}
                        >
                            <Activity className="sidebar-icon" size={20} />
                            <span>{t.predictive}</span>
                        </div>
                        {!isCollapsed && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPredictiveOpen(!predictiveOpen);
                                }}
                                style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', margin: '-0.5rem', cursor: 'pointer' }}
                            >
                                {predictiveOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                        )}
                    </div>

                    {!isCollapsed && predictiveOpen && predictiveItems.length > 0 && (
                        <div className="sidebar-submenu" style={{ marginLeft: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                            {predictiveItems.map((item, idx) => (
                                <div
                                    key={`pred-${idx}`}
                                    className={`sidebar-item submenu-item ${activeView === item.title ? 'active' : ''}`}
                                    onClick={() => onViewChange(item.title)}
                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9em', minHeight: 'auto' }}
                                >
                                    <item.icon className="sidebar-icon" size={16} />
                                    <span>{t[item.key] || item.title}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        className={`sidebar-item ${(prescriptiveItems.some(i => i.title === activeView) || activeView === "Prescriptive") ? 'active' : ''}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewChange("Prescriptive");
                            }}
                        >
                            <TrendingUp className="sidebar-icon" size={20} />
                            <span>{t.prescriptive}</span>
                        </div>
                        {!isCollapsed && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPrescriptiveOpen(!prescriptiveOpen);
                                }}
                                style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', margin: '-0.5rem', cursor: 'pointer' }}
                            >
                                {prescriptiveOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                        )}
                    </div>

                    {!isCollapsed && prescriptiveOpen && prescriptiveItems.length > 0 && (
                        <div className="sidebar-submenu" style={{ marginLeft: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                            {prescriptiveItems.map((item, idx) => (
                                <div
                                    key={`presc-${idx}`}
                                    className={`sidebar-item submenu-item ${activeView === item.title ? 'active' : ''}`}
                                    onClick={() => onViewChange(item.title)}
                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9em', minHeight: 'auto' }}
                                >
                                    <item.icon className="sidebar-icon" size={16} />
                                    <span>{t[item.key] || item.title}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        className={`sidebar-item ${activeView === "Ask Nexus" ? 'active' : ''}`}
                        onClick={() => onViewChange("Ask Nexus")}
                    >
                        <MessageSquare className="sidebar-icon" size={20} />
                        <span>{t.askNexus}</span>
                    </div>

                    {bottomItems.map((item, idx) => (
                        <div
                            key={`bottom-${idx}`}
                            className={`sidebar-item ${activeView === item.title ? 'active' : ''}`}
                            onClick={() => onViewChange(item.title)}
                        >
                            <item.icon className="sidebar-icon" size={20} />
                            <span>{t[item.key] || item.title}</span>
                        </div>
                    ))}
                </div>

                <div className="sidebar-group">
                    <div className="group-title">System</div>
                    <div
                        className={`sidebar-item ${activeView === "Settings" ? 'active' : ''}`}
                        onClick={() => onViewChange("Settings")}
                    >
                        <Settings className="sidebar-icon" size={20} />
                        <span>{t.settings}</span>
                    </div>
                    <div
                        className={`sidebar-item ${activeView === "Support" ? 'active' : ''}`}
                        onClick={() => onViewChange("Support")}
                    >
                        <HelpCircle className="sidebar-icon" size={20} />
                        <span>Support</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
