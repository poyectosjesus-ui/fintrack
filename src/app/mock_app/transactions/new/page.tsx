'use client';

import { BottomSheet } from '@/components/native/BottomSheet';

export default function NewTransactionModal() {
  return (
    <BottomSheet title="Nuevo Registro">
      <div className="py-4 space-y-6">
        
        {/* Toggle Type */}
        <div className="flex p-1 bg-zinc-800/50 rounded-2xl w-full">
          <button className="flex-1 py-2 text-sm font-bold bg-zinc-700/80 rounded-xl shadow shadow-black text-white">Gasto</button>
          <button className="flex-1 py-2 text-sm font-bold text-zinc-400">Ingreso</button>
        </div>

        {/* Monto */}
        <div className="flex flex-col items-center py-6 border-b border-zinc-800">
          <span className="text-zinc-500 font-medium mb-2">¿Cuánto gastaste?</span>
          <div className="flex items-center text-5xl font-extrabold text-white">
            <span className="text-zinc-500 mr-2">$</span>
            450.00
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center active:bg-zinc-800">
            <div className="flex items-center gap-3 text-zinc-300">
              <span className="text-xl">🍔</span>
              <span className="font-medium">Categoría</span>
            </div>
            <span className="text-zinc-500 font-medium text-sm flex items-center gap-2">Restaurantes <span className="text-xs">&rang;</span></span>
          </div>

          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Concepto</label>
            <input 
              type="text" 
              placeholder="Ej. Tacos del centro..."
              className="bg-transparent text-white focus:outline-none w-full font-medium" 
            />
          </div>
        </div>

        <button className="w-full bg-indigo-500 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform mt-8 shadow-[0_4px_20px_rgba(99,102,241,0.4)]">
          Guardar Gasto
        </button>
      </div>
    </BottomSheet>
  );
}
