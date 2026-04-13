'use client';

import { useState } from 'react';
import { ChevronRight, Plus, Target, Trash2, ShieldAlert, Plane, Home, Car, GraduationCap, TrendingUp, MonitorSmartphone, Heart, Baby, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { formatAmount, formatCompact } from '@/lib/format';
import { getLucideIcon } from '@/lib/icon-mapper';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_ICONS = [
  { name: 'Target', icon: Target },
  { name: 'ShieldAlert', icon: ShieldAlert },
  { name: 'Plane', icon: Plane },
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'MonitorSmartphone', icon: MonitorSmartphone },
  { name: 'Heart', icon: Heart },
  { name: 'Baby', icon: Baby },
  { name: 'Sparkles', icon: Sparkles }
];

export default function SavingsPage() {
  const { data, loading, refetch } = useApi<any>('/api/savings');
  // Solución segura a los array desenvueltos:
  const goals = Array.isArray(data) ? data : data?.data || [];

  const totalSaved = goals.reduce((acc: number, g: any) => acc + Number(g.currentAmount), 0);

  // States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', targetAmount: '', icon: 'Target', type: 'CUSTOM' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // prevenir navegar al dar clic al Trash.
    if (confirm('¿Abandonar y eliminar permanentemente esta vía de ahorro?')) {
      const res = await api.delete(`/api/savings/${id}`);
      if (!res.error) {
        refetch();
      } else {
        alert(res.error);
      }
    }
  };

  const handleCreate = async () => {
    setErrorMsg('');
    const amt = parseFloat(formData.targetAmount);
    
    if (!formData.name.trim()) return setErrorMsg('El nombre de la meta es obligatorio');
    if (!amt || amt <= 0) return setErrorMsg('El monto objetivo debe ser mayor a 0');
    if (!formData.icon) return setErrorMsg('Selecciona un icono base');

    setIsSubmitting(true);
    const res = await api.post('/api/savings', {
       ...formData,
       targetAmount: amt
    });
    setIsSubmitting(false);

    if (res.error) {
       setErrorMsg(res.error);
    } else {
       setIsCreateOpen(false);
       setFormData({ name: '', targetAmount: '', icon: 'Target', type: 'CUSTOM' });
       refetch();
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-zinc-800/60">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Metas de Ahorro</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Asigna fondos a diferentes propósitos a corto y largo plazo.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="h-11 px-6 font-bold rounded-full shadow-md bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
          <Plus size={16} className="mr-2" /> Nueva Meta
        </Button>
      </div>

      <div className="space-y-8">
        
        {/* Total Savings Hero */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Target size={18} />
              <p className="font-semibold text-sm uppercase tracking-wider">Ahorro Acumulado</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              {loading ? '...' : <span className="tracking-tighter">${formatAmount(totalSaved)}</span>}
            </h2>
          </div>

          {!loading && goals.length > 0 && (
             <div className="relative z-10 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-4 flex gap-6">
                <div>
                   <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Metas Activas</p>
                   <p className="text-2xl font-bold text-zinc-100">{goals.length}</p>
                </div>
             </div>
          )}
        </div>

        {/* Goals Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg px-2 flex items-center gap-2">
            <Target size={18} className="text-emerald-500" />
            Vías de Ahorro
          </h3>

          {loading ? (
             <div className="flex justify-center p-8"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></span></div>
          ) : goals.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-16 text-center bg-zinc-950 border border-zinc-800 border-dashed rounded-3xl">
                <Target size={48} className="text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-medium text-lg">No has establecido ninguna reserva de capital para el futuro.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal: any) => {
                const current = Number(goal.currentAmount);
                const target = Number(goal.targetAmount);
                const pct = Math.min((current / target) * 100, 100);
                const GoalIcon = getLucideIcon(goal.icon || 'Target');
                
                return (
                  <Link href={`/savings/${goal.id}/add`} key={goal.id} className="group bg-zinc-950 rounded-3xl p-6 shadow-xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Hover Glow Component */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 pointer-events-none rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 bg-emerald-500 transition-opacity" />

                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        {/* Circular ring */}
                        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                            <circle cx="32" cy="32" r="28" fill="none" className="stroke-zinc-900" strokeWidth="6" />
                            <circle 
                              cx="32" cy="32" r="28" fill="none" 
                              className="transition-all duration-1000 delay-300 stroke-current text-emerald-500"
                              strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={176} strokeDashoffset={176 - (176 * pct) / 100}
                            />
                          </svg>
                          <span className="absolute text-emerald-400 group-hover:scale-110 transition-transform">
                            <GoalIcon size={22} />
                          </span>
                        </div>

                        <div className="overflow-hidden">
                          <h4 className="font-bold text-zinc-100 text-lg truncate group-hover:text-emerald-400 transition-colors">{goal.name}</h4>
                          <span className="text-sm font-semibold text-emerald-400 mt-1 block tracking-tight">
                            {pct.toFixed(1)}% <span className="text-zinc-600 font-medium">acumulado</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 pointer-events-none transition-colors shrink-0 z-20">
                         <ChevronRight size={16} />
                      </div>
                    </div>

                    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800/50 flex justify-between items-center relative z-10">
                      <div>
                         <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Captado</p>
                         <p className="font-black tracking-tight text-white">${formatAmount(current)}</p>
                      </div>
                      <div className="h-8 w-px bg-zinc-800" />
                      <div className="text-right">
                         <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Objetivo</p>
                         <p className="font-black tracking-tight text-zinc-400">${formatAmount(target)}</p>
                      </div>
                    </div>

                    {/* Boton secreto eliminar */}
                    <div className="absolute top-4 right-4 z-30">
                       <Button variant="ghost" size="icon" onClick={(e) => handleDelete(goal.id, e)} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 hover:text-rose-500 w-8 h-8 rounded-full shadow-inner bg-zinc-950 border border-zinc-800/50">
                          <Trash2 size={14} />
                       </Button>
                    </div>

                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Creación de Ahorro Modal Avanzado */}
      {isCreateOpen && (
         <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
            <DialogContent onClose={() => setIsCreateOpen(false)} className="max-w-md border-zinc-800 overflow-hidden md:h-auto h-[90vh] overflow-y-auto">
               <DialogHeader className="mb-2">
                  <DialogTitle className="text-xl">Fijar Nuevo Ahorro</DialogTitle>
                  <DialogDescription className="text-zinc-400 mt-2">
                    Visualiza y bloquea el capital destinado a sueños o resguardos.
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-6 pb-6 mt-2">
                 
                 <div className="grid gap-2">
                   <Label className="text-zinc-400">Nombre del Fondo</Label>
                   <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ej. Fondo de Emergencia, Enganche Auto..." className="h-12 bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 font-semibold" />
                 </div>

                 <div className="grid gap-2">
                   <Label className="text-zinc-400">Patrimonio Meta ($)</Label>
                   <Input type="number" value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} placeholder="Ej. 150000.00" className="h-12 bg-zinc-950 border-zinc-800 text-lg font-bold" />
                 </div>

                 <div className="grid gap-2">
                   <Label className="text-zinc-400">Naturaleza Comercial</Label>
                   <div className="relative">
                      <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="flex h-12 w-full appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-100 focus:border-emerald-500">
                        <option value="CUSTOM">Metas Generales</option>
                        <option value="EMERGENCY">Fondo de Emergencia (Seguridad)</option>
                        <option value="VACATION">Vacaciones</option>
                        <option value="HOME">Casa / Hipoteca</option>
                        <option value="CAR">Vehículo / Movilidad</option>
                        <option value="EDUCATION">Educación y Universidades</option>
                        <option value="INVESTMENT">Inversión y Negocios</option>
                      </select>
                   </div>
                 </div>

                 <div className="grid gap-2 pb-2">
                  <Label className="text-zinc-400">Emblema Visual</Label>
                  <div className="grid grid-cols-6 sm:grid-cols-6 gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    {PRESET_ICONS.map(({ name, icon: IconComponent }) => {
                       const isSelected = formData.icon === name;
                       return (
                         <button
                           key={name}
                           onClick={() => setFormData({...formData, icon: name})}
                           className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-600 text-white shadow-lg scale-110' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                         >
                           <IconComponent size={20} />
                         </button>
                       )
                    })}
                  </div>
                </div>

                 {errorMsg && <p className="text-sm font-bold text-rose-500 text-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{errorMsg}</p>}

               </div>

               <DialogFooter className="border-t border-zinc-800/80 -mx-6 -mb-6 p-4 bg-zinc-900/30 sm:justify-end">
                  <Button variant="outline" className="border-zinc-700" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8" onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Preparando...' : 'Establecer Meta'}</Button>
               </DialogFooter>

            </DialogContent>
         </Dialog>
      )}

    </div>
  );
}
