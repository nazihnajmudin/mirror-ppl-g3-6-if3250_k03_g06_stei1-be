import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/response';
import prisma from '../config/database.config';

export interface JwtPayload {
  userId: string;
  name: string;
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
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    
    // Validasi apakah user masih ada dan aktif di DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isActive: true }
    });

    if (!user) {
      errorResponse(res, 'Sesi tidak valid: Pengguna tidak ditemukan', 401);
      return;
    }

    if (!user.isActive) {
      errorResponse(res, 'Sesi tidak valid: Akun Anda telah dinonaktifkan', 401);
      return;
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      errorResponse(res, 'Token telah kedaluwarsa', 401);
    } else {
      errorResponse(res, 'Token tidak valid', 401);
    }
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