// src/lib/rate-limit.ts
// Rate limiter in-memory. Para producción multi-instancia usar @upstash/ratelimit con Redis.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export async function rateLimit(
  identifier: string,
  limit = 60,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs, retryAfterSeconds: 0 };
  }

  entry.count++;

  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
    retryAfterSeconds: 0,
  };
}

// Limpiar entradas expiradas periódicamente (evitar memory leak)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000); // cada 5 minutos
}
