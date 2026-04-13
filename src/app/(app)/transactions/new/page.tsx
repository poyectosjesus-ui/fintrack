'use client';

import { BottomSheet } from '@/components/native/BottomSheet';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function NewTransactionMobile() {
  const router = useRouter();
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories
  useEffect(() => {
    api.get<any[]>('/api/categories').then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

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
      router.push('/transactions'); // Native reload equivalent
      router.refresh();
    }
  };

  return (
    <BottomSheet title="Nuevo Registro">
      <div className="py-4 space-y-6">
        
        {/* Toggle Type */}
        <div className="flex p-1 bg-zinc-800/50 rounded-2xl w-full">
          <button 
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`flex-1 py-2 text-sm font-bold rounded-xl shadow transition-colors ${type === 'EXPENSE' ? 'bg-zinc-700/80 shadow-black text-rose-400' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            Gasto (-)
          </button>
          <button 
            type="button"
            onClick={() => setType('INCOME')}
            className={`flex-1 py-2 text-sm font-bold rounded-xl shadow transition-colors ${type === 'INCOME' ? 'bg-zinc-700/80 shadow-black text-emerald-400' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            Ingreso (+)
          </button>
        </div>

        {/* Monto */}
        <div className="flex flex-col items-center py-6 border-b border-zinc-800">
          <span className="text-zinc-500 font-medium mb-2">{type === 'EXPENSE' ? '¿Cuánto gastaste?' : '¿Cuánto recibiste?'}</span>
          <div className={`flex items-center text-5xl font-extrabold ${type === 'EXPENSE' ? 'text-white' : 'text-emerald-400'}`}>
            <span className="text-zinc-500 mr-2">$</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent w-40 text-center outline-none placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1 relative focus-within:border-zinc-500 transition-colors">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Categoría</label>
            <select 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-transparent text-white font-medium outline-none w-full appearance-none mt-1"
            >
              <option value="" className="bg-zinc-900 text-zinc-500">Selecciona una categoría...</option>
              {categories.filter(c => c.type === type).map(c => (
                <option key={c.id} value={c.id} className="bg-zinc-900">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1 focus-within:border-zinc-500 transition-colors">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Concepto</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Tacos del centro..."
              className="bg-transparent text-white focus:outline-none w-full font-medium" 
            />
          </div>
        </div>

        {error && <div className="text-rose-400 text-sm font-medium text-center">{error}</div>}

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-indigo-500 disabled:opacity-50 disabled:active:scale-100 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform mt-8 shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
        >
          {loading ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </div>
    </BottomSheet>
  );
}
