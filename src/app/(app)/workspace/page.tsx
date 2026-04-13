'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Settings, Users, Shield, ShieldAlert, Key, Trash2, Edit2, Copy, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function WorkspacePage() {
  const { data, loading, refetch } = useApi<any[]>('/api/workspaces');
  const toast = useToast();
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

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

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ws || !newName.trim()) return;
    setRenameLoading(true);
    const res = await api.put(`/api/workspaces/${ws.id}`, { name: newName });
    setRenameLoading(false);

    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Workspace renombrado con éxito', 'success');
      setIsRenaming(false);
      refetch();
    }
  };

  const openRenameModal = () => {
    if (ws) {
      setNewName(ws.name);
      setIsRenaming(true);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse mt-4">
        <div className="h-8 bg-zinc-800/50 rounded w-1/4"></div>
        <div className="h-64 bg-zinc-800/20 rounded-xl border border-zinc-800/50"></div>
      </div>
    );
  }

  if (!ws) {
    return <div className="p-10 text-center text-zinc-500 font-medium">No se encontró información de la familia.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 mt-2">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Ajustes de la Familia</h1>
        <p className="text-zinc-400 text-sm">Administra la configuración general de tu espacio y quiénes tienen acceso a él.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-zinc-800/60 flex items-center gap-3">
              <Settings className="text-indigo-400" size={18} />
              <h2 className="font-semibold text-white">General</h2>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Nombre</label>
                <div className="font-medium text-zinc-200">{ws.name}</div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Moneda Principal</label>
                <div className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md inline-flex border border-emerald-500/20">{ws.currency}</div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Ruta Única</label>
                <div className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded inline-block border border-indigo-500/20">/{ws.slug}</div>
              </div>
              <button onClick={openRenameModal} className="w-full flex justify-center items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors border border-zinc-700 mt-4">
                <Edit2 size={14} /> Editar Nombre
              </button>
            </div>
          </div>
          
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-red-500/20 flex items-center gap-3">
              <ShieldAlert className="text-red-400" size={18} />
              <h2 className="font-semibold text-red-500">Zona Peligrosa</h2>
            </div>
            <div className="p-5">
              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">Al eliminar esta familia, se borrarán todos los datos, presupuestos, suscripciones y transacciones de todos los miembros irreversiblemente.</p>
              <button disabled className="w-full justify-center flex items-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors border border-red-500/20 cursor-not-allowed opacity-50">
                <Trash2 size={14} /> Eliminar Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Members Card */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm h-full flex flex-col">
            <div className="p-6 border-b border-zinc-800/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-zinc-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Users className="text-indigo-400" size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">Miembros</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Personas que comparten y gestionan este espacio.</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleInvite('MEMBER')}
                disabled={inviteLoading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors border border-indigo-500"
              >
                {inviteLoading ? 'Generando link...' : <><Copy size={16} /> Invitar Miembro</>}
              </button>
            </div>

            <div className="divide-y divide-zinc-800/60 flex-1">
              {members.map((m: any) => (
                <div key={m.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center font-bold text-zinc-300 shadow-sm uppercase">
                      {m.user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                        {m.user.name} 
                        {m.role === 'OWNER' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1"><Key size={10}/> OWNER</span>}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">{m.user.email}</p>
                      <p className="text-[10px] text-zinc-600 mt-1 uppercase font-semibold">Unido: {format(new Date(m.joinedAt), "dd MMM yyyy", { locale: es })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <select 
                      className="block w-full sm:w-[140px] rounded-md border-0 bg-zinc-800/50 py-1.5 pl-3 pr-8 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-xs sm:leading-6"
                      value={m.role}
                      onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                      disabled={m.role === 'OWNER'} 
                    >
                      <option value="OWNER">Propietario</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="MEMBER">Miembro General</option>
                    </select>

                    {m.role !== 'OWNER' && (
                      <button 
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-zinc-500 hover:text-red-400 p-2 transition-colors bg-zinc-800/50 hover:bg-red-500/10 rounded-md border border-zinc-700 hover:border-red-500/30"
                        title="Eliminar miembro"
                      >
                         <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      {isRenaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-zinc-800">
              <h3 className="font-bold text-lg text-white">Renombrar Familia</h3>
              <button onClick={() => setIsRenaming(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRename} className="p-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Nuevo Nombre</label>
              <input
                autoFocus
                type="text"
                required
                minLength={2}
                maxLength={50}
                className="block w-full rounded-lg border-0 bg-zinc-800/50 py-2.5 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Familia Ruiz"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsRenaming(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={renameLoading || newName === ws.name}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {renameLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
