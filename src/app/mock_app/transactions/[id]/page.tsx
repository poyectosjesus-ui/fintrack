'use client';

import { BottomSheet } from '@/components/native/BottomSheet';
import { Trash2, Edit3, Share, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TransactionDetailMock() {
  const router = useRouter();
  return (
    <BottomSheet title="Detalle de Gasto">
      <div className="py-2 space-y-6">
        
        {/* Transaction Header */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-[20px] flex items-center justify-center text-3xl shadow-lg border border-zinc-700/50 mb-3">
             🍔
          </div>
          <h2 className="text-xl font-bold text-white">Restaurante Local</h2>
          <p className="text-sm text-zinc-400 font-medium mt-1">Hoy a las 14:30</p>
          <span className="text-4xl font-extrabold text-rose-400 mt-4 tracking-tight">-$450.00</span>
        </div>

        {/* Metadata */}
        <div className="bg-zinc-800/30 rounded-[24px] p-4 border border-zinc-800 divide-y divide-zinc-800/50">
          <div className="flex items-center justify-between py-3 px-1">
            <span className="text-zinc-500 font-medium text-sm">Estado</span>
            <span className="text-emerald-400 font-bold text-sm bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-wider">Aprobado</span>
          </div>
          <div className="flex items-center justify-between py-3 px-1">
            <span className="text-zinc-500 font-medium text-sm">Categoría</span>
            <span className="text-zinc-200 font-medium text-sm">Comidas</span>
          </div>
          <div className="flex items-center justify-between py-3 px-1">
            <span className="text-zinc-500 font-medium text-sm">Método</span>
            <span className="text-zinc-200 font-medium text-sm flex gap-2 items-center">
              💳 Tarjeta terminada en 4509
            </span>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          
          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800/50 rounded-2xl active:bg-zinc-700 transition">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center"><Edit3 size={18} /></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Editar</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800/50 rounded-2xl active:bg-zinc-700 transition">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center"><Share size={18} /></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Dividir</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800/50 rounded-2xl active:bg-zinc-700 transition">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center"><Info size={18} /></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Recibo</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-3 bg-rose-500/10 rounded-2xl active:bg-rose-500/20 transition">
            <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center"><Trash2 size={18} /></div>
            <span className="text-[10px] font-bold text-rose-400 uppercase">Borrar</span>
          </button>

        </div>
        
        <button 
          onClick={() => router.back()}
          className="w-full py-4 text-center text-zinc-500 font-bold active:text-white transition mt-2"
        >
          Cerrar Detalle
        </button>
      </div>
    </BottomSheet>
  );
}
