'use client';

import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Trash2, SplitSquareHorizontal, ReceiptText, ArrowLeft, Tag, CreditCard, CheckCircle2 } from 'lucide-react';
import { use } from 'react';
import { getLucideIcon } from '@/lib/icon-mapper';
import { formatAmount } from '@/lib/format';
import Link from 'next/link';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';

export default function TransactionDetailDesktopPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: tx, loading } = useApi<any>(`/api/transactions/${id}`);

  // Dialog States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [featureAlertMsg, setFeatureAlertMsg] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    await api.delete(`/api/transactions/${id}`);
    router.push('/transactions');
    router.refresh();
  };

  if (loading || !tx) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 text-zinc-600 mb-4"></span>
      <p className="text-zinc-500 font-medium">Cargando transacción...</p>
    </div>
  );

  const TxIcon = getLucideIcon(tx.category.icon) || ReceiptText;
  const isIncome = tx.type === 'INCOME';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Return Header */}
      <div className="flex items-center gap-4">
        <Link href="/transactions" className={buttonVariants({ variant: 'outline', size: 'icon', className: "rounded-full h-10 w-10 border-zinc-800 text-zinc-400 hover:text-white shrink-0" })}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Detalle de Transacción</h1>
          <p className="text-sm text-zinc-500 font-medium">{tx.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Main Informational Card */}
        <div className="md:col-span-8 space-y-6">
          <Card className="bg-[#09090b] border border-zinc-800/80 shadow-2xl relative overflow-hidden">
            {/* Thematic Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            
            <CardContent className="p-8 md:p-10 flex flex-col items-center">
              
              <div 
                className="w-24 h-24 rounded-[32px] mb-8 flex items-center justify-center shadow-xl border border-zinc-700/50" 
                style={{ backgroundColor: `${tx.category.color}15`, color: tx.category.color }}
              >
                <TxIcon size={48} />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-2">{tx.description}</h2>
              <p className="text-zinc-500 font-semibold mb-8 capitalize">{format(new Date(tx.date), "EEEE, dd 'de' MMMM yyyy - hh:mm a", { locale: es })}</p>
              
              <div className="flex items-center justify-center">
                <span className={`text-6xl md:text-7xl font-black tracking-tighter ${isIncome ? 'text-emerald-400' : 'text-zinc-100'}`}>
                  <span className="text-4xl text-zinc-500 font-medium mr-2 align-top opacity-50">$</span>
                  {formatAmount(tx.amount)}
                </span>
              </div>
            </CardContent>

            {/* List Details Footer */}
            <div className="bg-zinc-900/50 border-t border-zinc-800/80 p-6 md:px-10 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
              <div className="flex flex-col gap-1 sm:pr-4 pt-4 sm:pt-0">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><Tag size={12}/> Categoría</span>
                <span className="text-zinc-200 font-semibold text-sm">{tx.category.name}</span>
              </div>
              <div className="flex flex-col gap-1 sm:px-4 pt-4 sm:pt-0">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><CreditCard size={12}/> Método</span>
                <span className="text-zinc-200 font-semibold text-sm">{tx.paymentMethod?.alias || 'Efectivo Corriente'}</span>
              </div>
              <div className="flex flex-col gap-1 sm:pl-4 pt-4 sm:pt-0">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Estatus</span>
                <span className="text-emerald-400 font-semibold text-sm flex items-center gap-1">Liquidado</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-widest pl-1 mb-2">Acciones Rápidas</h3>
          
          <Button 
            className="w-full h-14 bg-zinc-900 border border-zinc-800 shadow-sm text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all justify-start px-6 font-bold"
            onClick={() => router.push(`/transactions/${id}/edit`)}
          >
            <Pencil size={18} className="mr-4 text-indigo-400" />
            Editar Registro
          </Button>

          <Button 
            className="w-full h-14 bg-zinc-900 border border-zinc-800 shadow-sm text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all justify-start px-6 font-bold"
            onClick={() => setFeatureAlertMsg('La función "Dividir Gasto" (Split) estará disponible en la próxima actualización. Te permitirá dividir una cuenta con Roomies o Familiares fácilmente.')}
          >
            <SplitSquareHorizontal size={18} className="mr-4 text-amber-400" />
            Dividir Gasto
          </Button>

          <Button 
            className="w-full h-14 bg-zinc-900 border border-zinc-800 shadow-sm text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all justify-start px-6 font-bold"
            onClick={() => setFeatureAlertMsg('El Generador de Comprobantes en PDF está siendo terminado. ¡Pronto podrás imprimir cada transacción!')}
          >
            <ReceiptText size={18} className="mr-4 text-emerald-400" />
            Generar Comprobante
          </Button>

          <div className="my-2 h-px bg-zinc-800/60 w-full" />

          <Button 
            variant="destructive"
            className="w-full h-14 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all justify-start px-6 font-bold"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={18} className="mr-4" />
            Eliminar Definitivamente
          </Button>
        </div>
        
      </div>

      {/* Modern Confirmation Dialog (Replaces window.confirm) */}
      {showDeleteConfirm && (
         <Dialog open={true} onOpenChange={() => setShowDeleteConfirm(false)}>
           <DialogContent onClose={() => setShowDeleteConfirm(false)} className="max-w-md border-zinc-800 p-0 overflow-hidden">
             <div className="p-6">
                <DialogHeader className="mb-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                    <Trash2 size={24} className="text-rose-500" />
                  </div>
                  <DialogTitle className="text-xl">¿Eliminar transacción?</DialogTitle>
                  <DialogDescription className="text-zinc-400 mt-2">
                    Estás a punto de borrar irremediablemente este registro de <strong>${formatAmount(tx.amount)}</strong>. Esta acción no se puede deshacer y los fondos dejarán de contabilizarse en tus gráficos.
                  </DialogDescription>
                </DialogHeader>
             </div>
             <DialogFooter className="p-4 bg-zinc-900/50 border-t border-zinc-800 sm:justify-end flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="border-zinc-700 w-full sm:w-auto" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto font-bold" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Sí, eliminar registro'}
                </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
      )}

      {/* Modern Feature Alert Dialog (Replaces window.alert) */}
      {!!featureAlertMsg && (
         <Dialog open={true} onOpenChange={() => setFeatureAlertMsg('')}>
           <DialogContent onClose={() => setFeatureAlertMsg('')} className="max-w-sm border-zinc-800 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
                 <span className="text-2xl">🚀</span>
              </div>
              <DialogHeader>
                 <DialogTitle className="text-center text-xl">Próximamente</DialogTitle>
                 <DialogDescription className="text-center text-zinc-400 mt-2">
                   {featureAlertMsg}
                 </DialogDescription>
              </DialogHeader>
              <Button className="w-full mt-4 font-bold rounded-full" onClick={() => setFeatureAlertMsg('')}>
                Entendido
              </Button>
           </DialogContent>
         </Dialog>
      )}
    </div>
  );
}
