'use client';

import { TopNav } from '@/components/native/TopNav';
import { Calendar, Play, Pause, Plus, CreditCard, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getLucideIcon } from '@/lib/icon-mapper';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default function MobileSubscriptionsPage() {
  const { data, loading } = useApi<any>('/api/subscriptions');
  const subscriptions = data?.data || [];

  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'ACTIVE');
  const monthlyTotal = activeSubscriptions.reduce((acc: number, s: any) => {
    return acc + Number(s.amount);
  }, 0);

  const sortedSubs = [...subscriptions].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ACTIVE' ? -1 : 1;
    if (a.nextBillingDate && b.nextBillingDate) return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
    return 0;
  });

  return (
    <>
      <TopNav title="Suscripciones" rightAction={
        <Link href="/subscriptions/new" className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border border-indigo-500/20">
          <Plus size={14} /> Añadir
        </Link>
      }/>

      <div className="px-4 py-6 space-y-8">
        
        {/* Info Hero Modulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <RotateCcw size={16} />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Próximo Cobro</p>
              </div>
              <p className="text-white font-black text-2xl mt-1 truncate">
                {sortedSubs.length > 0 && sortedSubs[0].status === 'ACTIVE' ? sortedSubs[0].name : '--'}
              </p>
              {sortedSubs.length > 0 && sortedSubs[0].status === 'ACTIVE' && sortedSubs[0].nextBillingDate && (
                 <p className="text-indigo-400 text-sm font-medium mt-1">
                   {format(new Date(sortedSubs[0].nextBillingDate), "dd MMM, yyyy", { locale: es })}
                 </p>
              )}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 mb-2 text-rose-400">
                <CreditCard size={16} />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Gasto Mensual</p>
              </div>
              <p className="text-white font-black text-3xl mt-1">
                {loading ? '...' : fmt(monthlyTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Subscriptions Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg px-2 flex items-center gap-2">
            <RotateCcw size={18} className="text-zinc-500" />
            Mis Servicios
          </h3>

          {loading ? (
             <div className="flex justify-center p-12"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></span></div>
          ) : sortedSubs.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-16 text-center bg-zinc-950 border border-zinc-800 border-dashed rounded-3xl">
                <RotateCcw size={48} className="text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-medium">No has registrado suscripciones recurrentes.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedSubs.map((sub: any) => {
                const isActive = sub.status === 'ACTIVE';
                const SubIcon = getLucideIcon(sub.category.icon) || Play;
                
                return (
                  <div key={sub.id} className={`bg-zinc-950 rounded-3xl p-5 shadow-xl border ${isActive ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60 grayscale'} hover:border-zinc-700 transition-all flex justify-between`}>
                    
                    <div className="flex gap-4 items-center overflow-hidden">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white drop-shadow-xl shadow-inner border border-white/10 shrink-0" style={{ backgroundColor: sub.category.color || '#4f46e5' }}>
                        <SubIcon size={24} />
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-zinc-100 text-lg truncate">{sub.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium mt-1">
                          {isActive && sub.nextBillingDate ? (
                            <><Calendar size={13} className="text-zinc-600"/> {format(new Date(sub.nextBillingDate), "dd MMM yyyy", { locale: es })}</>
                          ) : (
                            'Servicio Suspendido'
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center shrink-0">
                      <span className={`font-black text-lg ${isActive ? 'text-zinc-100' : 'text-zinc-600 line-through'}`}>
                        {fmt(Number(sub.amount))}
                      </span>
                      {isActive ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full mt-2 flex items-center gap-1">
                          <Play size={10} className="fill-current"/> Activo
                        </span>
                      ) : (
                        <span className="bg-zinc-800/50 border border-zinc-700 text-zinc-500 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full mt-2 flex items-center gap-1">
                          <Pause size={10} className="fill-current"/> Pausado
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
