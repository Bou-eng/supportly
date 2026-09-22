import React from 'react';
import Card from '../common/Card';
import './MetricCard.css';

const MetricCard = ({ title, value, change, isPositive, icon, color = 'blue' }) => {
  return (
    <Card className={`metric-card metric-card-${color}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <div className="metric-icon-wrapper">{icon}</div>
      </div>
      <div className="metric-body">
        <h3 className="metric-value">{value}</h3>
        {change && (
          <span className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;