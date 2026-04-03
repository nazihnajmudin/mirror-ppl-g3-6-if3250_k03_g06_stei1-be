import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.config';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/response';

/**
 * Middleware untuk memeriksa apakah pengguna memiliki akses ke prodi tertentu berdasarkan peran dan program studi yang ditugaskan.
 * @param permission 
 * @returns 
 */
export const requireProdiAccess = (permission: 'read' | 'write' = 'read') => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const prodiId = String(req.params.prodiId);
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;

    if (!userId) {
      errorResponse(res, 'Pengguna tidak terautentikasi', 401);
      return;
    }

    try {
      let canEdit = false;
      let canAccess = false;

      // SUPER_ADMIN & PIMPINAN: read-only semua prodi
      if (userRole === Role.SUPER_ADMIN || userRole === Role.PIMPINAN) {
        if (permission === 'write') {
          errorResponse(res, 'Super Admin dan Pimpinan hanya dapat membaca data prodi', 403);
          return;
        }
        canAccess = true;
        canEdit = false; // Read-only

        // Attach access info ke request
        (req as any).prodiAccessInfo = {
          canEdit,
          canAccess,
          role: userRole,
          isReadOnly: true,
        };
        next();
        return;
      }

      // KAPRODI: read + write prodi sendiri
      if (userRole === Role.KAPRODI) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { prodiId: true },
        });
        if (user?.prodiId === prodiId) {
          canAccess = true;
          canEdit = true; // Can edit own prodi

          // Attach access info ke request
          (req as any).prodiAccessInfo = {
            canEdit,
            canAccess,
            role: userRole,
            isReadOnly: false,
          };
          next();
          return;
        }
        errorResponse(res, 'Anda tidak memiliki akses ke prodi ini', 403);
        return;
      }

      // TIM_PRODI: read-only untuk prodi yang ditugaskan
      if (userRole === Role.TIM_PRODI) {
        if (permission === 'write') {
          errorResponse(res, 'Tim Prodi tidak dapat mengubah data prodi', 403);
          return;
        }

        const assignment = await prisma.prodiAssignment.findUnique({
          where: { userId_prodiId: { userId, prodiId } },
        });

        if (assignment) {
          canAccess = true;
          canEdit = false; // Read-only for TIM_PRODI

          // Attach access info ke request
          (req as any).prodiAccessInfo = {
            canEdit,
            canAccess,
            role: userRole,
            isReadOnly: true,
          };
          next();
          return;
        }
        errorResponse(res, 'Anda tidak memiliki akses ke prodi ini', 403);
        return;
      }

      // Role lain ditolak
      errorResponse(res, 'Role tidak memiliki akses ke resource ini', 403);
    } catch (err: any) {
      errorResponse(res, 'Terjadi kesalahan saat memeriksa akses prodi', 500);
    }
  };
};

/**
 * Get user access info untuk dashboard (role dan edit permission)
 */
export const getUserProdiAccessInfo = async (userId: string, prodiId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      prodiId: true,
    },
  });

  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  const canEdit =
    user.role === Role.KAPRODI && user.prodiId === prodiId;

  const canAccess =
    user.role === Role.SUPER_ADMIN ||
    user.role === Role.PIMPINAN ||
    (user.role === Role.KAPRODI && user.prodiId === prodiId) ||
    (user.role === Role.TIM_PRODI &&
      (await prisma.prodiAssignment.findUnique({
        where: { userId_prodiId: { userId, prodiId } },
      })));

  return {
    canEdit,
    canAccess,
    role: user.role,
    isReadOnly: !canEdit,
  };
};
