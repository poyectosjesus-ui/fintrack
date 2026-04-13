'use client';

import { BottomSheet } from '@/components/native/BottomSheet';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Trash2, SplitSquareHorizontal, ReceiptText } from 'lucide-react';
import { use } from 'react';

export default function MobileTransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: tx, loading } = useApi<any>(`/api/transactions/${id}`);

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      await api.delete(`/api/transactions/${id}`);
      router.push('/transactions');
      router.refresh();
    }
  };

  if (loading || !tx) return <BottomSheet title="Cargando..."><div className="h-64 flex justify-center items-center"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></span></div></BottomSheet>;

  return (
    <BottomSheet title="Detalle">
       <div className="py-2 space-y-8">
        
        {/* Header (Monto + Categoria) */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-[24px] mb-4 flex items-center justify-center text-3xl shadow-xl shadow-black/40 border border-white/5" style={{ backgroundColor: `${tx.category.color}20` }}>
            {tx.category.icon}
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-zinc-100 to-zinc-400">{tx.description}</h2>
          <span className="text-sm font-medium text-zinc-500 mt-1 capitalize">{format(new Date(tx.date), "dd MMM, hh:mm a", { locale: es })}</span>
          
          <div className="mt-6 flex items-baseline">
            <span className={`text-5xl font-extrabold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-zinc-100'}`}>
              <span className="text-3xl text-zinc-500 mr-1">$</span>
              {Number(tx.amount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-4 gap-4 px-2">
          
          <ActionButton icon={<Pencil size={24} className="text-indigo-400" />} label="Editar" onClick={() => router.push(`/transactions/${id}/edit`)} />
          <ActionButton icon={<SplitSquareHorizontal size={24} className="text-amber-400" />} label="Dividir" onClick={() => alert('Próximamente')} />
          <ActionButton icon={<ReceiptText size={24} className="text-emerald-400" />} label="Recibo" onClick={() => alert('Próximamente')} />
          <ActionButton icon={<Trash2 size={24} className="text-rose-400" />} label="Borrar" danger onClick={handleDelete} />

        </div>

        {/* Details list */}
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-[28px] p-4 flex flex-col gap-4 overflow-hidden mt-6">
          <DetailRow label="Categoría" value={tx.category.name} icon="🍔" />
          <div className="h-px w-full bg-zinc-800" />
          <DetailRow label="Método" value={tx.paymentMethod?.alias || 'Efectivo'} icon="💳" />
          <div className="h-px w-full bg-zinc-800" />
          <DetailRow label="Estatus" value="Completado" icon="✅" />
        </div>

      </div>
    </BottomSheet>
  );
}

function ActionButton({ icon, label, danger, onClick }: { icon: React.ReactNode, label: string, danger?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group outline-none">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-lg ${danger ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-zinc-800 border border-zinc-700'}`}>
        {icon}
      </div>
      <span className={`text-[11px] font-bold ${danger ? 'text-rose-500/70' : 'text-zinc-500 group-active:text-zinc-300'} transition-colors`}>{label}</span>
    </button>
  );
}

function DetailRow({ label, value, icon }: { label: string, value: string, icon: string }) {
  return (
    <div className="flex justify-between items-center px-2">
      <span className="text-zinc-400 text-sm font-medium flex items-center gap-2">
        <span className="opacity-50 text-base">{icon}</span> {label}
      </span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}
