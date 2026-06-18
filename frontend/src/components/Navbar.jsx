import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Sun, Moon, BarChart, Activity, MessageSquare, FileText, ChevronDown, DollarSign, MapPin, Warehouse, TrendingUp, AlertTriangle, Package, RotateCcw, Zap, Languages, Settings, Edit2, Globe, Monitor, MoreHorizontal } from 'lucide-react';

const NavDropdown = ({ itemProps, activeView, onViewChange, onTableChange, activeDbTable, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { title, icon: Icon, view, items } = itemProps;
    const isActive = activeView === view || items.some(i => i.view === activeView && (!i.table || i.table === activeDbTable));
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            ref={dropdownRef}
            style={{ position: 'relative' }}
        >
            <button
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                    if (items.length > 0) {
                        setIsOpen(!isOpen);
                    }
                    onViewChange(view);
                }}
            >
                <Icon size={18} />
                <span>{t[title.toLowerCase()] || title}</span>
                {items.length > 0 && <ChevronDown size={14} style={{ marginLeft: '4px', transition: 'transform 0.08s ease-out', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />}
            </button>
            {items.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-5px)',
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: isOpen
                        ? 'opacity 0.08s ease-out, transform 0.08s ease-out'
                        : 'opacity 0.08s ease-out, transform 0.08s ease-out, visibility 100s linear 0.08s',
                    marginTop: '8px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    boxShadow: 'var(--sh)',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '220px',
                    zIndex: 100,
                    overflow: 'hidden',
                    padding: '8px'
                }}>

                    {items.map((subItem, idx) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = activeView === subItem.view && (!subItem.table || activeDbTable === subItem.table);
                        return (
                            <button
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    textAlign: 'left',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isSubActive ? 'var(--surface2)' : 'transparent',
                                    color: isSubActive ? 'var(--primary)' : 'var(--text)',
                                    fontWeight: isSubActive ? 800 : 500,
                                    width: '100%',
                                    marginBottom: '2px',
                                    cursor: 'pointer',
                                    transform: isSubActive ? 'translateX(4px)' : 'translateX(0)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSubActive) {
                                        e.currentTarget.style.background = 'var(--surface2)';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSubActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    if (subItem.table && onTableChange) onTableChange(subItem.table);
                                    onViewChange(subItem.view);
                                }}
                            >
                                <SubIcon size={16} />
                                <span style={{ fontSize: '13px' }}>{t[subItem.key] || subItem.title}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const SettingsDropdown = ({ theme, toggleTheme, language, setLanguage, t, bannerText, setBannerText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [tempBannerText, setTempBannerText] = useState('');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleLanguage = () => {
        const nextLang = language === 'en' ? 'ar' : 'en';
        setLanguage(nextLang);

        const trigger = (langCode) => {
            const select = document.querySelector('.goog-te-combo');
            if (select) {
                select.value = langCode;
                select.dispatchEvent(new Event('change'));
                return true;
            }
            return false;
        };

        if (!trigger(nextLang)) {
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (trigger(nextLang) || attempts > 10) {
                    clearInterval(interval);
                }
            }, 500);
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: isOpen ? 'var(--surface2)' : 'var(--surface)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: 0
                }}
                title={t.settings || 'Settings'}
            >
                <Settings size={18} style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '280px',
                    zIndex: 100,
                    overflow: 'hidden',
                    padding: '4px',
                }}>
                    {/* Appearance Section */}
                    <div style={{ padding: '12px 16px 4px', fontSize: '11px', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Appearance
                    </div>
                    <div style={{ padding: '0 8px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '10px 12px',
                            background: 'transparent',
                            borderRadius: '12px',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)' }}>
                                <Moon size={18} className={theme === 'dark' ? "text-purple" : "text-gray-400"} />
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Dark Mode</span>
                            </div>
                            <div 
                                onClick={toggleTheme}
                                style={{ 
                                    width: '42px', 
                                    height: '24px', 
                                    background: theme === 'dark' ? 'var(--primary)' : 'var(--surface2)', 
                                    borderRadius: '12px', 
                                    position: 'relative', 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ 
                                    width: '18px', 
                                    height: '18px', 
                                    background: '#fff', 
                                    borderRadius: '50%', 
                                    position: 'absolute', 
                                    top: '2px', 
                                    left: theme === 'dark' ? '20px' : '2px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div style={{ padding: '16px 16px 4px', fontSize: '11px', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', borderTop: '1px solid var(--border-light)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={14} className="text-blue" /> Language
                    </div>
                    <div style={{ padding: '0 8px' }}>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            background: 'var(--surface2)',
                            padding: '4px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            marginTop: '4px'
                        }}>
                            <button 
                                onClick={() => language !== 'en' && toggleLanguage()}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: language === 'en' ? 'var(--surface)' : 'transparent',
                                    color: language === 'en' ? 'var(--primary)' : 'var(--text2)',
                                    boxShadow: language === 'en' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    fontSize: '13px',
                                    fontWeight: language === 'en' ? 800 : 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                            >
                                English
                            </button>
                            <button 
                                onClick={() => language !== 'ar' && toggleLanguage()}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: language === 'ar' ? 'var(--surface)' : 'transparent',
                                    color: language === 'ar' ? 'var(--primary)' : 'var(--text2)',
                                    boxShadow: language === 'ar' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    fontSize: '14px',
                                    fontWeight: language === 'ar' ? 800 : 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                            >
                                العربية
                            </button>
                        </div>
                    </div>

                    {/* Workspace Section */}
                    <div style={{ padding: '16px 16px 4px', fontSize: '11px', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', borderTop: '1px solid var(--border-light)', marginTop: '8px' }}>
                        Workspace
                    </div>
                    <div style={{ padding: '0 8px 12px' }}>
                        <div 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '12px',
                                background: 'transparent',
                                borderRadius: '12px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                    {bannerText || 'Not Set'}
                                </span>
                            </div>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setTempBannerText(bannerText || ''); 
                                    setIsBannerModalOpen(true); 
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'var(--surface2)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--blue-lt)'; e.currentTarget.style.color = 'var(--blue)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text2)'; }}
                            >
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isBannerModalOpen && (
                <div onClick={() => setIsBannerModalOpen(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'var(--surface)', borderRadius: '24px', padding: '32px', width: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid var(--border)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'var(--primary-lt)', color: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
                                    <Edit2 size={20} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text)', letterSpacing: '-0.5px' }}>Edit Workspace Profile</h3>
                            </div>
                            <button onClick={() => setIsBannerModalOpen(false)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--red-lt)'} onMouseLeave={e => e.currentTarget.style.background='var(--surface2)'}><X size={16} /></button>
                        </div>
                        <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Profile Banner Name</div>
                        <input 
                            type="text" 
                            value={tempBannerText}
                            onChange={(e) => setTempBannerText(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '14px 16px', 
                                borderRadius: '12px', 
                                border: '2px solid var(--border)', 
                                background: 'var(--surface)', 
                                color: 'var(--text)',
                                fontSize: '15px',
                                fontWeight: 500,
                                outline: 'none',
                                marginBottom: '32px',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            autoFocus
                            placeholder="e.g. Pioneer Pharma Insights"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            <button onClick={() => { setBannerText(''); setIsBannerModalOpen(false); setIsOpen(false); }} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--red-md)', background: 'var(--red-lt)', color: 'var(--red)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Remove Logo</button>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setIsBannerModalOpen(false)} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Cancel</button>
                                <button onClick={() => { setBannerText(tempBannerText); setIsBannerModalOpen(false); setIsOpen(false); }} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 119, 0, 0.2)', transition: 'all 0.2s', letterSpacing: '0.5px' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Navbar = ({ activeView, onViewChange, onTableChange, activeDbTable, t, theme, toggleTheme, language, setLanguage, bannerText, setBannerText }) => {

    const navItems = [
        {
            title: "Descriptive",
            icon: BarChart,
            view: "Descriptive",
            items: [
                { title: "Sales Panel", icon: DollarSign, key: 'salesPanel', view: 'Sales Panel' },
                { title: "Regional Performance", icon: MapPin, key: 'regionalPerformance', view: 'Regional Performance' },
                { title: "Warehouse Operations", icon: Warehouse, key: 'warehouseOperations', view: 'Warehouse Operations' },
            ]
        },
        {
            title: "Predictive",
            icon: Activity,
            view: "Predictive",
            items: [
                { title: "30-Day Sales Forecast", icon: TrendingUp, key: 'salesForecast', view: 'Predictive:Sales' },
                { title: "Products at Expiry Risk", icon: AlertTriangle, key: 'expiryRisk', view: 'Predictive:Expiry' },
                { title: "Predicted Demand", icon: Package, key: 'predictedDemand', view: 'Predictive:Demand' },
                { title: "Avg Return Probability", icon: RotateCcw, key: 'returnProbability', view: 'Predictive:Returns' },
                { title: "Prescriptive Actions", icon: Zap, key: 'prescriptiveActions', view: 'Predictive:Actions' }
            ]
        },
        {
            title: "Data Hub",
            icon: FileText,
            view: "Data Hub",
            items: [
                { title: "pharmasales", icon: FileText, key: 'pharmasales', view: 'Data Hub', table: 'pharmasales' },
                { title: "chathistory", icon: MessageSquare, key: 'chathistory', view: 'Data Hub', table: 'chat_session_history' }
            ]
        }
    ];

    return (
        <nav>
            <div className="nav-left">
                <div className="brand">
                    <img src="/Images/logo.svg" alt="Konfig" className="brand-logo-img" style={{ width: '32px', height: '38px', objectFit: 'cover', objectPosition: 'left center', paddingLeft: '4px' }} />
                    <span className="brand-name" style={{ fontSize: '26.5px', fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.5px', textTransform: 'none' }}>Insights Engine</span>
                </div>
            </div>

            <div className="nav-center hidden lg:flex">
                <div className="nav-nav" style={{ display: 'flex', gap: '8px' }}>
                    {navItems.map((item, idx) => (
                        <NavDropdown
                            key={idx}
                            itemProps={item}
                            activeView={activeView}
                            onViewChange={onViewChange}
                            onTableChange={onTableChange}
                            activeDbTable={activeDbTable}
                            t={t}
                        />
                    ))}
                </div>
            </div>

            <div className="nav-right">
                <div
                    onClick={() => onViewChange('Model Details')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'var(--green-lt)',
                        color: 'var(--green)',
                        padding: '9px 20px',
                        borderRadius: '30px',
                        fontWeight: 800,
                        fontSize: '12px',
                        border: '1px solid var(--green-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    className="hidden sm:flex model-badge-hover"
                    title="View AI Model Details">
                    <span style={{
                        width: '8px',
                        height: '8px',
                        background: 'var(--green)',
                        borderRadius: '50%',
                        display: 'inline-block'
                    }}></span>
                    5 AI Models Active
                </div>
                {toggleTheme && (
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                        <SettingsDropdown theme={theme} toggleTheme={toggleTheme} language={language} setLanguage={setLanguage} t={t} bannerText={bannerText} setBannerText={setBannerText} />
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
