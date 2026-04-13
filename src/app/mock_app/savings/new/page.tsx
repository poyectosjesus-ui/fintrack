'use client';

import { BottomSheet } from '@/components/native/BottomSheet';
import { Target } from 'lucide-react';

export default function NewSavingsMock() {
  return (
    <BottomSheet title="Crear Meta de Ahorro">
      <div className="py-4 space-y-6">
        
        {/* Ícono de la meta */}
        <div className="flex flex-col items-center py-4">
          <button className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-4xl hover:bg-zinc-700 active:scale-95 transition-all outline-dashed outline-2 outline-offset-4 outline-zinc-700">
            ✈️
          </button>
          <span className="text-xs font-semibold text-zinc-500 mt-3 uppercase tracking-wider">Elegir Ícono</span>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1">
            <label className="text-xs text-emerald-500 uppercase font-bold tracking-wider">Nombre de tu Meta</label>
            <input 
              type="text" 
              placeholder="Ej. Viaje a Japón..."
              className="bg-transparent text-white focus:outline-none w-full font-bold text-xl mt-1" 
            />
          </div>

          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Monto Objetivo</label>
            <div className="flex items-center text-3xl font-extrabold text-white mt-1">
              <span className="text-zinc-500 mr-2">$</span>
              <input 
                type="number" 
                placeholder="0.00" 
                className="bg-transparent w-full outline-none"
              />
            </div>
          </div>
        </div>

        <button className="w-full bg-emerald-500 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform mt-8 shadow-[0_4px_20px_rgba(16,185,129,0.4)]">
          Iniciar Ahorro
        </button>
      </div>
    </BottomSheet>
  );
}
