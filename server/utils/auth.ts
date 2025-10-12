import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Usuario } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "sao-pay-secret-key-change-in-production";
const JWT_EXPIRES_IN = "8h";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(usuario: Usuario): string {
  return jwt.sign(
    {
      id: usuario.id,
      login: usuario.login,
      tipo: usuario.tipo,
      nome: usuario.nome,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
