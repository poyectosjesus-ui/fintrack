'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default function SubscriptionsPage() {
  const { data, loading, refetch } = useApi<any[]>('/api/subscriptions');
  const toast = useToast();
  
  const toggleStatus = async (id: string, currentStatus: string) => {
    const res = await api.put(`/api/subscriptions/${id}/toggle`, {});
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast(`Suscripción pausada/activada`, 'success');
      refetch();
    }
  };

  const subs = data || [];
  const totalMonthly = subs.reduce((acc, sub) => {
    if (sub.status !== 'ACTIVE') return acc;
    const amount = Number(sub.amount);
    return acc + (sub.cycle === 'MONTHLY' ? amount : sub.cycle === 'YEARLY' ? amount / 12 : amount * 4);
  }, 0);

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-primary-light">
            Suscripciones
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Gasto activo mensual: <span className="font-bold text-text">{fmt(totalMonthly)}</span>
          </p>
        </div>
        <button className="btn btn-primary text-sm rounded-lg px-4">
          + Nueva
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="loading-skeleton h-40 w-full rounded-xl" />)
        ) : subs.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-border rounded-xl bg-surface-2 border-dashed">
            <span className="text-4xl mb-3 opacity-50">🍿</span>
            <p className="text-text-muted mb-4">No tienes suscripciones registradas</p>
            <button className="btn btn-secondary text-sm">Crear la primera</button>
          </div>
        ) : (
          subs.map(sub => (
            <div key={sub.id} className="bg-surface border border-border rounded-xl p-5 shadow-card relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{sub.name}</h3>
                  <div className="text-xs text-text-muted flex items-center gap-1 mt-1">
                    <span>{sub.category.icon}</span> {sub.category.name}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                  sub.status === 'ACTIVE' ? 'bg-income-glow text-income-light' : 'bg-surface-3 text-text-muted'
                }`}>
                  {sub.status}
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-expense">{fmt(sub.amount)}</div>
                  <div className="text-xs text-text-muted uppercase tracking-wider">{sub.cycle}</div>
                </div>
                
                <button 
                  onClick={() => toggleStatus(sub.id, sub.status)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                    sub.status === 'ACTIVE' 
                      ? 'border-border text-text-muted hover:text-expense hover:border-expense' 
                      : 'border-income text-income bg-income-glow hover:bg-income hover:text-white'
                  }`}
                >
                  {sub.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
