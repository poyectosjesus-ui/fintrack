'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, loading } = useApi<any>(`/api/transactions?page=${page}&limit=20`);

  const txs = data?.data || [];
  const meta = data?.meta || { page: 1, pages: 1, total: 0 };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-primary-light">
            Transacciones
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Gestiona tus ingresos y gastos
          </p>
        </div>
        <button className="btn btn-primary text-sm rounded-lg px-4 shadow-[0_4px_16px_rgba(99,102,241,0.2)]">
          + Nueva Transacción
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
             <thead>
              <tr className="bg-surface-2">
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Descripción</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Categoría</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Tipo</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">
                    <div className="flex flex-col gap-4">
                      <div className="loading-skeleton h-12 w-full rounded" />
                      <div className="loading-skeleton h-12 w-full rounded" />
                      <div className="loading-skeleton h-12 w-full rounded" />
                    </div>
                  </td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-4xl mb-3 opacity-50">💸</span>
                      <p className="text-text-muted">Aún no hay transacciones</p>
                    </div>
                  </td>
                </tr>
              ) : (
                txs.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-sm">{tx.description}</div>
                      <div className="text-xs text-text-muted">{format(new Date(tx.date), "dd MMM yyyy", { locale: es })}</div>
                    </td>
                    <td className="p-4">
                      <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-opacity-10 border shadow-sm"
                        style={{ color: tx.category.color, borderColor: `${tx.category.color}40`, backgroundColor: `${tx.category.color}15` }}
                      >
                        <span>{tx.category.icon}</span> {tx.category.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${tx.type === 'INCOME' ? 'bg-income-glow text-income-light' : 'bg-expense-glow text-expense-light'}`}>
                        {tx.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                      </span>
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

        {/* Paginación */}
        {meta.pages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-surface-2">
             <span className="text-xs text-text-muted">
               Página {meta.page} de {meta.pages}
             </span>
             <div className="flex gap-2">
               <button 
                 disabled={meta.page <= 1} 
                 onClick={() => setPage(p => p - 1)}
                 className="p-1 px-3 border border-border rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 transition-colors"
               >
                 Anterior
               </button>
               <button 
                 disabled={meta.page >= meta.pages} 
                 onClick={() => setPage(p => p + 1)}
                 className="p-1 px-3 border border-border rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 transition-colors"
               >
                 Siguiente
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
