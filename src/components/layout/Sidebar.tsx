'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowRightLeft, Target, Repeat, PieChart } from 'lucide-react';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Historial', icon: ArrowRightLeft },
  { href: '/budgets', label: 'Presupuestos', icon: PieChart },
  { href: '/savings', label: 'Ahorros', icon: Target },
  { href: '/subscriptions', label: 'Suscripciones', icon: Repeat },
];

export function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname() || '';

  return (
    <aside className="w-64 h-dvh flex-col bg-[#06080E] border-r border-zinc-800/60 hidden lg:flex sticky top-0 shrink-0">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-800/40">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-sm">💰</span>
          </div>
          <h1 className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 tracking-tight">
            FinTrack
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Gestión</p>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group relative overflow-hidden",
                isActive 
                  ? "text-indigo-300 bg-indigo-500/10 shadow-inner" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />}
              <item.icon size={18} className={cn("shrink-0", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
              {item.label}
            </Link>
          );
        })}
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
