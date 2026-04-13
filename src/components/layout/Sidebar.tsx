'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Repeat, 
  PieChart, 
  Target, 
  Settings 
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transacciones', icon: ArrowRightLeft },
  { href: '/subscriptions', label: 'Suscripciones', icon: Repeat },
  { href: '/budgets', label: 'Presupuestos', icon: PieChart },
  { href: '/savings', label: 'Ahorros', icon: Target },
  { href: '/workspace', label: 'Workspace', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface-2 h-full z-20">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            💰
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight bg-clip-text text-transparent bg-gradient-to-br from-text to-primary-light">
              FinTrack
            </h2>
            <p className="text-[10px] text-text-muted">Familia v2</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary-glow text-primary-light shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]' 
                  : 'text-text-muted hover:text-text hover:bg-surface-3'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-primary' : 'text-text-muted'} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-2 border-t border-border z-50 px-2 pb-safe-bottom pt-2">
      <div className="flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center p-2 min-w-[64px]"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-primary-glow text-primary-light' : 'text-text-muted'}`}>
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-text' : 'text-text-muted'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
