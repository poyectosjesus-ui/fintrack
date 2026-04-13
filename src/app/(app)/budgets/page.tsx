'use client';


import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { formatAmount } from '@/lib/format';
import { getLucideIcon } from '@/lib/icon-mapper';
import { Plus, Wallet, AlertCircle } from 'lucide-react';

export default function MobileBudgetsPage() {
  const { data, loading } = useApi<any>('/api/budgets');
  const budgets = data?.data || [];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 pt-6 md:pt-8 w-full max-w-screen-xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Presupuestos</h1>
        <Link href="/budgets/new" className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 h-12 rounded-full font-bold flex items-center justify-center transition-colors">
          + Añadir
        </Link>
      </div>

      <div className="px-4 py-6">
        {loading ? (
           <div className="flex justify-center p-12"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></span></div>
        ) : budgets.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-16 text-center bg-zinc-950 border border-zinc-800 border-dashed rounded-3xl">
              <Wallet size={48} className="text-zinc-800 mb-4" />
              <p className="text-zinc-500 font-medium">No has establecido ningún límite de presupuesto aún.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((bg: any) => {
              const pct = Math.min(((bg.spent || 0) / bg.amount) * 100, 100);
              const isAlert = pct >= 90;
              const BgIcon = getLucideIcon(bg.category.icon);
              
              return (
                <div key={bg.id} className="bg-zinc-950 rounded-3xl p-6 shadow-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-zinc-700/50" style={{ backgroundColor: `${bg.category.color}15`, color: bg.category.color }}>
                        <BgIcon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-100 text-lg">{bg.category.name}</h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5 capitalize">{bg.period.toLowerCase()}</p>
                      </div>
                    </div>
                    {isAlert && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2 rounded-full flex shrink-0" title="Alerta de sobregiro">
                        <AlertCircle size={18} />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <span className="font-black text-2xl text-white">${formatAmount(bg.spent || 0)}</span>
                        <span className="text-zinc-500 text-sm font-semibold ml-2">/ ${formatAmount(bg.amount)}</span>
                      </div>
                      <span className={`text-sm font-black ${isAlert ? 'text-rose-400' : 'text-zinc-400'}`}>{pct.toFixed(0)}%</span>
                    </div>

                    <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner border border-zinc-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isAlert ? 'bg-gradient-to-r from-rose-500 to-rose-400' : ''}`} 
                        style={{ 
                          width: `${pct}%`, 
                          backgroundColor: isAlert ? undefined : bg.category.color,
                          boxShadow: isAlert ? 'none' : `inset 0 0 10px ${bg.category.color}80` 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  );
}
