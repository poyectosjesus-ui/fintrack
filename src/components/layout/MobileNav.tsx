'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Target, Repeat, PieChart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions/incomes', label: 'Ingresos', icon: ArrowDownCircle },
  { href: '/transactions/expenses', label: 'Egresos', icon: ArrowUpCircle },
  { href: '/budgets', label: 'Presupuestos', icon: PieChart },
  { href: '/savings', label: 'Ahorros', icon: Target },
  { href: '/subscriptions', label: 'Suscripciones', icon: Repeat },
];

export function MobileNav({ user }: { user?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || '';

  return (
    <>
      <header className="lg:hidden flex items-center justify-between px-4 h-16 bg-[#06080E]/90 backdrop-blur-md border-b border-zinc-800/60 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xs">💰</span>
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">FinTrack</span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <Link href="/profile" className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center uppercase font-bold text-xs text-white">
              {user.name?.charAt(0) || 'U'}
            </Link>
          )}
          <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-white" onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-4/5 max-w-sm h-full bg-[#09090b] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
              <span className="font-bold text-zinc-100">Menú Principal</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-zinc-400">
                <X size={20} />
              </Button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-semibold transition-all",
                      isActive 
                        ? "text-indigo-300 bg-indigo-500/10" 
                        : "text-zinc-400 hover:bg-zinc-800/50"
                    )}
                  >
                    <item.icon size={20} className={isActive ? "text-indigo-400" : "text-zinc-500"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
          </div>
        </div>
      )}
    </>
  );
}
