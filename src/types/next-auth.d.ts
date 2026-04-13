// src/types/next-auth.d.ts
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      workspaceId: string | null;
      role: string | null;
    };
  }

  interface User {
    workspaceId?: string | null;
    role?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    workspaceId: string | null;
    role: string | null;
  }
}
