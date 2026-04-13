'use client';

import { useApi } from '@/hooks/use-api';
import { TopNav } from '@/components/native/TopNav';
import { Bell, ArrowUpRight, ArrowDownRight, Activity, Wallet, Receipt, CreditCard, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { getLucideIcon } from '@/lib/icon-mapper';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default function DashboardPage() {
  const { data: analytics, loading: loadingAnalytics } = useApi<any>('/api/analytics');
  const { data: txData, loading: loadingTx } = useApi<any>('/api/transactions?limit=5');

  const summary = analytics?.summary;
  const byCategory = analytics?.byCategory || [];
  const transactions = txData?.data || [];

  return (
    <>
      <TopNav 
        title="Dashboard" 
        rightAction={<button className="p-2 outline-none flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full h-10 w-10 transition-colors hover:bg-zinc-800"><Bell size={18} className="text-zinc-400" /></button>}
      />
      
      <div className="px-4 py-6 space-y-8">
        
        {/* Desktop Grid Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Modern Shadcn-like Balance Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute left-0 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet size={18} className="text-indigo-400" />
                    <h2 className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Balance Total</h2>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                    {loadingAnalytics ? '...' : fmt(summary?.balance || 0)}
                  </h1>
                </div>

                <div className="flex gap-4 md:gap-6 mt-4 md:mt-0">
                  <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-4 border border-zinc-800 shadow-inner flex-1 md:flex-none md:min-w-[160px]">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                      <div className="p-1.5 bg-emerald-500/10 rounded-full"><ArrowDownRight size={16} /></div>
                      <span className="text-[11px] font-bold uppercase tracking-wider">Ingresos</span>
                    </div>
                    <p className="font-bold text-xl text-zinc-100">{loadingAnalytics ? '...' : fmt(summary?.totalIncome || 0)}</p>
                  </div>
                  
                  <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-4 border border-zinc-800 shadow-inner flex-1 md:flex-none md:min-w-[160px]">
                    <div className="flex items-center gap-2 mb-2 text-rose-400">
                      <div className="p-1.5 bg-rose-500/10 rounded-full"><ArrowUpRight size={16} /></div>
                      <span className="text-[11px] font-bold uppercase tracking-wider">Gastos</span>
                    </div>
                    <p className="font-bold text-xl text-zinc-100">{loadingAnalytics ? '...' : fmt(summary?.totalExpense || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Categories Row */}
            {byCategory.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <LayoutGrid size={18} className="text-zinc-500" />
                  <h3 className="font-bold text-zinc-300 text-lg">Top Categorías</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {byCategory.slice(0, 4).map((c: any, i: number) => {
                    const CategoryIcon = getLucideIcon(c.category.icon) || Receipt;
                    return (
                      <div key={i} className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 transition-colors rounded-2xl p-4 flex flex-col items-start gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border border-zinc-800" style={{ backgroundColor: `${c.category.color}15`, color: c.category.color }}>
                          <CategoryIcon size={24} />
                        </div>
                        <div className="w-full">
                          <span className="text-xs text-zinc-400 font-semibold block mb-1">{c.category.name}</span>
                          <span className="text-sm font-bold text-zinc-100 truncate block">{fmt(c.total)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info Column (Recent Tx) */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-zinc-100 text-lg">Actividad Reciente</h3>
                </div>
                <Link href="/transactions" className="text-xs text-zinc-400 hover:text-indigo-400 font-semibold transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
                  Mostrar Todo
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1">
                {loadingTx ? (
                  <div className="flex justify-center p-8"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 text-zinc-600"></span></div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500 text-sm gap-4">
                    <Receipt size={48} className="text-zinc-800" />
                    <span>No has registrado movimientos este mes.</span>
                  </div>
                ) : (
                  transactions.map((tx: any) => {
                    const TxIcon = getLucideIcon(tx.category.icon) || CreditCard;
                    return (
                      <Link href={`/transactions/${tx.id}`} key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-900 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-zinc-800/50 group-hover:scale-105 transition-transform" style={{ backgroundColor: `${tx.category.color}15`, color: tx.category.color }}>
                            <TxIcon size={18} />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-sm text-zinc-200 truncate pr-4">{tx.description}</h4>
                            <p className="text-[11px] font-medium text-zinc-500 mt-0.5">{tx.category.name}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm shrink-0 pl-2 ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                        </span>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
