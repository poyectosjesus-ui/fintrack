'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewTransactionMobile() {
  const router = useRouter();
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    api.get<any[]>('/api/categories').then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 200);
  };

  const handleSave = async () => {
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setError('El monto debe ser mayor a 0');
    if (!categoryId) return setError('Selecciona una categoría');
    if (!description.trim()) return setError('Escribe un concepto');

    setLoading(true);
    const res = await api.post('/api/transactions', {
      type,
      amount: amt,
      categoryId,
      description,
      currency: 'MXN'
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push('/transactions');
      router.refresh();
    }
  };

  const isIncome = type === 'INCOME';

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent onClose={closeModal} className="overflow-hidden p-0 border-zinc-800">
        
        <div className="p-6 pb-2 border-b border-zinc-800/50 relative">
          <div className={`absolute inset-0 opacity-10 blur-xl transition-colors duration-500 pointer-events-none ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <DialogHeader className="relative z-10">
            <DialogTitle>Nuevo Registro</DialogTitle>
            <DialogDescription>Añade una nueva transacción financiera a tu historial.</DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Toggle Type */}
          <div className="flex p-1 bg-zinc-900 rounded-xl w-full border border-zinc-800">
            <Button 
              type="button"
              variant={!isIncome ? 'secondary' : 'ghost'}
              onClick={() => setType('EXPENSE')}
              className={`flex-1 flex gap-2 h-11 ${!isIncome ? 'text-rose-400 bg-zinc-800 hover:text-rose-300 shadow-sm' : 'text-zinc-500'}`}
            >
              <ArrowUp size={16} /> Gasto
            </Button>
            <Button 
              type="button"
              variant={isIncome ? 'secondary' : 'ghost'}
              onClick={() => setType('INCOME')}
              className={`flex-1 flex gap-2 h-11 ${isIncome ? 'text-emerald-400 bg-zinc-800 hover:text-emerald-300 shadow-sm' : 'text-zinc-500'}`}
            >
              <ArrowDown size={16} /> Ingreso
            </Button>
          </div>

          <div className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="amount" className="ml-1 text-zinc-400">{isIncome ? 'Dinero Recibido' : 'Dinero Gastado'}</Label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-zinc-500 font-bold text-lg select-none pointer-events-none">$</span>
                <Input 
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-11 h-12 text-lg font-bold bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500/30"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category" className="ml-1 text-zinc-400">Categoría</Label>
              <div className="relative">
                <select 
                  id="category"
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-12 w-full appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
                >
                  <option value="" className="text-zinc-500">Seleccionar categoría...</option>
                  {categories.filter(c => c.type === type).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                  <ArrowDown size={14} />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="ml-1 text-zinc-400">Concepto / Nombre</Label>
              <Input 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Gasolina o Pago Quincenal..."
                className="h-12 px-4 bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500/30"
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-rose-500 text-center">{error}</p>}
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={closeModal} className="w-full sm:w-auto mt-2 sm:mt-0">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className={`w-full sm:w-auto ${isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Guardando...' : 'Confirmar Transacción'}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
