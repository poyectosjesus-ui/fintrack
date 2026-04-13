'use client';

import { useState, useEffect } from 'react';
import { Calendar, Play, Pause, Plus, CreditCard, RotateCcw, Trash2, ListFilter, CalendarDays, Activity } from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatAmount } from '@/lib/format';
import { getLucideIcon } from '@/lib/icon-mapper';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SubscriptionsPage() {
  const { data, loading, refetch } = useApi<any>('/api/subscriptions');
  const subscriptions = Array.isArray(data) ? data : data?.data || [];

  const [categories, setCategories] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
     name: '',
     amount: '',
     categoryId: '',
     subCategory: 'STREAMING',
     billingCycle: 'MONTHLY',
     startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    // Cargar solo categorías de tipo Gasto
    api.get<any[]>('/api/categories').then((res) => {
      if (res.data) setCategories(res.data.filter((c: any) => c.type === 'EXPENSE'));
    });
  }, []);

  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'ACTIVE');
  const monthlyTotal = activeSubscriptions.reduce((acc: number, s: any) => {
    return acc + Number(s.amount);
  }, 0);

  const sortedSubs = [...subscriptions].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ACTIVE' ? -1 : 1;
    if (a.nextBillingDate && b.nextBillingDate) return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
    return 0;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('¿Cancelar esta suscripción? Dejará de contabilizarse en tus gráficos futuros.')) {
      const res = await api.delete(`/api/subscriptions/${id}`);
      if (!res.error) {
        refetch();
      } else {
        alert(res.error);
      }
    }
  };

  const handleCreate = async () => {
    setErrorMsg('');
    const amt = parseFloat(formData.amount);
    
    if (!formData.name.trim()) return setErrorMsg('El nombre es obligatorio');
    if (!formData.categoryId) return setErrorMsg('Selecciona la categoría contenedora');
    if (!amt || amt <= 0) return setErrorMsg('El monto debe ser numérico y mayor a 0');

    setIsSubmitting(true);
    const res = await api.post('/api/subscriptions', {
       ...formData,
       amount: amt,
       startDate: new Date(formData.startDate).toISOString()
    });
    setIsSubmitting(false);

    if (res.error) {
       setErrorMsg(res.error);
    } else {
       setIsCreateOpen(false);
       setFormData({ name: '', amount: '', categoryId: '', subCategory: 'STREAMING', billingCycle: 'MONTHLY', startDate: new Date().toISOString().split('T')[0] });
       refetch();
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-zinc-800/60">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Suscripciones Saas & Servicios</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Controla tus pagos fijos, licencias de software y entretenimiento.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="h-11 px-6 font-bold rounded-full shadow-md bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
          <Plus size={16} className="mr-2" /> Añadir Servicio
        </Button>
      </div>

      <div className="space-y-8">
        
        {/* Info Hero Modulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <RotateCcw size={16} />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Próximo Cobro Programado</p>
              </div>
              <p className="text-white font-black text-3xl mt-1 truncate">
                {sortedSubs.length > 0 && sortedSubs[0].status === 'ACTIVE' ? sortedSubs[0].name : 'Ninguno en agenda'}
              </p>
              {sortedSubs.length > 0 && sortedSubs[0].status === 'ACTIVE' && sortedSubs[0].nextBillingDate && (
                 <p className="text-indigo-400 text-sm font-medium mt-1">
                   Cobro en: <span className="text-white font-bold">{format(new Date(sortedSubs[0].nextBillingDate), "dd MMM, yyyy", { locale: es })}</span>
                 </p>
              )}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors pointer-events-none" />
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 mb-2 text-rose-400">
                <CreditCard size={16} />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Flujo de Dinero Asignado</p>
              </div>
              <p className="text-white font-black text-4xl mt-1">
                {loading ? '...' : <span className="tracking-tighter">${formatAmount(monthlyTotal)}</span>}
              </p>
              <p className="text-rose-400 text-sm font-medium mt-1">
                 Monto gastado sistemáticamente al <strong className="text-white">Mes</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Subscriptions Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg px-2 flex items-center gap-2">
            <Activity size={18} className="text-zinc-500" />
            Vigilancia de Software y Retenciones
          </h3>

          {loading ? (
             <div className="flex justify-center p-12"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></span></div>
          ) : sortedSubs.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-16 text-center bg-zinc-950 border border-zinc-800 border-dashed rounded-3xl">
                <RotateCcw size={48} className="text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-medium text-lg">No has detectado ningún proveedor SaaS o servicio doméstico recurrente.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {sortedSubs.map((sub: any) => {
                const isActive = sub.status === 'ACTIVE';
                const SubIcon = getLucideIcon(sub.category.icon) || Play;
                
                return (
                  <div key={sub.id} className={`bg-[#0d0d0f] rounded-3xl p-6 shadow-xl border ${isActive ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60 grayscale'} hover:border-zinc-700 transition-all flex justify-between relative overflow-hidden group`}>
                    
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 pointer-events-none rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 bg-indigo-500 transition-opacity" />

                    <div className="flex gap-5 items-center overflow-hidden relative z-10 w-full">
                      <div className="w-16 h-16 rounded-[20px] flex items-center justify-center text-white drop-shadow-xl shadow-inner border border-white/10 shrink-0" style={{ backgroundColor: sub.category.color || '#4f46e5' }}>
                        <SubIcon size={24} />
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-zinc-100 text-xl truncate tracking-tight">{sub.name}</h4>
                          {isActive ? (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                              <Play size={8} className="fill-current"/> Activo
                            </span>
                          ) : (
                            <span className="bg-zinc-800/50 border border-zinc-700 text-zinc-500 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                              <Pause size={8} className="fill-current"/> Cancelado
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-zinc-500 font-medium mt-1">
                          <span className="flex items-center gap-1.5"><ListFilter size={12}/> {sub.subCategory}</span>
                          {isActive && sub.nextBillingDate && (
                            <span className="flex items-center gap-1.5"><Calendar size={12}/> Cobro el {format(new Date(sub.nextBillingDate), "dd MMM", { locale: es })}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-center shrink-0">
                        <span className={`font-black tracking-tighter text-2xl ${isActive ? 'text-zinc-100' : 'text-zinc-600 line-through'}`}>
                          ${formatAmount(sub.amount)} <span className="text-zinc-500 text-sm font-medium">{sub.currency}</span>
                        </span>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 mt-1">{sub.billingCycle}</p>
                      </div>
                    </div>

                    {/* Boton secreto eliminar */}
                    <div className="absolute top-4 right-4 z-30">
                       <Button variant="ghost" size="icon" onClick={(e) => handleDelete(sub.id, e)} className={`text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 hover:text-rose-500 w-8 h-8 rounded-full shadow-inner bg-zinc-950 border border-zinc-800/50 ${!isActive && 'hidden'}`}>
                          <Trash2 size={14} />
                       </Button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Creación de Suscripción Pantalla Completa */}
      {isCreateOpen && (
         <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
            <DialogContent onClose={() => setIsCreateOpen(false)} className="max-w-xl border-zinc-800 overflow-hidden md:h-auto h-[90vh] overflow-y-auto w-full">
               <DialogHeader className="mb-2">
                  <DialogTitle className="text-xl">Enlazar Proveedor Recurrente</DialogTitle>
                  <DialogDescription className="text-zinc-400 mt-2">
                    Automatiza el registro de facturas emitidas por software o servicios.
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-6 pb-6 mt-2">

                 <div className="grid gap-2">
                   <Label className="text-zinc-400">Nombre Comercial (Ej. Netflix, AWS, Gym)</Label>
                   <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Escribe el nombre del proveedor..." className="h-12 bg-[#0d0d0f] border-zinc-800 focus-visible:ring-indigo-500 font-semibold" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="grid gap-2">
                     <Label className="text-zinc-400">Cargo de Factura ($)</Label>
                     <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="120.00" className="h-12 bg-[#0d0d0f] border-zinc-800 text-lg font-bold" />
                   </div>
                   <div className="grid gap-2">
                     <Label className="text-zinc-400 flex items-center gap-1"><CalendarDays size={14}/> Ciclo de Cobro</Label>
                     <div className="relative">
                        <select value={formData.billingCycle} onChange={(e) => setFormData({...formData, billingCycle: e.target.value})} className="flex h-12 w-full appearance-none rounded-md border border-zinc-800 bg-[#0d0d0f] px-4 py-2 text-sm font-semibold text-zinc-100 focus:border-indigo-500">
                          <option value="MONTHLY">Mensual</option>
                          <option value="WEEKLY">Semanal</option>
                          <option value="QUARTERLY">Trimestral</option>
                          <option value="ANNUAL">Anual</option>
                        </select>
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                       <Label className="text-zinc-400 flex items-center gap-1"><ListFilter size={14}/> Categoría Asignada</Label>
                       <div className="relative">
                          <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="flex h-12 w-full appearance-none rounded-md border border-zinc-800 bg-[#0d0d0f] px-4 py-2 text-sm text-zinc-100 focus:border-indigo-500">
                            <option value="">Clasificar gasto en...</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                       </div>
                     </div>
                     <div className="grid gap-2">
                       <Label className="text-zinc-400 flex items-center gap-1"><Activity size={14}/> Clasificación SaaS</Label>
                       <div className="relative">
                          <select value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} className="flex h-12 w-full appearance-none rounded-md border border-zinc-800 bg-[#0d0d0f] px-4 py-2 text-sm text-zinc-100 focus:border-indigo-500">
                            <option value="STREAMING">Entretenimiento & Streaming</option>
                            <option value="MUSIC">Música</option>
                            <option value="PRODUCTIVITY">Productividad (Notion, Office)</option>
                            <option value="STORAGE">Almacenamiento Cloud</option>
                            <option value="WORK_TOOL">Herramientas de Trabajo</option>
                            <option value="HEALTH">Salud y Deporte</option>
                            <option value="GAMING">Videojuegos (Xbox, PS)</option>
                            <option value="AI_TOOL">Herramientas IA (ChatGPT, Claude)</option>
                            <option value="OTHER">Servicios del Hogar (Internet, Luz)</option>
                          </select>
                       </div>
                     </div>
                 </div>

                 <div className="grid gap-2">
                   <Label className="text-zinc-400">Fecha del Siguiente Corte Registrado</Label>
                   <Input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="h-12 bg-[#0d0d0f] border-zinc-800 font-semibold" />
                 </div>

                 {errorMsg && <p className="text-sm font-bold text-rose-500 text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{errorMsg}</p>}

               </div>

               <DialogFooter className="border-t border-zinc-800/80 -mx-6 -mb-6 p-4 bg-zinc-900/10 sm:justify-end">
                  <Button variant="outline" className="border-zinc-700" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Descartar</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 shadow-lg shadow-indigo-600/20" onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Enlazando...' : 'Dar de Alta'}</Button>
               </DialogFooter>

            </DialogContent>
         </Dialog>
      )}

    </div>
  );
}
