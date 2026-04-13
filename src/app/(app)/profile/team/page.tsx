'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, MailPlus, Copy, Trash2, ArrowLeft, ShieldAlert, Fingerprint, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function TeamworkPage() {
  const { data: session } = useSession();
  const workspaceId = session?.user?.workspaceId;

  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [emailToInvite, setEmailToInvite] = useState('');
  const [roleToInvite, setRoleToInvite] = useState('MEMBER');
  const [generating, setGenerating] = useState(false);
  const [inviteResult, setInviteResult] = useState<any>(null); // To show the link
  const [errorMsg, setErrorMsg] = useState('');
  
  // Revoke Modal State
  const [revokeInviteId, setRevokeInviteId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState('');

  const fetchTeamData = async () => {
    if (!workspaceId) return;
    setLoading(true);
    const [memRes, invRes] = await Promise.all([
      api.get(`/api/workspaces/${workspaceId}/members`),
      api.get(`/api/workspaces/${workspaceId}/invite`)
    ]);
    
    const safeExtract = (payload: any) => {
      if (!payload || !payload.data) return [];
      if (Array.isArray(payload.data)) return payload.data;
      if (typeof payload.data === 'object' && payload.data !== null && Array.isArray(payload.data.data)) return payload.data.data;
      return [];
    };

    setMembers(safeExtract(memRes));
    setInvitations(safeExtract(invRes));
    setLoading(false);
  };

  useEffect(() => {
    fetchTeamData();
  }, [workspaceId]);

  const handleCreateInvite = async () => {
    setErrorMsg('');
    if (!emailToInvite.trim()) return setErrorMsg('Ingresa un correo destino');

    setGenerating(true);
    const res = await api.post(`/api/workspaces/${workspaceId}/invite`, {
       email: emailToInvite,
       role: roleToInvite
    });
    setGenerating(false);

    if (res.error) {
       setErrorMsg(res.error);
    } else {
       setInviteResult(res.data);
       fetchTeamData();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado al portapapeles');
  };

  const handleRevoke = async () => {
    if (!revokeInviteId) return;
    setRevokeError('');
    setRevoking(true);
    const res = await api.delete(`/api/workspaces/${workspaceId}/invite?inviteId=${revokeInviteId}`);
    setRevoking(false);

    if (res.error) {
      setRevokeError(res.error);
    } else {
      setRevokeInviteId(null);
      fetchTeamData();
    }
  };

  const isOwner = session?.user?.role === 'OWNER';

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Return Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/60">
        <div className="flex items-center gap-4">
          <Link href="/profile" className={buttonVariants({ variant: 'outline', size: 'icon', className: "rounded-full h-11 w-11 border-zinc-800 text-zinc-400 hover:text-white shrink-0" })}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestión del Espacio</h1>
            <p className="text-sm text-zinc-400 font-medium mt-1 uppercase tracking-wider">Control de Acceso y Red Familiar</p>
          </div>
        </div>
        
        {isOwner && (
          <Button onClick={() => { setIsInviteOpen(true); setInviteResult(null); setEmailToInvite(''); }} className="h-11 px-6 font-bold rounded-full shadow-md bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
            <MailPlus size={16} className="mr-2" /> Invitar Miembro
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         
         {/* MAIN COLUMN: Existing Members */}
         <div className="xl:col-span-8 space-y-6">
            <h3 className="font-bold text-zinc-200 text-lg flex items-center gap-2"><Users size={18} className="text-indigo-400"/> Integrantes de Bóveda</h3>
            
            {loading ? (
                <div className="flex justify-center p-12"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></span></div>
            ) : members.length === 0 ? (
                <p>No hay miembros.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((m: any) => (
                    <div key={m.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex items-center gap-5 hover:border-zinc-700 transition-colors">
                       <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-800 shrink-0">
                          {m.user.avatarUrl ? (
                             <img src={m.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                             <Fingerprint size={24} className="text-zinc-500" />
                          )}
                       </div>
                       <div className="overflow-hidden flex-1">
                          <p className="text-white font-bold truncate text-base">{m.user.name}</p>
                          <p className="text-xs text-zinc-500 truncate mb-1">{m.user.email}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${m.role === 'OWNER' ? 'bg-amber-500/10 text-amber-500' : m.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                             Role: {m.role}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
            )}
         </div>

         {/* SIDEBAR: Outstanding Invitations */}
         <div className="xl:col-span-4 space-y-6">
             <h3 className="font-bold text-zinc-200 text-lg flex items-center gap-2"><ShieldAlert size={18} className="text-emerald-400"/> Pasaportes Emitidos</h3>
             
             <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden h-full">
                {invitations.length === 0 ? (
                   <p className="text-sm text-zinc-500 font-medium text-center py-10">Ningún acceso pendiente de confirmar.</p>
                ) : (
                   <div className="space-y-4">
                      {invitations.map((inv: any) => (
                         <div key={inv.id} className="bg-black border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 group relative">
                            <div className="flex justify-between items-start">
                               <div className="overflow-hidden pr-8">
                                  <p className="text-sm font-bold text-zinc-200 truncate">{inv.email}</p>
                                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Exp: {format(new Date(inv.expiresAt), "dd MMM", { locale: es })}</p>
                               </div>
                               <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${inv.status === 'EXPIRED' ? 'text-rose-500' : 'text-emerald-400'}`}>
                                  {inv.status}
                               </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                               <Button size="sm" variant="secondary" onClick={() => copyToClipboard(inv.inviteUrl)} className="h-7 text-xs font-bold bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                                 <Copy size={12} className="mr-1.5"/> Link
                               </Button>
                               <Button size="icon" variant="ghost" onClick={() => setRevokeInviteId(inv.id)} className="h-7 w-7 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20">
                                 <Trash2 size={12} />
                               </Button>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
         </div>
      </div>

      {/* Invite Flow Modal */}
      {isInviteOpen && (
         <Dialog open={true} onOpenChange={() => setIsInviteOpen(false)}>
            <DialogContent onClose={() => setIsInviteOpen(false)} className="max-w-md border-zinc-800 p-0 overflow-hidden bg-[#0d0d0f]">
               
               <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/40 relative">
                 <div className="absolute top-0 right-0 w-full h-full bg-indigo-500/10 blur-3xl" />
                 <DialogHeader className="relative z-10">
                    <DialogTitle className="text-xl">Generar Pasaporte Digital</DialogTitle>
                    <DialogDescription className="text-zinc-400 mt-2">Invita a alguien a tu espacio permitiéndole acceder a la contabilidad.</DialogDescription>
                 </DialogHeader>
               </div>

               <div className="p-6 space-y-6">
                 {!inviteResult ? (
                    <>
                      <div className="grid gap-2">
                         <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Correo del Destinatario</Label>
                         <Input 
                            type="email" value={emailToInvite} onChange={(e) => setEmailToInvite(e.target.value)} 
                            placeholder="contacto@empresa.com" 
                            className="h-12 bg-black border-zinc-800 focus-visible:ring-indigo-500 font-medium" 
                         />
                      </div>
                      
                      <div className="grid gap-2">
                         <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Poderes / Rol</Label>
                         <select 
                            value={roleToInvite} onChange={(e) => setRoleToInvite(e.target.value)} 
                            className="flex h-12 w-full appearance-none rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm text-zinc-100 font-semibold focus-visible:outline-none focus:border-indigo-500"
                         >
                            <option value="MEMBER">Miembro del Hogar (Pareja, Roomie, Familiar)</option>
                            <option value="ADMIN">Administrador (Control Total de Presupuestos)</option>
                            <option value="VIEWER">Solo Lectura (Visualizador Externo)</option>
                         </select>
                      </div>

                      {errorMsg && <p className="text-sm font-bold text-rose-500 text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{errorMsg}</p>}
                      
                      <Button onClick={handleCreateInvite} disabled={generating} className="w-full h-12 font-bold bg-indigo-600 hover:bg-indigo-500">
                         {generating ? 'Generando Criptografía...' : 'Crear Link Seguro'}
                      </Button>
                    </>
                 ) : (
                    <div className="text-center py-4 space-y-6 animate-in zoom-in-95">
                       <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 size={32} />
                       </div>
                       <div>
                         <p className="text-lg font-black text-white">¡Pasaporte Creado!</p>
                         <p className="text-sm text-zinc-400">Comparte este link blindado con la persona. Expirará en 7 días.</p>
                       </div>
                       
                       <div className="bg-black border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                          <span className="text-xs text-zinc-300 font-medium truncate flex-1">{inviteResult.inviteUrl}</span>
                          <Button size="icon" onClick={() => copyToClipboard(inviteResult.inviteUrl)} className="h-8 w-8 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-md">
                             <Copy size={14} />
                          </Button>
                       </div>
                       
                       <Button onClick={() => setIsInviteOpen(false)} variant="outline" className="w-full border-zinc-700 bg-transparent text-white">Entendido</Button>
                    </div>
                 )}
               </div>

            </DialogContent>
         </Dialog>
      )}

   {/* Revoke Confirmation Dialog */}
   {revokeInviteId && (
      <Dialog open={true} onOpenChange={() => setRevokeInviteId(null)}>
         <DialogContent onClose={() => setRevokeInviteId(null)} className="max-w-md border-zinc-800 bg-[#0d0d0f] p-0 overflow-hidden">
            <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/40 relative text-center">
               <div className="mx-auto w-16 h-16 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert size={32} />
               </div>
               <DialogTitle className="text-xl font-extrabold text-white">¿Revocar Acceso?</DialogTitle>
               <DialogDescription className="text-zinc-400 mt-2">
                  Esta acción desactivará permanentemente el pase criptográfico. Quien tenga el enlace ya no podrá usarlo para entrar a tu bóveda.
               </DialogDescription>
            </div>
            
            <div className="p-6 space-y-4">
               {revokeError && <p className="text-sm font-bold text-rose-500 text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{revokeError}</p>}
               
               <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => setRevokeInviteId(null)} variant="outline" className="w-full h-12 border-zinc-700 text-zinc-300 hover:text-white" disabled={revoking}>
                     Cancelar
                  </Button>
                  <Button onClick={handleRevoke} disabled={revoking} className="w-full h-12 bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20">
                     {revoking ? 'Destruyendo...' : 'Sí, Revocar Link'}
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   )}

    </div>
  );
}
