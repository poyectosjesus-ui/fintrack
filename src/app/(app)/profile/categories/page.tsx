'use client';

import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { 
  ArrowLeft, Trash2, Plus, Tag, ArrowUp, ArrowDown, Check,
  ShoppingCart, Home, Car, Plane, Coffee, Dumbbell, Tv, Banknote, 
  Gamepad2, Utensils, Shirt, Music, HeartPulse, Laptop, PiggyBank, 
  CreditCard, TrendingUp, TrendingDown, Receipt, Wallet, Flame
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getLucideIcon } from '@/lib/icon-mapper';

import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const PRESET_ICONS = [
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'Plane', icon: Plane },
  { name: 'Coffee', icon: Coffee },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Tv', icon: Tv },
  { name: 'Banknote', icon: Banknote },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Utensils', icon: Utensils },
  { name: 'Shirt', icon: Shirt },
  { name: 'Music', icon: Music },
  { name: 'HeartPulse', icon: HeartPulse },
  { name: 'Laptop', icon: Laptop },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Receipt', icon: Receipt },
  { name: 'Wallet', icon: Wallet },
  { name: 'Flame', icon: Flame },
];

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', 
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', 
  '#d946ef', '#ec4899', '#f43f5e', '#64748b'
];

export default function CategoryManagerPage() {
  const { data: categoriesData, loading, refetch } = useApi<any[]>('/api/categories');
  const categories = categoriesData || [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: 'Tag', color: '#6366f1', type: 'EXPENSE' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta categoría permanentemente?')) {
      const res = await api.delete(`/api/categories/${id}`);
      if (!res.error) {
        refetch(); // Llamado correcto para refrescar la vista
      } else {
        alert(res.error);
      }
    }
  };

  const handleCreate = async () => {
    setErrorMsg('');
    if (!formData.name.trim()) return setErrorMsg('El nombre es obligatorio');
    if (!formData.color.startsWith('#') || formData.color.length !== 7) return setErrorMsg('Color hexadecimal inválido');
    if (!formData.icon) return setErrorMsg('Selecciona un ícono');
    
    setIsSubmitting(true);
    const res = await api.post('/api/categories', formData);
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setIsCreateOpen(false);
      setFormData({ name: '', icon: 'Tag', color: '#6366f1', type: 'EXPENSE' });
      refetch(); // Refrescar los componentes
    }
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-4">
          <Link href="/profile" className={buttonVariants({ variant: 'outline', size: 'icon', className: "rounded-full h-11 w-11 border-zinc-800 text-zinc-400 hover:text-white shrink-0" })}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Categorías</h1>
            <p className="text-sm text-zinc-400 mt-1 font-medium">Administra los catálogos para clasificar tus movimientos.</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="h-11 px-6 font-bold rounded-full shadow-md bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
          <Plus size={16} className="mr-2" /> Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Expenses Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-rose-500 flex items-center gap-2 text-lg uppercase tracking-wider bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
               <ArrowUp size={20} /> Egresos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.filter(c => c.type === 'EXPENSE').map(c => (
                <CategoryCard key={c.id} category={c} onDelete={handleDelete} />
              ))}
            </div>
          </div>

          {/* Income Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-emerald-500 flex items-center gap-2 text-lg uppercase tracking-wider bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
               <ArrowDown size={20} /> Ingresos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.filter(c => c.type === 'INCOME').map(c => (
                <CategoryCard key={c.id} category={c} onDelete={handleDelete} />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Create Dialog with Icon Picker */}
      {isCreateOpen && (
         <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
           <DialogContent onClose={() => setIsCreateOpen(false)} className="max-w-xl border-zinc-800 overflow-hidden md:h-auto h-[90vh] overflow-y-auto">
             <DialogHeader className="mb-2">
               <DialogTitle className="text-xl">Crear Categoría</DialogTitle>
               <DialogDescription className="text-zinc-400 mt-2">
                 Personaliza y define tus transacciones a detalle.
               </DialogDescription>
             </DialogHeader>
             
             <div className="space-y-6 pb-6">
                
                <div className="flex p-1 bg-zinc-900 rounded-xl w-full border border-zinc-800">
                  <Button type="button" variant={formData.type === 'EXPENSE' ? 'secondary' : 'ghost'} onClick={() => setFormData({...formData, type: 'EXPENSE'})} className={`flex-1 flex gap-2 h-11 ${formData.type === 'EXPENSE' ? 'text-rose-400 bg-zinc-800 shadow-sm' : 'text-zinc-500'}`}>
                    <ArrowUp size={16} /> Gasto
                  </Button>
                  <Button type="button" variant={formData.type === 'INCOME' ? 'secondary' : 'ghost'} onClick={() => setFormData({...formData, type: 'INCOME'})} className={`flex-1 flex gap-2 h-11 ${formData.type === 'INCOME' ? 'text-emerald-400 bg-zinc-800 shadow-sm' : 'text-zinc-500'}`}>
                    <ArrowDown size={16} /> Ingreso
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label className="text-zinc-400">Nombre</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Freelance, Comida, Viajes..." className="bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500" />
                </div>

                <div className="grid gap-2">
                  <Label className="text-zinc-400">Color Elegido</Label>
                  <div className="flex flex-wrap gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl justify-center">
                    {PRESET_COLORS.map(color => (
                       <button
                         key={color}
                         onClick={() => setFormData({...formData, color})}
                         className="w-8 h-8 rounded-full border-2 border-zinc-900 transition-transform hover:scale-110 flex items-center justify-center shadow-sm"
                         style={{ backgroundColor: color }}
                       >
                         {formData.color === color && <Check size={16} className="text-white drop-shadow-md" />}
                       </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 pb-4">
                  <Label className="text-zinc-400">Ícono Visual</Label>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl h-48 overflow-y-auto">
                    {PRESET_ICONS.map(({ name, icon: IconComponent }) => {
                       const isSelected = formData.icon === name;
                       return (
                         <button
                           key={name}
                           onClick={() => setFormData({...formData, icon: name})}
                           className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
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
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8" onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Crear'}</Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
      )}

    </div>
  );
}

function CategoryCard({ category, onDelete }: { category: any, onDelete: (id: string) => void }) {
  const Icon = getLucideIcon(category.icon) || Tag;
  const isSystem = category.scope === 'SYSTEM';

  return (
    <Card className="bg-[#09090b] border border-zinc-800 overflow-hidden relative group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ backgroundColor: category.color }} />
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-700/50 shadow-inner" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
            <Icon size={18} />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-zinc-100 text-sm truncate">{category.name}</h4>
            {isSystem ? (
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800 px-1.5 py-0.5 rounded flex items-center w-max mt-1">Sistema</span>
            ) : (
               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded flex items-center w-max mt-1">Personal</span>
            )}
          </div>
        </div>

        {!isSystem && (
           <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10">
             <Trash2 size={16} />
           </Button>
        )}
      </CardContent>
    </Card>
  );
}
