'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDownCircle, Plus, Search, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import Link from 'next/link';
import { formatAmount } from '@/lib/utils'; // asumiendo que existe, si no, lo inyectamos aquí local.

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchIncomes = async () => {
    setLoading(true);
    const res = await api.get<any>(`/api/transactions?type=INCOME&page=${page}&limit=12&search=${encodeURIComponent(search)}`);
    if (!res.error) {
       setIncomes(res.data?.data || []);
       setTotalPages(res.data?.meta?.pages || 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Timeout para la búsqueda
    const delay = setTimeout(fetchIncomes, 300);
    return () => clearTimeout(delay);
  }, [page, search]);

  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));
  const handlePrev = () => setPage(p => Math.max(1, p - 1));

  // Local helper para formateo de moneda (si no existe global)
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
            <ArrowDownCircle size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Registro de Ingresos</h1>
            <p className="text-sm text-zinc-400 font-medium mt-1 uppercase tracking-wider">Aportaciones a la Bóveda</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           {/* Buscador Inmersivo Desktop */}
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <Input 
                 placeholder="Buscar aportación..." 
                 value={search}
                 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                 className="h-12 w-full sm:w-64 pl-10 bg-black border-zinc-800 rounded-xl focus-visible:ring-emerald-500 text-sm font-medium" 
              />
           </div>
           {/* CTA */}
           <Link href="/transactions/new?type=INCOME">
             <Button className="h-12 px-6 font-bold rounded-xl shadow-md shadow-emerald-500/10 bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto transition-transform hover:-translate-y-0.5">
               <Plus size={18} className="mr-2" /> Añadir Ingreso
             </Button>
           </Link>
        </div>
      </div>

      {/* Data Grid / Tablas */}
      <Card className="bg-[#0b0c10] border-zinc-800/50 shadow-2xl rounded-3xl overflow-hidden relative">
        <div className="w-full overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-zinc-950/50 border-b border-zinc-800/50 text-xs font-bold uppercase tracking-widest text-zinc-500">
                    <th className="p-5 pl-6 font-medium whitespace-nowrap">Fecha</th>
                    <th className="p-5 font-medium min-w-[200px]">Descripción del Ingreso</th>
                    <th className="p-5 font-medium whitespace-nowrap">Responsable</th>
                    <th className="p-5 font-medium whitespace-nowrap">Categoría</th>
                    <th className="p-5 pr-6 font-medium text-right whitespace-nowrap">Aportación</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                 {loading ? (
                    <tr>
                       <td colSpan={5} className="p-16 text-center">
                          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto block mb-4"></span>
                          <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Sincronizando Archivos...</span>
                       </td>
                    </tr>
                 ) : incomes.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="p-16 text-center">
                          <FileX size={48} className="text-zinc-700 mx-auto mb-4" />
                          <h3 className="text-zinc-300 font-bold text-lg">Caja Cerrada</h3>
                          <p className="text-zinc-500 text-sm mt-1">No hay entradas registradas en este bloque de búsqueda.</p>
                       </td>
                    </tr>
                 ) : (
                    incomes.map((tx: any) => (
                       <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="p-5 pl-6 whitespace-nowrap">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-200">{format(new Date(tx.date), "dd MMM, yyyy", { locale: es })}</span>
                                <span className="text-xs text-zinc-600 font-semibold">{format(new Date(tx.date), "HH:mm")}</span>
                             </div>
                          </td>
                          <td className="p-5">
                             <p className="text-base font-bold text-white leading-tight">{tx.description}</p>
                             {tx.notes && <p className="text-xs text-zinc-500 mt-1 truncate max-w-sm">{tx.notes}</p>}
                          </td>
                          <td className="p-5 whitespace-nowrap">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                                   {tx.createdBy.avatarUrl ? <img src={tx.createdBy.avatarUrl} className="w-full h-full object-cover"/> : <span className="text-[10px] text-zinc-400 font-bold uppercase">{tx.createdBy.name.charAt(0)}</span>}
                                </div>
                                <span className="text-sm font-semibold text-zinc-400 truncate w-24">{tx.createdBy.name}</span>
                             </div>
                          </td>
                          <td className="p-5 whitespace-nowrap">
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-bold tracking-wider uppercase">
                                <span className="text-sm">{tx.category.icon}</span> {tx.category.name}
                             </span>
                          </td>
                          <td className="p-5 pr-6 whitespace-nowrap text-right">
                             <div className="flex flex-col items-end">
                                <span className="font-black text-emerald-400 text-lg tracking-tight">+{formatMoney(tx.amount)}</span>
                                <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest">{tx.paymentMethod?.alias || 'Digital'}</span>
                             </div>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>

        {/* Paginador Elegante */}
        {!loading && totalPages > 1 && (
           <div className="border-t border-zinc-800/50 p-4 bg-zinc-950/80 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest pl-2">
                 Página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-2 pr-2">
                 <Button variant="outline" size="icon" onClick={handlePrev} disabled={page === 1} className="h-9 w-9 rounded-xl border-zinc-800 text-zinc-400 hover:text-white bg-black">
                    <ChevronLeft size={16} />
                 </Button>
                 <Button variant="outline" size="icon" onClick={handleNext} disabled={page === totalPages} className="h-9 w-9 rounded-xl border-zinc-800 text-zinc-400 hover:text-white bg-black">
                    <ChevronRight size={16} />
                 </Button>
              </div>
           </div>
        )}
      </Card>
    </div>
  );
}
