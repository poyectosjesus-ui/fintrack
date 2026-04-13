'use client';

import { TopNav } from '@/components/native/TopNav';
import { User, Settings, Users, LogOut, Shield, ChevronRight } from 'lucide-react';

export default function MockAppProfile() {
  return (
    <>
      <TopNav title="Ajustes" />

      <div className="px-4 py-4 space-y-6">
        
        {/* Profile Header */}
        <div className="flex items-center gap-4 bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-zinc-800">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
            J
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Jesús Ruiz</h2>
            <p className="text-sm text-zinc-400">admin@fintrack.fm</p>
            <span className="inline-block mt-2 bg-zinc-800 text-indigo-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Owner</span>
          </div>
        </div>

        {/* Menu Groups */}
        <div className="space-y-4 text-zinc-300 font-medium">
          
          <div className="bg-zinc-900 rounded-[28px] overflow-hidden border border-zinc-800 divide-y divide-zinc-800/50">
             <button className="w-full flex items-center justify-between p-4 active:bg-zinc-800 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center"><User size={18} /></div>
                 <span>Mi Cuenta</span>
               </div>
               <ChevronRight size={20} className="text-zinc-600" />
             </button>
             <button className="w-full flex items-center justify-between p-4 active:bg-zinc-800 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Users size={18} /></div>
                 <span>Miembros de la Familia</span>
               </div>
               <ChevronRight size={20} className="text-zinc-600" />
             </button>
          </div>

          <div className="bg-zinc-900 rounded-[28px] overflow-hidden border border-zinc-800 divide-y divide-zinc-800/50">
             <button className="w-full flex items-center justify-between p-4 active:bg-zinc-800 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center"><Settings size={18} /></div>
                 <span>Preferencias</span>
               </div>
               <ChevronRight size={20} className="text-zinc-600" />
             </button>
             <button className="w-full flex items-center justify-between p-4 active:bg-zinc-800 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-zinc-700/50 text-zinc-400 flex items-center justify-center"><Shield size={18} /></div>
                 <span>Privacidad y Seguridad</span>
               </div>
               <ChevronRight size={20} className="text-zinc-600" />
             </button>
          </div>

        </div>

        {/* Danger Zone */}
        <button className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-center gap-2 text-rose-500 font-bold active:scale-95 transition-transform mt-4">
          <LogOut size={18} /> Cerrar Sesión
        </button>

      </div>
    </>
  );
}
