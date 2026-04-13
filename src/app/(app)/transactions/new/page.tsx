'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ArrowDown, ArrowUp, ArrowLeft, ReceiptText, Tag, Banknote, CalendarDays, Wallet } from 'lucide-react';
import Link from 'next/link';
import { getLucideIcon } from '@/lib/icon-mapper';

import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function NewTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams?.get('type') === 'INCOME' ? 'INCOME' : 'EXPENSE';
  
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(initialType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Resolver la desestructuración de Array.isArray en caso que usemos destructure desde body.data
    api.get<any[]>('/api/categories').then((res) => {
      const cats = Array.isArray(res.data) ? res.data : typeof res.data === 'object' && Array.isArray((res.data as any).data) ? (res.data as any).data : [];
      setCategories(cats);
    });
  }, []);

  const handleSave = async () => {
    setErrorMsg('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setErrorMsg('El monto del movimiento debe ser superior a 0');
    if (!categoryId) return setErrorMsg('Por favor selecciona una categoría de la lista.');
    if (!description.trim()) return setErrorMsg('Es necesario describir el movimiento.');

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
      setErrorMsg(res.error);
    } else {
      router.push('/transactions');
      router.refresh();
    }
  };

  const isIncome = type === 'INCOME';
  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Return Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800/60 pb-6">
        <Link href="/transactions" className={buttonVariants({ variant: 'outline', size: 'icon', className: "rounded-full h-11 w-11 border-zinc-800 text-zinc-400 hover:text-white shrink-0" })}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Capturar Movimiento</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1 uppercase tracking-wider">Módulo de Integración Manual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Main Form Area */}
        <div className="md:col-span-8 space-y-6">
           <Card className="bg-[#0cf0f11] bg-black border border-zinc-800/80 shadow-2xl relative overflow-hidden">
               {/* Glowing ambiance */}
               <div className={`absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.05] pointer-events-none rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3 transition-colors duration-1000 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />

               <CardContent className="p-8 md:p-10 relative z-10 w-full flex flex-col gap-8">
                  
                  {/* Selector Naturaleza */}
                  <div>
                    <Label className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-3 block">1. Naturaleza Financiera</Label>
                    <div className="flex p-1.5 bg-[#09090b] rounded-xl w-full border border-zinc-800/60 shadow-inner">
                      <button 
                        onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg font-bold transition-all ${!isIncome ? 'text-rose-400 bg-zinc-800 shadow-md ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <ArrowUp size={18} /> Asentar Gasto / Egreso
                      </button>
                      <button 
                        onClick={() => { setType('INCOME'); setCategoryId(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg font-bold transition-all ${isIncome ? 'text-emerald-400 bg-zinc-800 shadow-md ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <ArrowDown size={18} /> Reportar Ingreso
                      </button>
                    </div>
                  </div>

                  {/* Amount Focus Input */}
                  <div>
                    <Label className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2 block"><Banknote size={14}/> 2. Capital Declarado ($ MXN)</Label>
                    <div className="relative flex items-center group">
                      <span className={`absolute left-6 font-extrabold text-2xl select-none pointer-events-none transition-colors ${isIncome ? 'text-emerald-500/50' : 'text-zinc-500/50'}`}>$</span>
                      <Input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`h-24 w-full pl-14 pr-6 bg-[#09090b] border-2 border-zinc-800/80 rounded-2xl text-5xl font-black tracking-tighter shadow-inner transition-colors focus-visible:ring-0 ${isIncome ? 'focus-visible:border-emerald-500/50 text-emerald-400 focus-visible:bg-emerald-500/5' : 'focus-visible:border-rose-500/50 text-zinc-100 focus-visible:bg-rose-500/5'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Selection */}
                    <div>
                      <Label className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2"><Tag size={14}/> 3. Clasificación Mestra</Label>
                      <div className="relative">
                        <select 
                          value={categoryId} 
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="flex h-14 w-full appearance-none rounded-xl border border-zinc-800 bg-[#09090b] shadow-inner px-4 py-2 text-sm text-zinc-100 font-semibold focus-visible:outline-none focus:border-indigo-500"
                        >
                          <option value="">Cargando catálogo...</option>
                          {filteredCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                          <ArrowDown size={14} />
                        </div>
                      </div>
                    </div>

                    {/* Concept */}
                    <div>
                      <Label className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2"><ReceiptText size={14}/> 4. Concepto / Motivo</Label>
                      <Input 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ej. Colegiatura mensual, Gasolina, Super..."
                        className="h-14 px-4 bg-[#09090b] border-zinc-800 shadow-inner rounded-xl font-medium focus-visible:ring-0 focus-visible:border-indigo-500 text-zinc-200"
                      />
                    </div>
                  </div>

                  {errorMsg && <p className="text-sm font-bold text-rose-500 text-center bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{errorMsg}</p>}

                  <Button 
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full h-16 rounded-xl font-black tracking-wide text-lg shadow-lg hover:-translate-y-1 transition-all ${isIncome ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'}`}
                  >
                    {loading ? 'Sincronizando Libro...' : 'Procesar Volcado'}
                  </Button>

               </CardContent>
           </Card>
        </div>

        {/* Informative Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-6">
           <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/60 shadow-xl">
             <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                <Wallet size={20} />
             </div>
             <h3 className="text-white font-extrabold text-lg mb-2">Libro Contable Criptográfico</h3>
             <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                Al declarar un movimiento aquí, el ecosistema completo se reacciona. Si dictas una salida ligada a una categoría con Presupuesto activo, <strong className="text-zinc-300">consumirá su límite dinámicamente</strong> en tiempo real.
             </p>
           </div>
           
           <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/60 shadow-xl">
             <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                <CalendarDays size={20} />
             </div>
             <h3 className="text-white font-extrabold text-lg mb-2">Fecha Valor Asentada</h3>
             <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                Los movimientos son acuñados directamente en el segundo exacto que dictas la orden usando marca de tiempo GMT actual del servidor para blindar la auditoría en tus gráficas.
             </p>
           </div>
        </div>

      </div>

    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Cargando módulo...</div>}>
      <NewTransactionForm />
    </Suspense>
  );
}
