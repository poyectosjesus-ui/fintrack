'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopNavProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function TopNav({ title, showBack = false, rightAction, transparent = false }: TopNavProps) {
  const router = useRouter();

  return (
    <div className={`md:static sticky top-0 z-40 w-full px-4 md:px-0 pt-safe-top md:pt-4 pb-3 flex items-center justify-between transition-colors ${
      transparent ? 'bg-transparent' : 'bg-zinc-900/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-b border-white/5 md:border-none'
    }`}>
      <div className="w-10 md:w-auto">
        {showBack && (
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full text-zinc-300 active:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      <h1 className="font-semibold md:font-bold text-[17px] md:text-2xl text-white md:text-zinc-100 tracking-tight flex-1 text-center md:text-left md:pl-2">
        {title}
      </h1>

      <div className="w-10 md:w-auto flex justify-end shrink-0">
        {rightAction}
      </div>
    </div>
  );
}
