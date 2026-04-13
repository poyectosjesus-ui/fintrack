'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ArrowRightLeft, Target, Settings, Plus } from 'lucide-react';

export function BottomTabBar() {
  const pathname = usePathname();
  const isModal = pathname.includes('/new');

  if (isModal) return null;
  const isMock = pathname.startsWith('/mock_app');
  const base = isMock ? '/mock_app' : '';

  const tabs = [
    { name: 'Inicio', href: isMock ? '/mock_app' : '/', icon: LayoutGrid },
    { name: 'Historial', href: `${base}/transactions`, icon: ArrowRightLeft },
    { name: 'Add', href: `${base}/transactions/new`, icon: Plus, isAction: true },
    { name: 'Ahorros', href: `${base}/savings`, icon: Target },
    { name: 'Perfil', href: `${base}/profile`, icon: Settings },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      {/* Glow Blur Background */}
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10" />
      
      <div className="relative flex items-center justify-between px-6 pb-safe-bottom pt-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          if (tab.isAction) {
            return (
              <Link 
                key={tab.href}
                href={tab.href}
                className="relative -top-6 w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(99,102,241,0.5)] active:scale-95 transition-transform"
              >
                <Icon size={28} />
              </Link>
            );
          }

          return (
            <Link 
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center p-1 min-w-[50px] transition-colors ${
                isActive ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} />
              <span className="text-[10px] font-medium mt-1">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
