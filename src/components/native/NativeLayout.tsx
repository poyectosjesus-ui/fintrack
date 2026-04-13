'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BottomTabBar } from './BottomTabBar';
import Link from 'next/link';
import { LayoutDashboard, ArrowRightLeft, Target, Settings, Repeat, PieChart, Menu, X } from 'lucide-react';

export function NativeLayout({ children, user }: { children: ReactNode, user?: any }) {
  const pathname = usePathname();
  const isSheetView = pathname.includes('/new') || pathname.includes('/edit');

  return (
    <div className="flex justify-center bg-[#0a0f18] min-h-dvh font-sans antialiased text-white selection:bg-indigo-500/30">
      
      {/* 
        Unified layout scaling container:
        Edge to edge on all devices. Max width wrapper applied to scrollable content.
      */}
      <div className="w-full bg-[#0a0f18] relative flex flex-col h-dvh overflow-hidden shadow-black/50">
        
        {/* Desktop Top Navigation (Hidden on Mobile) */}
        {!isSheetView && (
          <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md z-40 sticky top-0">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                  💰
                </div>
                <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-br from-zinc-100 to-indigo-200 tracking-tight">FinTrack</h1>
              </Link>

              <nav className="flex items-center gap-2 ml-4">
                <DesktopNavLink href="/" icon={LayoutDashboard} label="Dashboard" current={pathname} />
                <DesktopNavLink href="/transactions" icon={ArrowRightLeft} label="Historial" current={pathname} />
                <DesktopNavLink href="/budgets" icon={PieChart} label="Presupuestos" current={pathname} />
                <DesktopNavLink href="/savings" icon={Target} label="Ahorros" current={pathname} />
                <DesktopNavLink href="/subscriptions" icon={Repeat} label="Suscripciones" current={pathname} />
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full pl-3 pr-1 py-1">
                  <span className="text-sm font-medium text-zinc-300">{user.name}</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center uppercase font-bold text-xs text-white">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full relative z-0 scroll-smooth pb-24 md:pb-6">
          <div className="w-full max-w-screen-2xl mx-auto md:px-4 lg:px-8">
            {children}
          </div>
        </main>

        {/* Tab Bar always stays at bottom on Mobile, hidden on desktop */}
        <div className="md:hidden">
          <BottomTabBar />
        </div>

      </div>
    </div>
  );
}

function DesktopNavLink({ href, label, icon: Icon, current }: { href: string, label: string, icon: any, current: string }) {
  const isMock = current.startsWith('/mock_app');
  const base = isMock ? '/mock_app' : '';
  const finalHref = isMock && href === '/' ? '/mock_app' : `${base}${href}`;
  
  const isActive = current === finalHref || (current.startsWith(finalHref) && finalHref !== '/' && finalHref !== '/mock_app');

  return (
    <Link 
      href={finalHref}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
      }`}
    >
      <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-zinc-500'} />
      {label}
    </Link>
  );
}
