import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/response';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  prodiId?: string | null;
}

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

/**
 * Middleware untuk memverifikasi token JWT dan menambahkan informasi pengguna ke objek request.
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Token autentikasi tidak ditemukan', 401);
    return;
  }
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    errorResponse(res, 'Konfigurasi server tidak valid', 500);
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    errorResponse(res, 'Token tidak valid atau telah kedaluwarsa', 401);
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Tidak terautentikasi', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Akses ditolak: role tidak memiliki izin', 403);
      return;
    }
    next();
  };
};

export const onlyPimpinan = requireRole('PIMPINAN');
export const onlySuperAdmin = requireRole('SUPER_ADMIN');
export const pimpinanAndSuperAdmin = requireRole('PIMPINAN', 'SUPER_ADMIN');
export const prodiStaff = requireRole('KAPRODI', 'TIM_PRODI');
export const allRoles = requireRole('SUPER_ADMIN', 'PIMPINAN', 'KAPRODI', 'TIM_PRODI');