import { Router } from 'express';
import {
  getAllProdiHandler,
  getProdiByIdHandler,
  updateProdiHandler,
  getAccreditationHandler,
  upsertAccreditationHandler,
} from '../controllers/prodi.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Role } from '@prisma/client';
import { updateProdiSchema, upsertAccreditationSchema } from '../validators/prodi.validator';

/**
 * @swagger
 * tags:
 *   name: Prodi
 *   description: Manajemen profil program studi
 */

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole(Role.SUPER_ADMIN, Role.PIMPINAN),
  getAllProdiHandler
);

router.get(
  '/:id',
  requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI),
  getProdiByIdHandler
);

router.put(
  '/:id',
  requireRole(Role.SUPER_ADMIN, Role.KAPRODI),
  validate(updateProdiSchema),
  updateProdiHandler
);

router.get(
  '/:id/accreditation',
  requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI, Role.TIM_PRODI),
  getAccreditationHandler
);

router.put(
  '/:id/accreditation',
  requireRole(Role.SUPER_ADMIN),
  validate(upsertAccreditationSchema),
  upsertAccreditationHandler
);

export default router;