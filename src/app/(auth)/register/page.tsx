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
    <div className="auth-form-wrapper">
      <h1 className="auth-title">Crear Cuenta</h1>
      <p className="auth-subtitle">Comienza a organizar tus finanzas hoy</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Nombre completo</label>
          <input
            id="name"
            type="text"
            required
            className="form-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            className="form-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            className="form-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
          />
          <div className="password-strength-bar">
            <div 
              className={`strength-fill ${strength <= 25 ? 'weak' : strength <= 75 ? 'medium' : 'strong'}`} 
              style={{ width: `${strength}%` }} 
            />
          </div>
          <p className="auth-hint">Mín. 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="wsName">Nombre del Workspace (opcional)</label>
          <input
            id="wsName"
            type="text"
            className="form-input"
            placeholder="Ej. Finanzas Familiares"
            value={form.workspaceName}
            onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>

      <div className="auth-footer">
        <p>¿Ya tienes cuenta? <Link href="/login" className="auth-link">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
