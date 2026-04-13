'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { formatAmount } from '@/lib/format';
import { getLucideIcon } from '@/lib/icon-mapper';
import { Plus, Wallet, AlertCircle, Trash2, CalendarDays, ListFilter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BudgetsPage() {
  const { data, loading, refetch } = useApi<any>('/api/budgets');
  const budgets = Array.isArray(data) ? data : data?.data || [];

  const [categories, setCategories] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ categoryId: '', amount: '', period: 'MONTHLY', alertAt: 80 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Cargar solo categorías de tipo Gasto
    api.get<any[]>('/api/categories').then((res) => {
      if (res.data) setCategories(res.data.filter((c: any) => c.type === 'EXPENSE'));
    });
  }, []);

  const handleCreate = async () => {
    setErrorMsg('');
    const amt = parseFloat(formData.amount);
    
    if (!formData.categoryId) return setErrorMsg('Selecciona una categoría');
    if (!amt || amt <= 0) return setErrorMsg('El monto debe ser mayor a 0');

    setIsSubmitting(true);
    const res = await api.post('/api/budgets', {
       ...formData,
       amount: amt
    });
    setIsSubmitting(false);

    if (res.error) {
       setErrorMsg(res.error);
    } else {
       setIsCreateOpen(false);
       setFormData({ categoryId: '', amount: '', period: 'MONTHLY', alertAt: 80 });
       refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este límite de presupuesto de forma permantente?')) {
      const res = await api.delete(`/api/budgets/${id}`);
      if (!res.error) {
        refetch();
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-zinc-800/60">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Presupuestos</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Establece límites de dinero por periodos y controla el sobregasto.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="h-11 px-6 font-bold rounded-full shadow-md bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
          <Plus size={16} className="mr-2" /> Nuevo Límite
        </Button>
      </div>

      <div>
        {loading ? (
             <div className="flex justify-center p-12"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></span></div>
          ) : budgets.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-16 text-center bg-zinc-950 border border-zinc-800 border-dashed rounded-3xl">
                <Wallet size={48} className="text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-medium text-lg">No has establecido ningún límite de presupuesto aún.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {budgets.map((bg: any) => {
                 const pct = Math.min(((bg.spent || 0) / bg.amount) * 100, 100);
                 const isAlert = pct >= bg.alertAt;
                 const BgIcon = getLucideIcon(bg.category.icon);
                 
                 return (
                   <div key={bg.id} className="bg-zinc-950 rounded-3xl p-6 shadow-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col justify-between group relative overflow-hidden">
                     {/* Glow */}
                     <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none rounded-full blur-[50px] -translate-y-1/3 translate-x-1/3 ${isAlert ? 'bg-rose-500' : 'bg-indigo-500'}`} />

                     <div className="flex items-center justify-between mb-6 relative z-10">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-zinc-700/50" style={{ backgroundColor: `${bg.category.color}15`, color: bg.category.color }}>
                           <BgIcon size={24} />
                         </div>
                         <div>
                           <h3 className="font-bold text-zinc-100 text-lg leading-tight">{bg.category.name}</h3>
                           <p className="text-xs text-zinc-500 font-medium mt-0.5 uppercase tracking-widest">{bg.period}</p>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          {isAlert && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2 rounded-full flex shrink-0 animate-pulse" title={`Alerta de límite superando el ${bg.alertAt}%`}>
                              <AlertCircle size={18} />
                            </div>
                          )}
                       </div>
                     </div>

                     <div className="relative z-10">
                       <div className="flex justify-between items-end mb-3">
                         <div>
                           <span className={`font-black text-2xl ${isAlert ? 'text-rose-400' : 'text-white'}`}>${formatAmount(bg.spent || 0)}</span>
                           <span className="text-zinc-500 text-sm font-semibold ml-2">/ ${formatAmount(bg.amount)}</span>
                         </div>
                         <span className={`text-sm font-black ${isAlert ? 'text-rose-400' : 'text-zinc-400'}`}>{pct.toFixed(0)}%</span>
                       </div>

                       <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner border border-zinc-800">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${isAlert ? 'bg-gradient-to-r from-rose-500 to-rose-400' : ''}`} 
                           style={{ 
                             width: `${pct}%`, 
                             backgroundColor: isAlert ? undefined : bg.category.color,
                             boxShadow: isAlert ? 'none' : `inset 0 0 10px ${bg.category.color}80` 
                           }} 
                         />
                       </div>
                     </div>

                     <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(bg.id)}>
                        <Trash2 size={16} />
                     </Button>
                   </div>
                 )
               })}
             </div>
          )}
      </div>

      {/* Modern Create Modal */}
      {isCreateOpen && (
         <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
            <DialogContent onClose={() => setIsCreateOpen(false)} className="max-w-md border-zinc-800">
               <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl">Fijar Presupuesto</DialogTitle>
                  <DialogDescription className="text-zinc-400">Restringe los excesos asignando un límite máximo a una categoría.</DialogDescription>
               </DialogHeader>

               <div className="space-y-6 pb-6">
                 
                 <div className="grid gap-2">
                   <Label className="text-zinc-400">Cantidad Límite ($)</Label>
                   <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="Ej. 15000.00" className="h-12 bg-zinc-950 border-zinc-800 text-lg font-bold" />
                 </div>

                 <div className="grid gap-2">
                   <Label className="text-zinc-400 flex items-center gap-1"><ListFilter size={14}/> Aplicar a la Categoría</Label>
                   <div className="relative">
                      <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="flex h-12 w-full appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 focus:border-indigo-500">
                        <option value="">Selecciona qué categoría limitar...</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                   </div>
                 </div>

                 <div className="grid gap-2">
                   <Label className="text-zinc-400 flex items-center gap-1"><CalendarDays size={14}/> Periodicidad</Label>
                   <div className="relative">
                      <select value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} className="flex h-12 w-full appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 focus:border-indigo-500">
                        <option value="WEEKLY">Semanal</option>
                        <option value="BIWEEKLY">Quincenal</option>
                        <option value="MONTHLY">Mensual</option>
                        <option value="ANNUAL">Anual</option>
                      </select>
                   </div>
                 </div>

                 {errorMsg && <p className="text-sm font-bold text-rose-500 text-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{errorMsg}</p>}

               </div>

               <DialogFooter className="border-t border-zinc-800/80 -mx-6 -mb-6 p-4 bg-zinc-900/30 sm:justify-end">
                  <Button variant="outline" className="border-zinc-700" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8" onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Aplicar Límite'}</Button>
               </DialogFooter>

            </DialogContent>
         </Dialog>
      )}

    </div>
  );
}
