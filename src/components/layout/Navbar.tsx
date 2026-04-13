'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';

export function Navbar({ user }: { user: any }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Notification counter fetch
  const { data: notifs } = useApi<any[]>('/api/notifications?unreadOnly=true');
  const unreadCount = notifs?.length || 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between md:justify-end">
        {/* Mobile Logo Logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-sm shadow-glow-primary">
            💰
          </div>
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-text to-primary-light">
            FinTrack
          </span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-text-muted hover:text-text transition-colors rounded-full hover:bg-surface-3">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-expense rounded-full"></span>
            )}
          </button>

          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pl-3 pr-2 border border-border rounded-full hover:border-border-hover bg-surface-2 transition-all"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-medium leading-none">{user?.name || 'Usuario'}</span>
                <span className="text-xs text-text-muted uppercase mt-1">{user?.role || 'MEMBER'}</span>
              </div>
              <div className="w-8 h-8 bg-surface-3 rounded-full flex items-center justify-center ml-1">
                <User size={16} className="text-text-muted" />
              </div>
              <ChevronDown size={14} className="text-text-muted ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-2 border border-border rounded-lg shadow-card overflow-hidden animate-slideUp">
                <div className="p-3 border-b border-border sm:hidden">
                  <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>
                <Link 
                  href="/workspace" 
                  className="w-full text-left px-4 py-3 text-sm hover:bg-surface-3 text-text-muted hover:text-text transition-colors block"
                  onClick={() => setDropdownOpen(false)}
                >
                  Configuración Workspace
                </Link>
                <div className="border-t border-border" />
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-expense hover:bg-expense-glow transition-colors"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
