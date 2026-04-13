import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from './prisma';
import { verifyPassword } from './password';
import { authConfig } from './auth.config';

const LoginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            memberships: {
              include: { workspace: { select: { id: true, name: true, currency: true } } },
              orderBy: { joinedAt: 'desc' },
              take: 1,
            },
          },
        });

        if (!user?.passwordHash) return null;

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        const membership = user.memberships[0];

        return {
          id:          user.id,
          email:       user.email,
          name:        user.name,
          image:       user.avatarUrl,
          workspaceId: membership?.workspaceId ?? null,
          role:        membership?.role ?? null,
        };
      },
    }),
  ],
});
