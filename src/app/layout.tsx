import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Finance Tracker | Análisis de Gastos e Ingresos",
  description:
    "Analiza tus gastos e ingresos por semana y quincena con gráficas detalladas y reportes inteligentes.",
  keywords: "finanzas personales, gastos, ingresos, análisis, presupuesto, pwa",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinTracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
