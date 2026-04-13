'use client';

import { useApi } from '@/hooks/use-api';
import { TopNav } from '@/components/native/TopNav';
import { Search, Filter } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function MobileTransactionsPage() {
  const { data, loading } = useApi<any>('/api/transactions?limit=50');
  const transactions = data?.data || [];

  // Group transactions by date
  const grouped = transactions.reduce((acc: any, tx: any) => {
    const d = new Date(tx.date);
    let key = format(d, "dd MMM yyyy", { locale: es });
    if (isToday(d)) key = 'Hoy';
    else if (isYesterday(d)) key = 'Ayer';
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <>
      <TopNav title="" rightAction={<button className="text-zinc-400 mt-1"><Filter size={20}/></button>}/>
      <div className="px-4 pb-4">
        
        {/* Search Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Historial</h1>
          <div className="mt-4 flex items-center bg-zinc-800/50 backdrop-blur-md px-4 py-3 rounded-2xl border border-zinc-700/50 shadow-inner">
            <Search size={18} className="text-zinc-500 mr-3" />
            <input 
              type="text" 
              placeholder="Buscar comercios, categorías..." 
              className="bg-transparent border-none outline-none text-zinc-200 w-full placeholder-zinc-500 text-sm font-medium"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center p-8"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></span></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 font-medium">No hay transacciones aún.</div>
        ) : (
          <div className="space-y-6">
            {Object.keys(grouped).map((groupTitle) => (
              <div key={groupTitle} className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-2">{groupTitle}</h4>
                <div className="bg-zinc-900 rounded-[28px] p-2 shadow-sm border border-zinc-800">
                  {grouped[groupTitle].map((tx: any) => (
                    <Link href={`/transactions/${tx.id}`} key={tx.id} className="flex items-center justify-between p-3 rounded-2xl active:bg-zinc-800 transition-colors cursor-pointer block">
                      <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg border border-white/5" style={{ backgroundColor: `${tx.category.color}20` }}>
                            {tx.category.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-zinc-200">{tx.description}</h4>
                            <p className="text-xs text-zinc-500">{tx.category.name}</p>
                          </div>
                        </div>
                        <span className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
