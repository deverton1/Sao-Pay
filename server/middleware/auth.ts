import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken } from "../utils/auth";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    login: string;
    tipo: string;
    nome: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }

  req.user = decoded;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    next();
  };
}
