// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',  // cyan
  info:  '\x1b[32m',  // green
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
};
const RESET = '\x1b[0m';

function log(level: LogLevel, data: unknown) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    ...(typeof data === 'string' ? { message: data } : (data as object)),
  };

  if (process.env.NODE_ENV === 'production') {
    // JSON estructurado para Datadog / CloudWatch / Loki
    const fn = level === 'error' ? console.error : console.log;
    fn(JSON.stringify(entry));
  } else {
    // Colorizado para desarrollo
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`${COLORS[level]}[${level.toUpperCase()}]${RESET}`, entry);
  }
}

export const logger = {
  debug: (data: unknown) => log('debug', data),
  info:  (data: unknown) => log('info', data),
  warn:  (data: unknown) => log('warn', data),
  error: (data: unknown) => log('error', data),
};
