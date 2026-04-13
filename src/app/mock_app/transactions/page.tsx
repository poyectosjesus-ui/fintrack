'use client';

import { TopNav } from '@/components/native/TopNav';
import { Search, Filter } from 'lucide-react';

export default function MockAppTransactions() {
  return (
    <>
      <TopNav title="Historial" />

      {/* Header Actions */}
      <div className="sticky top-[60px] z-30 bg-zinc-950 px-4 py-2 flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full bg-zinc-900 text-sm border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button className="w-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 active:bg-zinc-800">
          <Filter size={18} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        
        {/* Day Group 1 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-2">Hoy</h4>
          <div className="bg-zinc-900 rounded-[28px] p-2 shadow-sm border border-zinc-800">
            {[1, 2].map((_, i) => (
              <Link href="/mock_app/transactions/123" key={i} className="flex items-center justify-between p-3 rounded-2xl active:bg-zinc-800 transition-colors cursor-pointer block">
                <div className="flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl">
                      {['🍔', '📺'][i]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-200">{['Restaurante Local', 'Suscripción Netflix'][i]}</h4>
                      <p className="text-xs text-zinc-500">{['Comida', 'Entretenimiento'][i]}</p>
                    </div>
                  </div>
                  <span className="font-bold text-rose-400">-{['$450.00', '$200.00'][i]}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Day Group 2 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-2">Ayer</h4>
          <div className="bg-zinc-900 rounded-[28px] p-2 shadow-sm border border-zinc-800">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl active:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${i===1 ? 'bg-indigo-500/20' : 'bg-zinc-800'}`}>
                    {['⛽️', '💰', '🛒'][i]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-200">{['Gasolina', 'Nómina', 'Supermercado'][i]}</h4>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mt-1 flex gap-1">
                      {i === 1 && <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">INGRESO</span>}
                      {['Transporte', 'Salario', 'Despensa'][i]}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${i===1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {i===1 ? '+' : '-'}{['$800.00', '$15,000.00', '$2,400.00'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
