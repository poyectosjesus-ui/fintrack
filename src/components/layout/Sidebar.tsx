'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Target, Repeat, PieChart, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useApi } from '@/hooks/use-api';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions/incomes', label: 'Ingresos', icon: ArrowDownCircle },
  { href: '/transactions/expenses', label: 'Egresos', icon: ArrowUpCircle },
  { href: '/budgets', label: 'Presupuestos', icon: PieChart },
  { href: '/savings', label: 'Ahorros', icon: Target },
  { href: '/subscriptions', label: 'Suscripciones', icon: Repeat },
  { href: '/workspace', label: 'Miembros', icon: Users },
];

export function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname() || '';
  const { data: workspaces, loading: workspacesLoading } = useApi<any[]>('/api/workspaces');
  
  const workspace = workspaces && workspaces.length > 0 ? workspaces[0] : null;
  const workspaceRole = workspace?.members?.find((m: any) => m.userId === user?.id)?.role || '';

  return (
    <aside className="w-64 h-dvh flex-col bg-[#06080E] border-r border-zinc-800/60 hidden lg:flex sticky top-0 shrink-0">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-800/40">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-zinc-800">
            <Image src="/icono.png" alt="FinTrack Logo" width={36} height={36} className="object-cover" />
          </div>
          <h1 className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 tracking-tight">
            FinTrack
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        
        {/* Workspace Selector / Context */}
        <div className="space-y-2">
          <p className="px-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hidden lg:block">Mi Familia</p>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800/30 border border-zinc-700/50 shadow-sm relative group cursor-pointer transition-colors hover:bg-zinc-800/60" onClick={() => window.location.href = '/workspace'}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              🏠
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-zinc-100 truncate">
                {workspacesLoading ? 'Cargando...' : workspace?.name || 'Mi Familia'}
              </p>
              <p className="text-xs text-zinc-500 truncate capitalize">
                {workspaceRole || 'Cargando...'}
              </p>
            </div>
            <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="px-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Gestión</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden",
                  isActive 
                    ? "text-white bg-indigo-500/20 shadow-inner" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />}
                <item.icon size={18} className={cn("shrink-0", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer */}
      {user && (
        <div className="p-4 border-t border-zinc-800/60">
          <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center uppercase font-bold text-white shadow-md">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </Link>
        </div>
      )}
      
    </aside>
  );
}
