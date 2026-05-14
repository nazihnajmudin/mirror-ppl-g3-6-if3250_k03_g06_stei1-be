import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllPenugasanHandler,
  createPenugasanHandler,
  deletePenugasanHandler,
} from '../controllers/penugasan.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { requireResourceAccess } from '../middlewares/resourceAccess.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Role } from '@prisma/client';
import { createPenugasanSchema } from '../validators/penugasan.validator';
import { errorResponse } from '../utils/response';

const router = Router();

router.use(authenticate);

// Middleware internal untuk cek prodiId di body
const validateProdiInBody = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  const bodyProdiId = req.body.prodiId;
  if (user.role === Role.KAPRODI && user.prodiId !== bodyProdiId) {
    return errorResponse(res, 'Akses ditolak: Anda hanya dapat membuat penugasan untuk prodi Anda sendiri', 403);
  }
  next();
};

router.get('/', requireRole(Role.SUPER_ADMIN, Role.KAPRODI), getAllPenugasanHandler);
router.post('/', requireRole(Role.SUPER_ADMIN, Role.KAPRODI), validate(createPenugasanSchema), validateProdiInBody, createPenugasanHandler);
router.delete('/:id', requireRole(Role.SUPER_ADMIN, Role.KAPRODI), requireResourceAccess('penugasan', 'write', 'id'), deletePenugasanHandler);

export default router;