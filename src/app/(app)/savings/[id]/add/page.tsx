'use client';

import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Target, TrendingUp, History, Download, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { use, useState } from 'react';
import { getLucideIcon } from '@/lib/icon-mapper';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SavingsDetailedPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: tx, loading, refetch } = useApi<any>(`/api/savings/${id}`);
  
  const [formData, setFormData] = useState({ amount: '', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState<'ADD' | 'REMOVE'>('ADD');

  if (loading || !tx) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 text-zinc-600 mb-4"></span>
      <p className="text-zinc-500 font-medium">Leyendo registros...</p>
    </div>
  );

  const GoalIcon = getLucideIcon(tx.icon || 'Target');
  const current = Number(tx.currentAmount);
  const target = Number(tx.targetAmount);
  const pct = Math.min((current / target) * 100, 100);

  const handleAction = async () => {
     setErrorMsg('');
     let amt = parseFloat(formData.amount);
     if (!amt || amt <= 0) return setErrorMsg('El monto debe ser numérico y mayor a 0');

     if (mode === 'REMOVE') {
       amt = -amt;
     }

     setIsSubmitting(true);
     const res = await api.post(`/api/savings/${id}/contribute`, {
        amount: amt,
        note: formData.note || (mode === 'ADD' ? 'Depósito' : 'Retiro estratégico')
     });
     setIsSubmitting(false);

     if (res.error) {
       setErrorMsg(res.error);
     } else {
       setFormData({ amount: '', note: '' });
       refetch();
     }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Return Header */}
      <div className="flex items-center gap-4">
        <Link href="/savings" className={buttonVariants({ variant: 'outline', size: 'icon', className: "rounded-full h-10 w-10 border-zinc-800 text-zinc-400 hover:text-white shrink-0" })}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{tx.name}</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wider uppercase">{tx.type} • ID: {tx.id.substring(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Card (Stats & Chart Simulator) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-[#09090b] border border-zinc-800/80 shadow-2xl relative overflow-hidden">
            {/* Thematic Glow */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03] pointer-events-none rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 bg-emerald-500`} />
            
            <CardContent className="p-8 md:p-12 relative z-10 w-full flex flex-col md:flex-row items-center gap-12">
               
               {/* Visual Progress Ring */}
               <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                   <circle cx="96" cy="96" r="88" fill="none" className="stroke-zinc-900" strokeWidth="16" />
                   <circle 
                     cx="96" cy="96" r="88" fill="none" 
                     className="transition-all duration-1000 delay-300 stroke-current text-emerald-500"
                     strokeWidth="16" strokeLinecap="round"
                     strokeDasharray={552} strokeDashoffset={552 - (552 * pct) / 100}
                   />
                 </svg>
                 <div className="absolute flex flex-col items-center">
                   <Target className="text-emerald-400 mb-2 drop-shadow-md" size={32} />
                   <span className="text-3xl font-black text-white">{pct.toFixed(0)}%</span>
                 </div>
               </div>

               <div className="flex-1 w-full text-center md:text-left">
                 <p className="text-sm text-zinc-500 font-black uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-2">
                    <TrendingUp size={16} className="text-emerald-500" /> Rendimiento de Capital
                 </p>
                 <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter mb-4">${current.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h2>
                 <p className="text-lg text-zinc-400 font-medium">de tu objetivo total de <strong className="text-zinc-200">${target.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></p>
                 
               </div>

            </CardContent>

            <div className="bg-zinc-900/50 border-t border-zinc-800/80 p-6 grid grid-cols-2 divide-x divide-zinc-800 text-center">
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Restante para Meta</span>
                 <span className="text-zinc-100 font-semibold text-lg">${Number(tx.remaining).toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Última Aportación</span>
                 <span className="text-emerald-400 font-semibold text-lg">{tx.contributions?.[0] ? format(new Date(tx.contributions[0].date), "dd MMM, yyyy", { locale: es }) : 'Ninguna'}</span>
               </div>
            </div>
          </Card>

          {/* Record History */}
          <div className="bg-zinc-950 border border-zinc-800/60 rounded-3xl p-8 overflow-hidden">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-bold text-white text-lg flex items-center gap-2"><History size={18} className="text-emerald-500" /> Libro de Movimientos</h3>
               <span className="text-xs font-bold text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">{tx.contributions?.length || 0} Registros</span>
             </div>

             <div className="space-y-4">
               {(!tx.contributions || tx.contributions.length === 0) ? (
                 <div className="text-center py-12 text-zinc-600 bg-zinc-900/30 rounded-2xl border border-zinc-800/30 border-dashed">
                    Aún no hay depósitos o retiros ligados a este plan.
                 </div>
               ) : (
                 tx.contributions.map((c: any) => {
                   const isNegative = Number(c.amount) < 0;
                   return (
                     <div key={c.id} className="flex justify-between items-center bg-[#0d0d0f] p-4 rounded-2xl border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNegative ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           {isNegative ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                         </div>
                         <div>
                           <p className="text-zinc-200 font-semibold text-sm">{c.note || (isNegative ? 'Retiro' : 'Aportación')}</p>
                           <p className="text-zinc-500 text-xs font-medium capitalize mt-0.5">{format(new Date(c.date), 'dd MMM yyyy • hh:mm a', { locale: es })}</p>
                         </div>
                       </div>
                       <span className={`font-black tracking-tight text-lg ${isNegative ? 'text-zinc-300' : 'text-emerald-400'}`}>
                         {isNegative ? '' : '+'}${Math.abs(Number(c.amount)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                       </span>
                     </div>
                   );
                 })
               )}
             </div>
          </div>

        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
             
             <h3 className="text-white font-extrabold text-xl mb-1 flex items-center gap-2"><Activity size={20} className="text-indigo-400"/> Efectuar Movimiento</h3>
             <p className="text-zinc-400 text-sm mb-6">Inyecta capital o retira liquidez de tu bóveda.</p>

             <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl mb-6">
                <button onClick={() => setMode('ADD')} className={`flex-1 font-bold text-sm h-10 rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'ADD' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                   <ArrowUp size={16} className="text-emerald-400"/> Inyectar
                </button>
                <button onClick={() => setMode('REMOVE')} className={`flex-1 font-bold text-sm h-10 rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'REMOVE' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                   <ArrowDown size={16} className="text-rose-400"/> Retirar
                </button>
             </div>

             <div className="space-y-5">
               <div className="grid gap-2">
                 <Label className="text-zinc-400">Total Transaccional ($)</Label>
                 <Input 
                   type="number" 
                   value={formData.amount} 
                   onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                   placeholder="Ej. 1000.00" 
                   className={`h-14 bg-[#0d0d0f] border-zinc-800 text-xl font-bold font-mono transition-colors focus-visible:ring-0 ${mode === 'ADD' ? 'focus-visible:border-emerald-500 text-emerald-400' : 'focus-visible:border-rose-500 text-rose-400'}`} 
                 />
               </div>

               <div className="grid gap-2">
                 <Label className="text-zinc-400">Concepto o Razón</Label>
                 <Input 
                   type="text" 
                   value={formData.note} 
                   onChange={(e) => setFormData({...formData, note: e.target.value})} 
                   placeholder={mode === 'ADD' ? "Ej. Bono Navideño" : "Ej. Pago de Urgencia"} 
                   className="bg-[#0d0d0f] border-zinc-800 focus-visible:ring-zinc-700" 
                 />
               </div>

               {errorMsg && <p className="text-sm font-bold text-rose-500 text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{errorMsg}</p>}

               <Button 
                 onClick={handleAction} 
                 disabled={isSubmitting} 
                 className={`w-full h-14 font-extrabold text-lg mt-2 ${mode === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
               >
                 {isSubmitting ? 'Procesando...' : mode === 'ADD' ? 'Depositar Capital' : 'Confirmar Retiro'}
               </Button>
             </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full text-zinc-500 border-zinc-800 bg-transparent hover:bg-zinc-900 hover:text-zinc-300 h-12" onClick={() => alert('La exportación estricta a .CSV estará habilitada en el Módulo Pro.')}>
              <Download size={16} className="mr-2" /> Exportar Récords
            </Button>
          </div>

        </div>
        
      </div>
    </div>
  );
}
