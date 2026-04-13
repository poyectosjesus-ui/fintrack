'use client';

import { TopNav } from '@/components/native/TopNav';
import { ChevronRight, Plus, Target } from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { getLucideIcon } from '@/lib/icon-mapper';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default function MobileSavingsPage() {
  const { data, loading } = useApi<any>('/api/savings');
  const goals = data?.data || [];

  const totalSaved = goals.reduce((acc: number, g: any) => acc + Number(g.currentAmount), 0);

  return (
    <>
      <TopNav title="Ahorros" rightAction={
        <Link href="/savings/new" className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border border-emerald-500/20">
          <Plus size={14} /> Añadir
        </Link>
      }/>

      <div className="px-4 py-6 space-y-8">
        
        {/* Total Savings Hero */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Target size={18} />
              <p className="font-semibold text-sm uppercase tracking-wider">Ahorro Acumulado</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              {loading ? '...' : fmt(totalSaved)}
            </h2>
          </div>

          {!loading && goals.length > 0 && (
             <div className="relative z-10 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-4 flex gap-6">
                <div>
                   <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Metas Activas</p>
                   <p className="text-2xl font-bold text-zinc-100">{goals.length}</p>
                </div>
             </div>
          )}
        </div>

        {/* Goals Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg px-2 flex items-center gap-2">
            <Target size={18} className="text-emerald-500" />
            Vías de Ahorro
          </h3>

          {loading ? (
             <div className="flex justify-center p-8"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></span></div>
          ) : goals.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-16 text-center bg-zinc-950 border border-zinc-800 border-dashed rounded-3xl">
                <Target size={48} className="text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-medium">No has creado metas de ahorro.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal: any) => {
                const current = Number(goal.currentAmount);
                const target = Number(goal.targetAmount);
                const pct = Math.min((current / target) * 100, 100);
                const GoalIcon = getLucideIcon(goal.icon || 'Target');
                
                return (
                  <Link href={`/savings/${goal.id}/add`} key={goal.id} className="group bg-zinc-950 rounded-3xl p-6 shadow-xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col gap-6">
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Circular ring */}
                        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                            <circle cx="32" cy="32" r="28" fill="none" className="stroke-zinc-900" strokeWidth="6" />
                            <circle 
                              cx="32" cy="32" r="28" fill="none" 
                              className="transition-all duration-1000 delay-300 stroke-current text-emerald-500"
                              strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={176} strokeDashoffset={176 - (176 * pct) / 100}
                            />
                          </svg>
                          <span className="absolute text-emerald-400 group-hover:scale-110 transition-transform">
                            <GoalIcon size={22} />
                          </span>
                        </div>

                        <div className="overflow-hidden">
                          <h4 className="font-bold text-zinc-100 text-lg truncate group-hover:text-emerald-400 transition-colors">{goal.name}</h4>
                          <span className="text-sm font-semibold text-emerald-400 mt-1 block">
                            {pct.toFixed(1)}% <span className="text-zinc-600">completado</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 pointer-events-none transition-colors hidden md:flex shrink-0">
                         <ChevronRight size={16} />
                      </div>
                    </div>

                    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800/50 flex justify-between items-center">
                      <div>
                         <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Ahorrado</p>
                         <p className="font-bold text-white">${current.toFixed(0)}</p>
                      </div>
                      <div className="h-8 w-px bg-zinc-800" />
                      <div className="text-right">
                         <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Objetivo</p>
                         <p className="font-bold text-zinc-300">${target.toFixed(0)}</p>
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
