import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinanceTracker Enterprise',
    short_name: 'Finanzas',
    description: 'Control de finanzas personales, análisis de gastos e ingresos en tiempo real.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    orientation: 'portrait',
    icons: [
      {
        src: '/icono.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icono.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
