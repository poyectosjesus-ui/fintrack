'use client';

import { TopNav } from '@/components/native/TopNav';
import { Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MockAppSavings() {
  return (
    <>
      <TopNav title="Ahorros" rightAction={<Link href="/mock_app/savings/new" className="text-emerald-400 font-medium">Añadir</Link>}/>

      <div className="px-4 py-4 space-y-6">
        
        {/* Total Savings Card */}
        <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl p-6 shadow-xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <p className="text-emerald-100 font-medium text-sm mb-1 uppercase tracking-wider">Ahorro Total</p>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">$45,200<span className="text-teal-200 text-xl">.00</span></h2>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg px-2">Mis Metas</h3>

          {[
            { name: 'Fondo de Emergencia', icon: '🏦', current: 20000, target: 50000, color: 'text-emerald-400', bg: 'bg-emerald-400' },
            { name: 'Vacaciones Japón', icon: '✈️', current: 15200, target: 30000, color: 'text-blue-400', bg: 'bg-blue-400' },
            { name: 'Nueva Mac', icon: '💻', current: 10000, target: 40000, color: 'text-purple-400', bg: 'bg-purple-400' },
          ].map((goal, i) => {
            const pct = (goal.current / goal.target) * 100;
            return (
              <Link href="/mock_app/savings/add" key={i} className="bg-zinc-900 rounded-[28px] p-4 flex gap-4 items-center shadow-sm border border-zinc-800 active:bg-zinc-800 transition-colors block cursor-pointer">
                
                {/* Circular ring */}
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" className="stroke-zinc-800" strokeWidth="6" />
                    <circle 
                      cx="32" cy="32" r="28" fill="none" 
                      className={`transition-all duration-1000 delay-300 stroke-current ${goal.color}`}
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={176} strokeDashoffset={176 - (176 * pct) / 100}
                    />
                  </svg>
                  <span className="absolute text-2xl">{goal.icon}</span>
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-zinc-100">{goal.name}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-semibold">${goal.current} <span className="text-xs text-zinc-500">/ ${goal.target}</span></span>
                  </div>
                </div>

                <ChevronRight size={20} className="text-zinc-600" />
              </Link>
            );
          })}
        </div>

      </div>
    </>
  );
}
