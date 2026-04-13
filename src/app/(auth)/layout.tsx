import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-panel auth-left">
        <div className="auth-content">
          <div className="navbar-brand" style={{ marginBottom: '2rem' }}>
            <div className="brand-icon">💰</div>
            <div>
              <div className="brand-name">FinanceTracker</div>
              <div className="brand-sub">Control de Finanzas Personales</div>
            </div>
          </div>
          {children}
        </div>
      </div>
      <div className="auth-panel auth-right">
        <div className="auth-decorative">
          <h2 className="auth-tagline">Toma el control de tu futuro financiero</h2>
          <p className="auth-subtagline">Domina tus finanzas, presupuesta de manera inteligente y alcanza tus metas más rápido.</p>
        </div>
      </div>
    </div>
  );
}
