'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { StatCard } from '@/components/ui/StatCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default function DashboardPage() {
  const { data: analytics, loading: loadingAnalytics } = useApi<any>('/api/analytics');
  const { data: txData, loading: loadingTx } = useApi<any>('/api/transactions?limit=5');

  const summary = analytics?.summary;
  const byCategory = analytics?.byCategory || [];
  const byMember = analytics?.byMember || [];
  const transactions = txData?.data || [];

  return (
    <div className="py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-primary-light">
          Resumen Financiero
        </h1>
        <p className="text-text-muted text-sm">
          {analytics ? `Del ${format(new Date(analytics.period.from), "d 'de' MMMM", { locale: es })} al ${format(new Date(analytics.period.to), "d 'de' MMMM yyyy", { locale: es })}` : 'Cargando...'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos"
          icon="📈"
          type="income"
          value={fmt(summary?.totalIncome || 0)}
          loading={loadingAnalytics}
        />
        <StatCard
          title="Gastos"
          icon="📉"
          type="expense"
          value={fmt(summary?.totalExpense || 0)}
          loading={loadingAnalytics}
        />
        <StatCard
          title="Balance"
          icon="⚖️"
          type="balance"
          value={fmt(summary?.balance || 0)}
          isNegative={(summary?.balance || 0) < 0}
          loading={loadingAnalytics}
        />
        <StatCard
          title="Tasa de Ahorro"
          icon="💚"
          type="count"
          value={`${summary?.savingsRate || 0}%`}
          loading={loadingAnalytics}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Categories Pie Chart */}
        <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-5 shadow-card hover:border-border-hover transition-colors">
          <div className="mb-4">
            <h3 className="font-bold text-lg">Por Categoría</h3>
            <p className="text-xs text-text-muted">Top gastos del mes</p>
          </div>
          
          <div className="h-64">
            {loadingAnalytics ? (
              <div className="h-full w-full loading-skeleton rounded-lg"></div>
            ) : byCategory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                <span className="text-4xl mb-2">🥧</span>
                <span>Sin gastos</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="total"
                    nameKey="category.name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {byCategory.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.category.color || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => fmt(value)}
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Breakdown by Member & Categories Lists */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-bold text-lg mb-4">Gasto por Miembro</h3>
            <div className="space-y-4">
              {loadingAnalytics ? (
                <div className="loading-skeleton h-12 w-full rounded" />
              ) : byMember.length === 0 ? (
                <p className="text-sm text-text-muted">No data</p>
              ) : (
                byMember.map((m: any) => (
                  <div key={m.user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center">
                        👤
                      </div>
                      <span className="text-sm font-medium">{m.user.name}</span>
                    </div>
                    <span className="text-sm font-bold text-expense">{fmt(m.total)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-card overflow-hidden">
            <h3 className="font-bold text-lg mb-4 text-expense">📉 Top Categorías</h3>
            <div className="space-y-4">
              {loadingAnalytics ? (
                <div className="loading-skeleton h-12 w-full rounded" />
              ) : byCategory.length === 0 ? (
                <p className="text-sm text-text-muted">No data</p>
              ) : (
                byCategory.slice(0, 5).map((c: any) => (
                  <div key={c.category.id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{c.category.icon}</span>
                        <span>{c.category.name}</span>
                      </div>
                      <span className="font-semibold text-expense">{fmt(c.total)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${c.percentage}%`, backgroundColor: c.category.color }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recents Transactions */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg">Transacciones Recientes</h3>
          <a href="/transactions" className="text-sm text-primary hover:text-primary-light transition-colors">
            Ver todas &rarr;
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-2">
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Descripción</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Categoría</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Fecha</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loadingTx ? (
                <tr>
                  <td colSpan={4} className="p-4">
                    <div className="loading-skeleton h-8 w-full rounded" />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">No hay transacciones recientes</td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-sm">{tx.description}</div>
                      {tx.splitWith.length > 0 && <div className="text-[10px] text-primary">Dividido con {tx.splitWith.length} personas</div>}
                    </td>
                    <td className="p-4">
                      <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-opacity-10 border"
                        style={{ color: tx.category.color, borderColor: tx.category.color, backgroundColor: `${tx.category.color}20` }}
                      >
                        <span>{tx.category.icon}</span> {tx.category.name}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-muted">
                      {format(new Date(tx.date), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="p-4 text-right font-bold text-sm">
                      <span className={tx.type === 'INCOME' ? 'text-income' : 'text-expense'}>
                        {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
