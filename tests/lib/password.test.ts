// tests/lib/password.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, PasswordSchema } from '@/lib/password';

describe('hashPassword / verifyPassword', () => {
  it('hashea y verifica correctamente', async () => {
    const plain = 'MiPass123!';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true); // formato bcrypt
    expect(await verifyPassword(plain, hash)).toBe(true);
    expect(await verifyPassword('Incorrecto1!', hash)).toBe(false);
  });

  it('genera hashes distintos para la misma contraseña (salt único)', async () => {
    const [h1, h2] = await Promise.all([
      hashPassword('MiPass123!'),
      hashPassword('MiPass123!'),
    ]);
    expect(h1).not.toBe(h2);
  });
});

describe('PasswordSchema', () => {
  it('acepta contraseña válida larga', () => {
    expect(() => PasswordSchema.parse('MiPassSegura1!')).not.toThrow();
  });

  it('rechaza contraseña muy corta (menos de 8 chars)', () => {
    expect(() => PasswordSchema.parse('Ab1!')).toThrow();
  });

  it('rechaza sin mayúscula', () => {
    expect(() => PasswordSchema.parse('minusculas1!')).toThrow();
  });

  it('rechaza sin número', () => {
    expect(() => PasswordSchema.parse('SinNumero!!')).toThrow();
  });

  it('rechaza sin carácter especial', () => {
    expect(() => PasswordSchema.parse('SinEspecial1A')).toThrow();
  });

  it('acepta con longitud exacta de 8 si cumple todos los requisitos', () => {
    expect(() => PasswordSchema.parse('Abc123!X')).not.toThrow();   // 8 chars, todos los requisitos
  });
});
