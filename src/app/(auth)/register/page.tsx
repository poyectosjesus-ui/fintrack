'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { api } from '@/lib/api-client';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', workspaceName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const getStrengthProgress = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const strength = getStrengthProgress(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (strength < 75) {
      setError('La contraseña es demasiado débil. Usa al menos 8 caracteres, mayúsculas y números.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post<any>('/api/auth/register', form);
      
      if (res.error) {
        setError(res.error);
        return;
      }

      // Login automagico despues de registrar -> signIn credentials
      const signInRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError('Cuenta creada, pero hubo un error al auto-ingresar. Por favor inicia sesión.');
        router.push('/login');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Error inesperado al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Crear Cuenta</h1>
        <p className="text-sm text-zinc-400 mt-2">Comienza a organizar tus finanzas hoy</p>
      </div>

      {error && <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="name">Nombre completo</label>
          <input
            id="name"
            type="text"
            required
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={loading}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
          />
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${strength <= 25 ? 'bg-red-500' : strength <= 75 ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
              style={{ width: `${strength}%` }} 
            />
          </div>
          <p className="text-xs text-zinc-500">Mín. 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="wsName">Nombre del Workspace (opcional)</label>
          <input
            id="wsName"
            type="text"
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
            placeholder="Ej. Finanzas Familiares"
            value={form.workspaceName}
            onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
            disabled={loading}
          />
        </div>

        <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>

      <div className="text-center mt-4 text-sm text-zinc-400">
        <p>¿Ya tienes cuenta? <Link href="/login" className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300 transition-colors">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
