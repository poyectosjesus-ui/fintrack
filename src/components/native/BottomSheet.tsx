'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export function BottomSheet({ children, title }: { children: ReactNode, title?: string }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Gesture overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
        onClick={() => router.back()}
      />

      <div className="relative w-full max-w-md bg-zinc-900 rounded-t-[32px] overflow-hidden flex flex-col max-h-[90dvh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-zinc-800 animate-slideUp">
        
        {/* Notch Handler */}
        <div className="w-full flex justify-center py-4 bg-zinc-900 sticky top-0 z-10" onClick={() => router.back()}>
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {title && (
          <div className="px-6 pb-2 text-center">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">{title}</h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 pb-safe-bottom">
          {children}
        </div>
      </div>
    </div>
  );
}
