'use client';

import { useApi } from '@/hooks/use-api';
import { Bell, ArrowUpRight, ArrowDownRight, Activity, Wallet, Receipt, CreditCard, LayoutGrid, RotateCcw, Target, Play } from 'lucide-react';
import Link from 'next/link';
import { getLucideIcon } from '@/lib/icon-mapper';
import { formatAmount } from '@/lib/format';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { data: analytics, loading: loadingAnalytics } = useApi<any>('/api/analytics');
  const { data: txData, loading: loadingTx } = useApi<any>('/api/transactions?limit=5');
  const { data: budgetsData } = useApi<any>('/api/budgets');
  const { data: savingsData } = useApi<any>('/api/savings');
  const { data: subsData } = useApi<any>('/api/subscriptions');

  const summary = analytics?.summary;
  const byCategory = analytics?.byCategory || [];
  
  // Safe Array Extractors
  const transactions = Array.isArray(txData) ? txData : txData?.data || [];
  const budgets = Array.isArray(budgetsData) ? budgetsData : budgetsData?.data || [];
  const savings = Array.isArray(savingsData) ? savingsData : savingsData?.data || [];
  const subscriptions = Array.isArray(subsData) ? subsData : subsData?.data || [];

  // Data processing for quick widgets
  const topBudgets = budgets.slice(0, 3); // top 3 budgets
  const activeSavings = savings.filter((s:any) => !s.isCompleted).slice(0, 2);
  
  const upcomingSubs = subscriptions
    .filter((s: any) => s.status === 'ACTIVE' && s.nextBillingDate)
    .sort((a: any, b: any) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
    .slice(0, 3);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 pt-6 md:pt-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-800/60 pb-6">
        <div>
           <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Centro de Mando</h1>
           <p className="text-sm text-zinc-400 mt-1 font-medium">Panorámica financiera unificada en tiempo real.</p>
        </div>
        <button className="p-2 outline-none flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full h-12 w-12 transition-colors hover:bg-zinc-800 self-start sm:self-auto shadow-inner"><Bell size={20} className="text-zinc-400" /></button>
      </div>
      
      <div className="space-y-8">
        
        {/* Desktop Grid Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* The Great Balance Hub */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute left-0 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet size={20} className="text-indigo-400" />
                    <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Activo Líquido Total</h2>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter shadow-sm">
                    {loadingAnalytics ? '...' : `$${formatAmount(summary?.balance || 0)}`}
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:flex md:gap-6 mt-4 md:mt-0 w-full md:w-auto">
                  <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-zinc-800/80 shadow-inner w-full md:min-w-[180px]">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg"><ArrowDownRight size={18} /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Ingresos Reales</span>
                    </div>
                    <p className="font-extrabold text-xl sm:text-2xl text-zinc-100 tracking-tight">{loadingAnalytics ? '...' : <span className="text-emerald-500">+</span>}{loadingAnalytics ? '' : `$${formatAmount(summary?.totalIncome || 0)}`}</p>
                  </div>
                  
                  <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-zinc-800/80 shadow-inner w-full md:min-w-[180px]">
                    <div className="flex items-center gap-2 mb-3 text-rose-400">
                      <div className="p-1.5 bg-rose-500/10 rounded-lg"><ArrowUpRight size={18} /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Egresos Reales</span>
                    </div>
                    <p className="font-extrabold text-xl sm:text-2xl text-zinc-100 tracking-tight">{loadingAnalytics ? '...' : <span className="text-rose-500">-</span>}{loadingAnalytics ? '' : `$${formatAmount(summary?.totalExpense || 0)}`}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Split: Budgets & Subscriptions Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Mini Budgets Preview */}
               <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
                  <Link href="/budgets" className="absolute top-6 right-6 text-[10px] font-bold text-zinc-500 uppercase hover:text-indigo-400 transition-colors">Expandir</Link>
                  <h3 className="font-bold text-zinc-200 text-base mb-6 flex items-center gap-2"><LayoutGrid size={16} className="text-rose-400"/> Límites Gasto Actual</h3>
                  
                  <div className="space-y-4">
                     {budgets.length === 0 ? (
                       <p className="text-sm text-zinc-600 font-medium my-4">No hay presupuestos activos.</p>
                     ) : topBudgets.map((b: any) => {
                        const BudgetIcon = getLucideIcon(b.category.icon) || Receipt;
                        return (
                          <div key={b.id} className="space-y-2">
                            <div className="flex justify-between items-end">
                               <div className="flex items-center gap-2">
                                  <BudgetIcon size={14} style={{ color: b.category.color }}/>
                                  <p className="text-sm text-zinc-300 font-medium">{b.category.name}</p>
                               </div>
                               <p className="text-xs font-bold text-zinc-400">{b.percentage}% al tope</p>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner">
                              <div className={`h-full rounded-full transition-all duration-1000 ${b.isOverBudget ? 'bg-rose-600' : b.isAlert ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                            </div>
                          </div>
                        )
                     })}
                  </div>
               </div>

               {/* Mini Subscriptions Preview */}
               <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
                  <Link href="/subscriptions" className="absolute top-6 right-6 text-[10px] font-bold text-zinc-500 uppercase hover:text-indigo-400 transition-colors">Expandir</Link>
                  <h3 className="font-bold text-zinc-200 text-base mb-6 flex items-center gap-2"><RotateCcw size={16} className="text-indigo-400"/> Recibos en Puerta</h3>
                  
                  <div className="space-y-3">
                     {upcomingSubs.length === 0 ? (
                       <p className="text-sm text-zinc-600 font-medium my-4">Libre de cargos recurrentes próximos.</p>
                     ) : upcomingSubs.map((s: any) => {
                        const SubIcon = getLucideIcon(s.category.icon) || Play;
                        return (
                           <div key={s.id} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-800" style={{ backgroundColor: `${s.category.color}15`, color: s.category.color }}>
                                    <SubIcon size={14} />
                                 </div>
                                 <div className="overflow-hidden">
                                    <p className="text-sm text-zinc-200 font-bold truncate">{s.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-medium uppercase">{format(new Date(s.nextBillingDate), "dd MMM", { locale: es })}</p>
                                 </div>
                              </div>
                              <p className="text-sm font-black text-rose-400 shrink-0">-{formatAmount(s.amount)}</p>
                           </div>
                        )
                     })}
                  </div>
               </div>

            </div>

            {/* Bottom Row: Savings Simulator Preview */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 shadow-xl">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-zinc-200 text-base flex items-center gap-2"><Target size={16} className="text-emerald-400"/> Crecimiento de Metas Activas</h3>
                 <Link href="/savings" className="text-[10px] font-bold text-zinc-500 uppercase hover:text-indigo-400 transition-colors">Expandir</Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSavings.length === 0 ? (
                     <p className="text-sm text-zinc-600 font-medium col-span-2 text-center py-4">No has asignado liquidez futura ni metas.</p>
                  ) : activeSavings.map((g: any) => {
                     const pct = Math.min((Number(g.currentAmount) / Number(g.targetAmount)) * 100, 100);
                     const SIcon = getLucideIcon(g.icon || 'Target');
                     return (
                        <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-4 items-center">
                           
                           {/* Mini Ring */}
                           <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                             <svg className="w-full h-full transform -rotate-90">
                               <circle cx="24" cy="24" r="20" fill="none" className="stroke-zinc-800" strokeWidth="4" />
                               <circle 
                                 cx="24" cy="24" r="20" fill="none" 
                                 className="transition-all duration-1000 stroke-current text-emerald-500"
                                 strokeWidth="4" strokeLinecap="round"
                                 strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * pct) / 100}
                               />
                             </svg>
                           </div>

                           <div className="flex-1 w-full min-w-0">
                               <p className="text-sm font-bold text-zinc-200 truncate">{g.name}</p>
                               <div className="flex justify-between items-end mt-1">
                                  <p className="text-xs font-black text-emerald-400">${formatAmount(Number(g.currentAmount))}</p>
                                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{pct.toFixed(0)}%</p>
                               </div>
                           </div>

                        </div>
                     )
                  })}
               </div>
            </div>

          </div>

          {/* Sidebar Info Column (Recent Tx Master Tracker) */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-white text-lg">Actividad Reciente</h3>
                </div>
                <Link href="/transactions" className="text-[10px] text-zinc-400 hover:text-indigo-400 font-bold uppercase tracking-widest bg-[#0d0d0f] border border-zinc-800 px-3 py-1.5 rounded-full shadow-inner">
                  Todos
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 relative z-10">
                {loadingTx ? (
                  <div className="flex justify-center p-8"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 text-zinc-600"></span></div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 text-sm gap-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/30 border-dashed">
                    <Receipt size={32} className="text-zinc-800" />
                    <span>No has declarado volcado de datos.</span>
                  </div>
                ) : (
                  transactions.map((tx: any) => {
                    const TxIcon = getLucideIcon(tx.category.icon) || CreditCard;
                    const isInc = tx.type === 'INCOME';
                    return (
                      <Link href={`/transactions/${tx.id}`} key={tx.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800/60 p-3.5 rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${isInc ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'}`}>
                            {isInc ? <ArrowDownRight size={18}/> : <ArrowUpRight size={18}/>}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-sm text-zinc-200 truncate pr-4">{tx.description}</h4>
                            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{tx.category.name}</p>
                          </div>
                        </div>
                        <span className={`font-black text-sm shrink-0 pl-2 tracking-tight ${isInc ? 'text-emerald-400' : 'text-zinc-300'}`}>
                          {isInc ? '+' : '-'}${formatAmount(tx.amount)}
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
    </div>
  );
}
