'use client';

import { BottomSheet } from '@/components/native/BottomSheet';

export default function NewBudgetMock() {
  return (
    <BottomSheet title="Nuevo Presupuesto">
      <div className="py-4 space-y-6">
        
        {/* Límite Sugerido */}
        <div className="flex flex-col items-center py-6 border-b border-zinc-800">
          <span className="text-zinc-500 font-medium mb-2">Límite Mensual Sugerido</span>
          <div className="flex items-center text-5xl font-extrabold text-white">
            <span className="text-zinc-500 mr-2">$</span>
            <input 
              type="number" 
              defaultValue="5000" 
              className="bg-transparent w-40 text-center outline-none"
            />
          </div>
        </div>

        {/* Detalles del presupuesto */}
        <div className="space-y-4">
          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Categoría a Monitorear</label>
            <div className="flex items-center gap-3 mt-2 text-zinc-300">
              <span className="text-2xl">🛒</span>
              <span className="font-semibold text-lg flex-1">Supermercado</span>
              <span className="text-zinc-500 text-xs">&rang;</span>
            </div>
          </div>

          {/* Color Chooser */}
          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-3 block">Color de Identificación</label>
            <div className="flex justify-between">
              {['bg-red-500', 'bg-orange-500', 'bg-emerald-500', 'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'].map(color => (
                <button key={color} className={`w-8 h-8 rounded-full ${color} ${color === 'bg-indigo-500' ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 border-2 border-transparent' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        <button className="w-full bg-indigo-500 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform mt-8 shadow-[0_4px_20px_rgba(99,102,241,0.4)]">
          Fijar Presupuesto
        </button>
      </div>
    </BottomSheet>
  );
}
