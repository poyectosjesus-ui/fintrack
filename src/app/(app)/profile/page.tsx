import { TopNav } from '@/components/native/TopNav';
import { User, Settings, Users, Shield, ChevronRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  return (
    <>
      <TopNav title="Ajustes" />

      <div className="px-4 py-6 space-y-8">
        
        {/* Full-width Grid Support on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6 bg-zinc-950 rounded-3xl p-8 shadow-xl border border-zinc-800/80 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-3xl font-bold shadow-inner relative z-10">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="relative z-10 w-full overflow-hidden">
                <h2 className="text-2xl font-bold text-white tracking-tight truncate">{user.name}</h2>
                <p className="text-sm text-zinc-400 truncate">{user.email}</p>
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">Activo</span>
                  <span className="inline-flex bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">Owner</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <LogoutButton />
          </div>

          <div className="lg:col-span-7">
            {/* Menu Groups */}
            <div className="space-y-4 text-zinc-300 font-medium h-full">
              
              <div className="bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800/80 divide-y divide-zinc-800/50 shadow-xl">
                 <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-900 transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><User size={20} /></div>
                     <span className="font-semibold text-zinc-100">Mi Cuenta</span>
                   </div>
                   <ChevronRight size={20} className="text-zinc-600" />
                 </button>
                 <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-900 transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Users size={20} /></div>
                     <span className="font-semibold text-zinc-100">Miembros de la Familia</span>
                   </div>
                   <ChevronRight size={20} className="text-zinc-600" />
                 </button>
              </div>

              <div className="bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800/80 divide-y divide-zinc-800/50 shadow-xl">
                 <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-900 transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Settings size={20} /></div>
                     <span className="font-semibold text-zinc-100">Preferencias</span>
                   </div>
                   <ChevronRight size={20} className="text-zinc-600" />
                 </button>
                 <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-900 transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Shield size={20} /></div>
                     <span className="font-semibold text-zinc-100">Privacidad y Seguridad</span>
                   </div>
                   <ChevronRight size={20} className="text-zinc-600" />
                 </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
