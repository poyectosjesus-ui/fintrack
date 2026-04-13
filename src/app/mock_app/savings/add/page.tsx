'use client';

import { BottomSheet } from '@/components/native/BottomSheet';

export default function AddFundsSavingsMock() {
  return (
    <BottomSheet title="Aportar a tu Meta">
      <div className="py-4 space-y-6">
        
        <div className="flex justify-center mb-2">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-1">✈️</span>
            <span className="font-semibold text-zinc-300">Vacaciones Japón</span>
            <span className="text-xs text-emerald-400 font-bold tracking-wider">EN PROGRESO</span>
          </div>
        </div>

        <div className="flex flex-col items-center py-6 border-y border-zinc-800/50 bg-zinc-900/50">
          <span className="text-zinc-500 font-medium mb-2">¿Cuánto vas a contribuir?</span>
          <div className="flex items-center text-6xl font-extrabold text-emerald-400">
            <span className="text-emerald-700 mr-2">$</span>
            <input 
              type="number" 
              placeholder="0.00" 
              className="bg-transparent w-48 text-center outline-none placeholder:text-emerald-900"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[100, 500, 1000].map(amt => (
            <button key={amt} className="bg-zinc-800 border border-zinc-700 py-3 rounded-xl font-bold text-zinc-300 active:bg-zinc-700 transition">
              +${amt}
            </button>
          ))}
        </div>

        <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform mt-8 shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
          Transferir Fondos
        </button>
      </div>
    </BottomSheet>
  );
}
