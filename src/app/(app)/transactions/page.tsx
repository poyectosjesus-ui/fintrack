'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Search, Filter, Plus, FileText, ArrowRight, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatAmount } from '@/lib/format';
import Link from 'next/link';
import { getLucideIcon } from '@/lib/icon-mapper';

import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TransactionsHistoryPage() {
  const { data, loading } = useApi<any>('/api/transactions?limit=50');
  const [searchTerm, setSearchTerm] = useState('');
  
  const transactions = data?.data || [];
  
  // Client-side filtering
  const filteredTransactions = transactions.filter((tx: any) => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filteredTransactions.reduce((acc: any, tx: any) => {
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
      <div className="px-4 py-8 space-y-8 w-full mx-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-zinc-800/60">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Historial</h1>
            <p className="text-sm text-zinc-400 mt-1 font-medium">Revisa y gestiona todos tus movimientos financieros.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-3.5 text-zinc-500 pointer-events-none" />
              <Input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar transacción..." 
                className="pl-9 h-11 bg-zinc-950 border-zinc-800 text-sm w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-11 px-4 font-bold border-zinc-800 shrink-0">
                <Filter size={16} className="mr-2 text-zinc-400"/> Filtros
              </Button>
              <Link href="/transactions/new" className={buttonVariants({ className: "h-11 px-5 font-bold shadow-md bg-indigo-600 hover:bg-indigo-700 text-white shrink-0" })}>
                <Plus size={16} className="mr-2" /> Nuevo
              </Link>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex justify-center py-20"><span className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></span></div>
        ) : filteredTransactions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2 bg-zinc-950/30">
            <CardContent className="flex flex-col items-center pt-6">
              <FileText size={48} className="text-zinc-800 mb-4" />
              <p className="text-zinc-400 font-medium pb-6 text-lg">
                {searchTerm ? 'No hay resultados para tu búsqueda.' : 'Aún no tienes transacciones registradas.'}
              </p>
              {!searchTerm && (
                <Link href="/transactions/new" className={buttonVariants({ className: "h-12 px-6 rounded-full font-bold shadow-lg" })}>
                   Registrar Primer Movimiento
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {Object.keys(grouped).map((groupTitle) => (
              <div key={groupTitle} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                  <h4 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">{groupTitle}</h4>
                  <div className="flex-1 h-px bg-zinc-800/50 ml-2"></div>
                </div>
                
                <Card className="bg-[#09090b] border border-zinc-800/80 shadow-sm overflow-hidden flex flex-col">
                  {/* Table Header (Desktop Only) */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b border-zinc-800/50 bg-zinc-900/30 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <div className="col-span-1"></div>
                    <div className="col-span-4">Concepto</div>
                    <div className="col-span-3">Categoría</div>
                    <div className="col-span-3 text-right">Monto</div>
                    <div className="col-span-1 text-center">Detalle</div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-zinc-800/50">
                    {grouped[groupTitle].map((tx: any) => {
                       const TxIcon = getLucideIcon(tx.category.icon) || FileText;
                       const isIncome = tx.type === 'INCOME';

                       return (
                        <Link 
                          href={`/transactions/${tx.id}`} 
                          key={tx.id} 
                          className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors group cursor-pointer relative"
                        >
                          <div className="flex items-center justify-between md:contents">
                            
                            {/* Icon & Details Wrapper (Mobile Group) / Icon (Desktop col 1) / Concepto (Desktop col 4) */}
                            <div className="flex items-center gap-4 md:col-span-5 overflow-hidden">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-800/60 shadow-inner group-hover:scale-105 transition-transform duration-300" 
                                style={{ backgroundColor: `${tx.category.color}10`, color: tx.category.color }}>
                                <TxIcon size={20} />
                              </div>
                              <div className="truncate">
                                <h4 className="font-bold text-[15px] text-zinc-100 truncate">{tx.description}</h4>
                                <p className="text-[12px] font-medium text-zinc-500 md:hidden mt-0.5">{tx.category.name}</p>
                              </div>
                            </div>
                            
                            {/* Category Badge (Desktop Only col 3) */}
                            <div className="hidden md:flex md:col-span-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-zinc-800 bg-zinc-900/50 text-zinc-300">
                                {tx.category.name}
                              </span>
                            </div>

                            {/* Amount & Arrow (Mobile Group) / Amount (Desktop col 3) / Arrow (Desktop col 1) */}
                            <div className="flex flex-col items-end md:contents shrink-0">
                               <div className="md:col-span-3 text-right">
                                 <div className={`flex items-center justify-end gap-1 font-black text-[16px] tracking-tight ${isIncome ? 'text-emerald-400' : 'text-zinc-100'}`}>
                                    {isIncome ? <ArrowDownRight size={14} className="opacity-80"/> : <ArrowUpRight size={14} className="opacity-70 text-rose-500"/>}
                                    {isIncome ? '+' : '-'}${formatAmount(tx.amount)}
                                 </div>
                               </div>

                               <div className="hidden md:flex md:col-span-1 items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                    <ArrowRight size={14} />
                                  </div>
                               </div>
                            </div>

                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </Card>
              </div>
            ))}
            
            <div className="flex justify-center pt-8 pb-12">
               <Button variant="outline" className="h-12 px-8 rounded-full font-bold shadow-md border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100">
                 Cargar historial antiguo
               </Button>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
