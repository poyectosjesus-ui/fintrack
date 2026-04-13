import { Resend } from 'resend';

// Inicializar la instancia de Resend si existe el API Key
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
