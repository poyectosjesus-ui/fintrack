import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      {/* Columna Izquierda: Formulario */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 items-center flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-xl shadow-lg ring-1 ring-indigo-500/50">💰</div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white">FinanceTracker</div>
              <div className="text-xs text-zinc-400">Control de Finanzas Personales</div>
            </div>
          </div>
          {children}
        </div>
      </div>
      {/* Columna Derecha: Arte */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-br from-zinc-900 to-indigo-950 mix-blend-multiply flex flex-col justify-center p-20">
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Toma el control de tu futuro financiero</h2>
          <p className="text-lg text-indigo-200 max-w-xl">Domina tus finanzas, presupuesta de manera inteligente y alcanza tus metas más rápido con analíticas de nivel empresarial.</p>
        </div>
      </div>
    </div>
  );
}
