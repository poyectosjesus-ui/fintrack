// src/lib/api-client.ts
export class ApiError extends Error {
  constructor(public statusCode: number, public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const url = path.startsWith('http') ? path : `${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = body?.message || `HTTP Error ${response.status}`;
      return { data: null, error: msg, status: response.status };
    }

    // El backend v2 retorna { success: true, data: T } en OK responses
    // o a veces paginado: { success: true, data: T[], meta: ... }
    // Devolvemos el body completo para que el frontend pueda leer .meta si existe,
    // o si el endpoint solo retorna el objeto, lo devolvemos.
    // Por simplicidad, consideramos que el backend envia body.data, pero si no, es body.
    const data = body?.data !== undefined ? body.data : body;
    
    // Si hay paginacion, pasamos el objeto completo para no perder meta
    const finalData = body?.meta ? body : data;

    return { data: finalData as T, error: null, status: response.status };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network request failed', status: 0 };
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) => {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const query = searchParams.toString();
      if (query) url += `?${query}`;
    }
    return apiFetch<T>(url);
  },
  post: <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
