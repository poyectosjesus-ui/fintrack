'use client';

import { useApi } from '@/hooks/use-api';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default function BudgetsPage() {
  const { data, loading } = useApi<any[]>('/api/budgets');
  const budgets = data || [];

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-primary-light">
            Presupuestos
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Control de gastos por categoría
          </p>
        </div>
        <button className="btn btn-primary text-sm rounded-lg px-4">
          + Nuevo Presupuesto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="loading-skeleton h-48 w-full rounded-xl" />)
        ) : budgets.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-border rounded-xl bg-surface-2 border-dashed">
            <span className="text-4xl mb-3 opacity-50">📊</span>
            <p className="text-text-muted mb-4">Aún no has configurado presupuestos</p>
            <button className="btn btn-secondary text-sm">Crear Presupuesto</button>
          </div>
        ) : (
          budgets.map(budget => {
            // progress info is baked in from the backend /api/budgets
            const spent = budget.spent || 0;
            const amount = budget.amount;
            const pct = Math.min((spent / amount) * 100, 100);
            
            // Dynamic color logic based on alertAt threshold
            const isAlert = pct >= budget.alertAt;
            const isWarning = pct >= (budget.alertAt * 0.8) && !isAlert;
            const colorClass = isAlert ? 'bg-expense' : isWarning ? 'bg-warning' : 'bg-income';
            
            return (
              <div key={budget.id} className="bg-surface border border-border rounded-xl p-6 shadow-card hover:border-border-hover transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${budget.category.color}20`, color: budget.category.color }}>
                      {budget.category.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-none">{budget.category.name}</h3>
                      <p className="text-xs text-text-muted mt-1 uppercase tracking-wider">{budget.period}</p>
                    </div>
                  </div>
                  {isAlert && <span className="bg-expense-glow text-expense-light text-[10px] px-2 py-0.5 rounded font-bold uppercase">Alerta</span>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-2xl font-bold">{fmt(spent)}</span>
                      <span className="text-text-muted text-sm ml-1">/ {fmt(amount)}</span>
                    </div>
                    <span className="text-sm font-semibold">{pct.toFixed(0)}%</span>
                  </div>

                  <div className="h-3 w-full bg-surface-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`} 
                      style={{ width: `${pct}%` }}
                    />
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
