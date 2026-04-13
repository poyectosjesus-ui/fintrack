'use client';

import Link from 'next/link';

export default function MockAppBudgets() {
  return (
    <>

      <div className="px-4 py-4 space-y-5">
        {[
          { name: 'Supermes', icon: '🛒', limit: 5000, spent: 3400, color: 'bg-indigo-500' },
          { name: 'Salidas', icon: '🍻', limit: 2000, spent: 1800, color: 'bg-rose-500' },
          { name: 'Casa', icon: '🏠', limit: 8000, spent: 4000, color: 'bg-emerald-500' },
        ].map((bg, i) => {
          const pct = Math.min((bg.spent / bg.limit) * 100, 100);
          
          return (
            <div key={i} className="bg-zinc-900 rounded-[28px] p-5 shadow-sm border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${bg.color}/20`}>
                    {bg.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100">{bg.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">Mensual</p>
                  </div>
                </div>
                {pct >= 90 && <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Alerta</span>}
              </div>

              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="font-bold text-lg">${bg.spent}</span>
                  <span className="text-zinc-500 text-sm ml-1">/ ${bg.limit}</span>
                </div>
                <span className="text-xs font-bold text-zinc-400">{pct.toFixed(0)}%</span>
              </div>

              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${pct >= 90 ? 'bg-rose-500' : bg.color}`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  );
}
