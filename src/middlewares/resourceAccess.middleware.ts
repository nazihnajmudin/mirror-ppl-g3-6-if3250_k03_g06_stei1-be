import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.config';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/response';

export type ResourceType = 
  | 'lkps_document' 
  | 'lkps_criteria' 
  | 'led_document' 
  | 'led_form' 
  | 'eviden' 
  | 'eviden_file'
  | 'prodi'
  | 'accreditation_simulation'
  | 'penugasan';

/**
 * Middleware untuk memvalidasi akses pengguna ke resource tertentu (LKPS, LED, Eviden, dll)
 * berdasarkan prodiId yang terkait dengan resource tersebut.
 */
export const requireResourceAccess = (
  resourceType: ResourceType,
  permission: 'read' | 'write' = 'read',
  idParamName: string = 'id'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const resourceId = req.params[idParamName];
    const user = req.user as any;

    if (!user) {
      errorResponse(res, 'Tidak terautentikasi', 401);
      return;
    }

    try {
      let prodiId: string | null = null;

      // 1. Resolve prodiId berdasarkan tipe resource
      switch (resourceType) {
        case 'prodi':
          prodiId = resourceId;
          break;
        case 'lkps_document':
          const lkpsDoc = await prisma.documentLKPS.findUnique({ 
            where: { id: resourceId }, 
            select: { prodiId: true } 
          });
          prodiId = lkpsDoc?.prodiId || null;
          break;
        case 'lkps_criteria':
          const criteria = await prisma.lKPSCriteria.findUnique({
            where: { id: resourceId },
            select: { document: { select: { prodiId: true } } }
          });
          prodiId = criteria?.document?.prodiId || null;
          break;
        case 'led_document':
          const ledDoc = await prisma.documentLED.findUnique({ 
            where: { id: resourceId }, 
            select: { prodiId: true } 
          });
          prodiId = ledDoc?.prodiId || null;
          break;
        case 'led_form':
          const form = await prisma.ledForm.findUnique({ 
            where: { id: resourceId }, 
            select: { prodiId: true } 
          });
          prodiId = form?.prodiId || null;
          break;
        case 'eviden':
          const eviden = await prisma.dokumenEviden.findUnique({ 
            where: { id: resourceId }, 
            select: { prodiId: true } 
          });
          prodiId = eviden?.prodiId || null;
          break;
        case 'eviden_file':
          const file = await prisma.evidenFile.findUnique({
            where: { id: resourceId },
            select: { eviden: { select: { prodiId: true } } }
          });
          prodiId = (file as any)?.eviden?.prodiId || null;
          break;
        case 'accreditation_simulation':
          const simulation = await prisma.accreditationSimulation.findUnique({
            where: { id: resourceId },
            select: { prodiId: true }
          });
          prodiId = simulation?.prodiId || null;
          break;
        case 'penugasan':
          const assignment = await prisma.prodiAssignment.findUnique({
            where: { id: resourceId },
            select: { prodiId: true }
          });
          prodiId = assignment?.prodiId || null;
          break;
      }

      if (!prodiId) {
        errorResponse(res, 'Resource tidak ditemukan', 404);
        return;
      }

      const userRole = user.role as Role;
      const userId = user.userId;

      // SUPER_ADMIN & PIMPINAN: 
      if (userRole === Role.SUPER_ADMIN || userRole === Role.PIMPINAN) {
        // Pimpinan selalu read-only
        if (userRole === Role.PIMPINAN && permission === 'write') {
          errorResponse(res, 'Akses ditolak: Pimpinan hanya memiliki akses baca', 403);
          return;
        }
        // Super Admin bisa write untuk beberapa operasi (toggle status, delete)
        // Jika route membolehkan write, Super Admin lewat
        next();
        return;
      }

      // KAPRODI: read + write prodi sendiri
      if (userRole === Role.KAPRODI) {
        if (user.prodiId === prodiId) {
          next();
          return;
        }
        errorResponse(res, 'Akses ditolak: Resource milik program studi lain', 403);
        return;
      }

      // TIM_PRODI: read + write prodi yang ditugaskan (jika kriteria cocok atau ditugaskan umum)
      if (userRole === Role.TIM_PRODI) {
        const assignment = await prisma.prodiAssignment.findUnique({
          where: { userId_prodiId: { userId, prodiId } }
        });

        if (assignment) {
          next();
          return;
        }
        errorResponse(res, 'Akses ditolak: Anda tidak ditugaskan di program studi ini', 403);
        return;
      }

      errorResponse(res, 'Akses ditolak: Role tidak memiliki izin', 403);
    } catch (err: any) {
      console.error('Resource Access Error:', err);
      errorResponse(res, 'Terjadi kesalahan saat memverifikasi akses resource', 500);
    }
  };
};
