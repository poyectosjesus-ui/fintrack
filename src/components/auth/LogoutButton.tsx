'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full bg-zinc-950 border border-rose-500/30 hover:border-rose-500 hover:bg-rose-500/10 rounded-2xl p-4 flex items-center justify-center gap-2 text-rose-500 font-bold active:scale-95 transition-all mt-4"
    >
      <LogOut size={18} /> Cerrar Sesión
    </button>
  );
}
