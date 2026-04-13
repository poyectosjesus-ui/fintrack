'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | ReactNode;
  icon: string;
  type?: 'income' | 'expense' | 'balance' | 'count';
  loading?: boolean;
  meta?: string;
  isNegative?: boolean;
}

export function StatCard({ title, value, icon, type = 'count', loading, meta, isNegative }: StatCardProps) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-label">
        <div className={`stat-icon ${type}`}>{icon}</div>
        {title}
      </div>
      {loading ? (
        <div className="loading-skeleton" style={{ height: 40, width: '80%' }} />
      ) : (
        <div className={`stat-value ${
          type === 'balance' ? (isNegative ? 'balance-neg' : 'balance-pos') 
          : type === 'count' ? 'neutral' 
          : type
        }`}>
          {value}
        </div>
      )}
      {meta && <div className="stat-meta">{meta}</div>}
    </div>
  );
}
