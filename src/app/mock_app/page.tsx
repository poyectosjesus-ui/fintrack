'use client';

import { Bell, ArrowUpRight, ArrowDownRight, Wallet, Target } from 'lucide-react';

export default function MockAppHome() {
  return (
    <>
        title="Finanzas Familiares" 
        rightAction={<button className="p-2"><Bell size={20} className="text-zinc-400" /></button>}
      />
      
      <div className="px-4 py-4 space-y-6">
        
        {/* Main Balance Card (Wallet Style) */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <p className="text-indigo-100 font-medium text-sm mb-1 uppercase tracking-wider">Balance Total</p>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">$34,500<span className="text-indigo-200 text-xl">.00</span></h2>
          
          <div className="mt-8 flex gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1 text-emerald-300">
                <div className="p-1 bg-emerald-500/20 rounded-full"><ArrowDownRight size={14} /></div>
                <span className="text-xs font-semibold uppercase tracking-wider">Ingresos</span>
              </div>
              <p className="font-bold text-lg text-white">$12,400</p>
            </div>
            
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1 text-rose-300">
                <div className="p-1 bg-rose-500/20 rounded-full"><ArrowUpRight size={14} /></div>
                <span className="text-xs font-semibold uppercase tracking-wider">Gastos</span>
              </div>
              <p className="font-bold text-lg text-white">$4,200</p>
            </div>
          </div>
        </div>

        {/* Quick Actions / Categories */}
        <div className="flex justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['Supermercado', 'Entretenimiento', 'Transporte', 'Educación'].map((cat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <button className="w-16 h-16 bg-zinc-800 rounded-full border border-zinc-700/50 flex items-center justify-center text-2xl active:scale-95 active:bg-zinc-700 transition-all shadow-lg">
                {['🛒', '🍿', '🚗', '📚'][i]}
              </button>
              <span className="text-[10px] text-zinc-400 font-medium">{cat}</span>
            </div>
          ))}
        </div>

        {/* Recent Transactions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-white text-lg">Actividad Reciente</h3>
            <button className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Ver todo</button>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-4 shadow-sm border border-zinc-800">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">
                    {['🍔', '📺', '⛽️'][i]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-200">{['Restaurante', 'Netflix', 'Gasolina'][i]}</h4>
                    <p className="text-xs text-zinc-500">Hoy, {['14:30', '10:00', '08:15'][i]}</p>
                  </div>
                </div>
                <span className="font-bold text-rose-400">-{['$450', '$200', '$800'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
