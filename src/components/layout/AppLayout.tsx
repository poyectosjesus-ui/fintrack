'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppLayout({ children, user }: { children: ReactNode, user?: any }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-950 font-sans antialiased text-white selection:bg-indigo-500/30">
      
      {/* Desktop Sidebar (hidden on lg-) */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header Navigation (hidden on lg+) */}
        <MobileNav user={user} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="w-full max-w-screen-2xl mx-auto h-full">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}
