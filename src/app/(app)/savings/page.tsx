'use client';

import { useApi } from '@/hooks/use-api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default function SavingsPage() {
  const { data, loading } = useApi<any[]>('/api/savings');
  const savings = data || [];

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-primary-light">
            Metas de Ahorro
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Haz seguimiento a tus objetivos financieros
          </p>
        </div>
        <button className="btn btn-primary text-sm rounded-lg px-4">
          + Nueva Meta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="loading-skeleton h-56 w-full rounded-xl" />)
        ) : savings.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-border rounded-xl bg-surface-2 border-dashed">
            <span className="text-4xl mb-3 opacity-50">🎯</span>
            <p className="text-text-muted mb-4">No tienes metas de ahorro</p>
            <button className="btn btn-secondary text-sm">Crear Meta</button>
          </div>
        ) : (
          savings.map(goal => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = goal.status === 'COMPLETED';
            
            return (
              <div key={goal.id} className="bg-surface border border-border rounded-xl p-6 shadow-card relative overflow-hidden flex flex-col md:flex-row gap-6 items-center md:items-start group">
                
                {/* SVG Circular Progress */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface-3)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" 
                      stroke={isCompleted ? 'var(--color-income)' : 'var(--color-primary)'} 
                      strokeWidth="8"
                      strokeDasharray={283} // 2 * pi * r
                      strokeDashoffset={283 - (283 * pct) / 100}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl opacity-80 mb-1">{goal.icon || '🎯'}</span>
                    <span className="text-xs font-bold">{pct.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex-1 w-full text-center md:text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{goal.name}</h3>
                    {isCompleted && <span className="bg-income-glow text-income-light text-[10px] px-2 py-0.5 rounded font-bold uppercase">Completado</span>}
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-semibold text-text">{fmt(goal.currentAmount)} <span className="font-normal text-text-muted text-xs">/ {fmt(goal.targetAmount)}</span></div>
                    {goal.targetDate && (
                      <p className="text-xs text-text-muted">
                        Para el {format(new Date(goal.targetDate), "dd MMM yyyy", { locale: es })}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex gap-2 justify-center md:justify-start">
                    <button className="btn btn-secondary text-xs py-1.5 px-3" disabled={isCompleted}>
                      Aportar
                    </button>
                    <button className="btn text-xs py-1.5 px-3 bg-surface-2 hover:bg-surface-3 text-text-muted border border-border">
                      Ver Historial
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
