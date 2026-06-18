import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, suffix, trend, icon: Icon, color = "blue", subtitle }) => {
  const isPositive = trend >= 0;

  return (
    <div className={`kpi ${color}`}>
      <div className="kpi-header">
        <div className="kpi-label">{title}</div>
        <div className="kpi-icon">
          {Icon && <Icon size={24} />}
        </div>
      </div>
      <div className="kpi-value-container">
        <div className="kpi-value">
          {typeof value === 'number' && !isNaN(value) ? value.toLocaleString() : (value || '---')}
        </div>
        <div className="kpi-suffix">{suffix}</div>
      </div>
      {subtitle ? (
        <div className="kpi-sub subtitle">{subtitle}</div>
      ) : (
        <div className={`kpi-sub ${trend >= 0 ? 'text-green' : 'text-red'}`}>
          {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{typeof trend === 'number' && !isNaN(trend) ? Math.abs(trend) : '0'}% vs last month</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(KPICard);
