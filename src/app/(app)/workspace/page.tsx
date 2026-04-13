'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function WorkspacePage() {
  const { data, loading, refetch } = useApi<any[]>('/api/workspaces');
  const toast = useToast();
  const [inviteLoading, setInviteLoading] = useState(false);

  // Since response is { data: [ {workspace, members:[]} ] }, find the first one or active one.
  // In v2 we only implemented the current workspace in auth, but the GET returns array.
  const ws = data && data.length > 0 ? data[0] : null;
  const members = ws?.members || [];

  const handleInvite = async (role: string) => {
    if (!ws) return;
    setInviteLoading(true);
    const res = await api.post<any>(`/api/workspaces/${ws.id}/invite`, { role, expiresInDays: 7 });
    setInviteLoading(false);
    
    if (res.error) {
      toast(res.error, 'error');
    } else {
      // res.data.code -> The invitation code
      const code = res.data?.code;
      const inviteUrl = `${window.location.origin}/invite/${code}`;
      navigator.clipboard.writeText(inviteUrl);
      toast('¡Enlace de invitación copiado al portapapeles!', 'success');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!ws) return;
    const res = await api.put(`/api/workspaces/${ws.id}/members/${memberId}`, { role: newRole });
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Rol actualizado con éxito', 'success');
      refetch();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Seguro que deseas eliminar a este miembro del workspace?')) return;
    if (!ws) return;
    const res = await api.delete(`/api/workspaces/${ws.id}/members/${memberId}`);
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Miembro eliminado', 'success');
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="py-6 space-y-6">
        <div className="loading-skeleton h-12 w-1/3 rounded" />
        <div className="loading-skeleton h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!ws) {
    return <div className="py-6 text-center text-text-muted">No se encontró el workspace</div>;
  }

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-primary-light">
          Configuración del Workspace
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Administra la información compartida y tus miembros.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Info Card */}
        <div className="md:col-span-1 space-y-6 flex flex-col">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-bold text-lg mb-4">Información</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1 block">Nombre</label>
                <div className="font-medium">{ws.name}</div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1 block">Moneda Principal</label>
                <div className="font-medium bg-surface-3 px-2 py-1 rounded inline-flex text-sm">{ws.currency}</div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1 block">Ruta Única</label>
                <div className="font-mono text-sm text-primary">/{ws.slug}</div>
              </div>
            </div>
            <button className="btn btn-secondary w-full mt-6 text-sm">Editar Información</button>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card border-t-[3px] border-t-expense">
            <h2 className="font-bold text-lg mb-2 text-expense">Zona Peligrosa</h2>
            <p className="text-xs text-text-muted mb-4">Al eliminar este workspace, se borrarán todos los datos, presupuestos y transacciones asociadas.</p>
            <button className="w-full py-2 bg-expense-glow text-expense hover:bg-expense hover:text-white rounded text-sm transition-colors font-medium border border-expense">
              Eliminar Workspace
            </button>
          </div>
        </div>

        {/* Miembros Card */}
        <div className="md:col-span-2">
          <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="font-bold text-lg">Miembros de la familia</h2>
                <p className="text-xs text-text-muted mt-1">Personas que pueden ver o editar este workspace.</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleInvite('MEMBER')}
                  disabled={inviteLoading}
                  className="btn btn-primary text-sm px-4"
                >
                  {inviteLoading ? 'Generando...' : '+ Invitar (Membro)'}
                </button>
              </div>
            </div>

            <div className="divide-y divide-border">
              {members.map((m: any) => (
                <div key={m.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-2 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-lg shadow-sm">
                      👤
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{m.user.name}</h4>
                      <p className="text-xs text-text-muted">{m.user.email}</p>
                      <p className="text-[10px] text-text-subtle mt-1">Se unió el {format(new Date(m.joinedAt), "dd MMM yyyy", { locale: es })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select 
                      className="form-select text-xs py-1.5 px-3 min-w-[120px]"
                      value={m.role}
                      onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                      disabled={m.role === 'OWNER'} // OWNER no puede cambiarse el rol fácilmente
                    >
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="MEMBER">Miembro Regular</option>
                    </select>

                    {m.role !== 'OWNER' && (
                      <button 
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-text-muted hover:text-expense p-2 transition-colors bg-surface-2 hover:bg-expense-glow rounded-md border border-border hover:border-expense"
                        title="Eliminar miembro"
                      >
                         ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
