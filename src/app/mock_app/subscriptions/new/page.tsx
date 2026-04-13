'use client';

import { BottomSheet } from '@/components/native/BottomSheet';

export default function NewSubscriptionMock() {
  return (
    <BottomSheet title="Agregar Concurrencia">
      <div className="py-4 space-y-6">
        
        {/* Toggle Type */}
        <div className="flex p-1 bg-zinc-800/50 rounded-2xl w-full">
          <button className="flex-1 py-2 text-sm font-bold bg-zinc-700/80 rounded-xl shadow shadow-black text-rose-400">Suscripción (-)</button>
          <button className="flex-1 py-2 text-sm font-bold text-zinc-500">Ingreso Fijo (+)</button>
        </div>

        {/* Monto */}
        <div className="flex flex-col items-center py-6 border-b border-zinc-800">
          <span className="text-zinc-500 font-medium mb-2">Cuota Periódica</span>
          <div className="flex items-center text-5xl font-extrabold text-white">
            <span className="text-zinc-500 mr-2">$</span>
            <input 
              type="number" 
              placeholder="0.00" 
              className="bg-transparent w-40 text-center outline-none placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Servicio o Beneficiario</label>
            <input 
              type="text" 
              placeholder="Ej. YouTube Premium..."
              className="bg-transparent text-white focus:outline-none w-full font-medium mt-1" 
            />
          </div>

          <div className="flex gap-4">
            <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex-1 flex flex-col gap-1">
              <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Frecuencia</label>
              <span className="text-zinc-200 font-medium mt-1 inline-block">Mensual <span className="text-zinc-600 text-xs ml-2">&dtri;</span></span>
            </div>
            
            <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex-1 flex flex-col gap-1">
              <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Día del Mes</label>
              <input 
                type="number" 
                max={31}
                min={1}
                placeholder="Día (ej. 15)"
                className="bg-transparent text-white focus:outline-none w-full font-medium mt-1" 
              />
            </div>
          </div>
        </div>

        <button className="w-full bg-rose-500 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform mt-8 shadow-[0_4px_20px_rgba(244,63,94,0.4)]">
          Programar Cargo
        </button>
      </div>
    </BottomSheet>
  );
}
