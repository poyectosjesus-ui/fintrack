import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [], // Agregados en auth.ts para no romper Edge Runtime
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id          = (user.id ?? '') as string;
        token.workspaceId = ((user as any).workspaceId ?? null) as string | null;
        token.role        = ((user as any).role ?? null) as string | null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id          = token.id as string;
      session.user.workspaceId = token.workspaceId as string | null;
      session.user.role        = token.role as string | null;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 días
  },
  trustHost: true,
} satisfies NextAuthConfig;
