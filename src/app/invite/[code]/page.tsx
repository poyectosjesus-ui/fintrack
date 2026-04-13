'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, AlertCircle, Building2, UserCircle2, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InviteLandingPage() {
  const router = useRouter();
  const params = useParams();
  const code = params?.code as string;
  const { data: session, status: sessionStatus } = useSession();

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!code) return;
    api.get(`/api/invite/${code}`).then(res => {
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setInvite(res.data);
      }
    });
  }, [code]);

  const handleAccept = async () => {
    // Si no está autenticado, mandarlo al login con callback Url
    if (!session?.user) {
      router.push(`/login?callbackUrl=/invite/${code}`);
      return;
    }

    setAccepting(true);
    setErrorMsg('');
    const res = await api.post('/api/invite/accept', { code });
    setAccepting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      // Éxito: mandar al dashboard principal
      router.push('/');
    }
  };

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></span>
      </div>
    );
  }

  // Errores graves del Link
  if (!invite && errorMsg) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
        <Card className="w-full max-w-md bg-zinc-950 border border-red-500/20 shadow-2xl overflow-hidden text-center relative p-12">
          <div className="absolute top-0 right-0 w-full h-full bg-red-500/5 blur-3xl" />
          <AlertCircle size={64} className="text-red-500 mx-auto mb-6 relative z-10" />
          <h1 className="text-2xl font-black text-white mb-2 relative z-10">Link Inválido</h1>
          <p className="text-zinc-400 font-medium relative z-10">{errorMsg}</p>
          <Button onClick={() => router.push('/')} variant="outline" className="mt-8 border-zinc-700 bg-black relative z-10">Volver al Inicio</Button>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > new Date(invite.expiresAt);
  const isValid = invite.status === 'PENDING' && !isExpired;
  
  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-lg bg-[#0d0d0f] border border-zinc-800 shadow-2xl relative z-10 overflow-hidden rounded-3xl">
         
         <div className="p-8 sm:p-10 border-b border-zinc-800/60 pb-8 text-center bg-zinc-900/40 relative">
            <div className="w-20 h-20 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6 relative">
              <Building2 size={32} className="text-indigo-400" />
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1.5 border-4 border-[#0d0d0f]">
                <CheckCircle2 size={14} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">¡Has sido invitado!</h1>
            <p className="text-sm text-zinc-400 font-medium">Únete a una bóveda financiera compartida.</p>
         </div>

         <CardContent className="p-8 sm:p-10 space-y-8">
            {/* The Invite Data UI */}
            <div className="bg-black border border-zinc-800/80 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                <div className="flex flex-col items-center gap-4 relative z-10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-900 rounded-full grid place-items-center border border-zinc-700">
                         <UserCircle2 size={20} className="text-white"/>
                      </div>
                      <div className="text-left leading-tight">
                         <p className="text-sm font-bold text-white">{invite.invitedBy.name}</p>
                         <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Administrador</p>
                      </div>
                   </div>
                   <div className="h-4 w-px bg-zinc-800"></div>
                   <div className="text-center">
                     <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Espacio Destino</p>
                     <p className="text-xl font-black text-indigo-400">{invite.workspace.name}</p>
                     <p className="text-xs text-zinc-600 font-bold uppercase mt-1 tracking-widest">Rol: {invite.role}</p>
                   </div>
                </div>
            </div>

            {/* Error or Restrictions */}
            {!isValid && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
                 <p className="text-sm font-bold text-rose-500">
                    {isExpired ? 'Este enlace de acceso ha expirado por protocolos de seguridad.' : `Esta invitación ya no es válida (Status: ${invite.status}).`}
                 </p>
              </div>
            )}

            {errorMsg && isValid && (
              <p className="text-sm font-bold text-rose-500 text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{errorMsg}</p>
            )}

         </CardContent>

         <CardFooter className="p-8 sm:p-10 pt-0 flex flex-col gap-4">
            <Button 
               disabled={!isValid || accepting} 
               onClick={handleAccept} 
               className="w-full h-14 text-base font-extrabold rounded-2xl shadow-xl hover:-translate-y-0.5 transition-transform bg-indigo-600 hover:bg-indigo-500 text-white"
            >
               {accepting ? 'Verificando Criptografía...' : session?.user ? 'Entrar a la Bóveda' : 'Iniciar Sesión para Aceptar'} <ArrowRight size={18} className="ml-2"/>
            </Button>
            
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center mt-2">
              Código de Acceso: <span className="text-zinc-500">{invite.code}</span>
            </p>
         </CardFooter>
      </Card>
    </div>
  );
}
