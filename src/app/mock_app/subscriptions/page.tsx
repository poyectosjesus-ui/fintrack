'use client';

import { Calendar, Play, Pause, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MockAppSubscriptions() {
  return (
    <>

      <div className="px-4 py-4 space-y-6">
        
        {/* Info Module */}
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-zinc-400 text-sm font-medium">Próximo cobro</p>
            <p className="text-white font-bold text-lg mt-1">Mañana (Netflix)</p>
          </div>
          <div className="text-right">
             <p className="text-rose-400 text-sm font-medium">Gastos Mensuales</p>
             <p className="text-white font-bold text-lg mt-1 border-b border-rose-500/50 border-dashed inline-block">$2,450.00</p>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg px-2">Mis Servicios</h3>

          <div className="bg-zinc-900 rounded-[28px] overflow-hidden border border-zinc-800 divide-y divide-zinc-800/50">
             
             {/* Netlflix Active */}
             <div className="p-4 flex gap-4 items-center">
               <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl drop-shadow-xl">
                 N
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-zinc-100 text-base">Netflix Premium</h4>
                 <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium mt-0.5">
                   <Calendar size={12} /> Renueva el 15 de cada mes
                 </div>
               </div>
               <div className="text-right flex flex-col items-end">
                 <span className="font-bold text-rose-400">-$299.00</span>
                 <span className="bg-emerald-500/20 text-emerald-400 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-1 flex items-center gap-1">
                   <Play size={8} className="fill-current"/> Activo
                 </span>
               </div>
             </div>

             {/* Spotify Active */}
             <div className="p-4 flex gap-4 items-center">
               <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl drop-shadow-xl">
                 <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current border border-tran">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.84-.12-.96-.54-.12-.42.12-.84.54-.96 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.36 1.08zm1.44-3.3c-.3.42-.84.54-1.26.24-3.36-2.04-8.52-2.64-12.54-1.44-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.56-1.32 10.26-.66 14.1 1.68.42.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.12-1.38-.72-.18-.6.12-1.2.72-1.38 4.2-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.24.48-.9.72-1.56.42z"/>
                  </svg>
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-zinc-100 text-base">Spotify Duo</h4>
                 <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium mt-0.5">
                   <Calendar size={12} /> Renueva el 22
                 </div>
               </div>
               <div className="text-right flex flex-col items-end">
                 <span className="font-bold text-rose-400">-$189.00</span>
               </div>
             </div>

             {/* Gym Paused */}
             <div className="p-4 flex gap-4 items-center opacity-60">
               <div className="w-12 h-12 bg-zinc-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                 💪
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-zinc-100 text-base">SmartFit</h4>
                 <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium mt-0.5">
                   Suspendido temporalmente
                 </div>
               </div>
               <div className="text-right flex flex-col items-end">
                 <span className="font-bold text-zinc-400 line-through">-$500.00</span>
                 <span className="bg-zinc-700 text-zinc-300 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-1 flex items-center gap-1">
                   <Pause size={8} className="fill-current"/> Pausado
                 </span>
               </div>
             </div>

          </div>
        </div>

      </div>
    </>
  );
}
