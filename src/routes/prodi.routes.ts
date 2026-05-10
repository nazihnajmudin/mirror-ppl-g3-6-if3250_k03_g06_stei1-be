import { Router } from 'express';
import {
  getAllProdiHandler,
  getMyProdiHandler,
  getProdiByIdHandler,
  updateProdiHandler,
  getAccreditationHandler,
  upsertAccreditationHandler,
  uploadCertificateHandler,
  getCertificateFileHandler,
  getDashboardByProdiHandler,
  updateDashboardByProdiHandler,
} from '../controllers/prodi.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { requireProdiAccess } from '../middlewares/prodi.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadCertificateMiddleware } from '../middlewares/upload.middleware';
import { Role } from '@prisma/client';
import { updateProdiSchema, upsertAccreditationSchema, updateDashboardSchema } from '../validators/prodi.validator';

/**
 * @swagger
 * tags:
 *   name: Prodi
 *   description: Manajemen profil dan dashboard program studi
 */

const router = Router();

router.use(authenticate);

router.get('/my-prodi', getMyProdiHandler);

router.get(
  '/',
  requireRole(Role.SUPER_ADMIN, Role.PIMPINAN),
  getAllProdiHandler
);

router.get(
  '/:id',
  requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI, Role.TIM_PRODI),
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
  requireRole(Role.SUPER_ADMIN, Role.KAPRODI),
  validate(upsertAccreditationSchema),
  upsertAccreditationHandler
);

router.post(
  '/:id/accreditation/certificate',
  requireRole(Role.SUPER_ADMIN, Role.KAPRODI),
  uploadCertificateMiddleware.single('file'),
  uploadCertificateHandler
);

router.get(
  '/:id/accreditation/certificate',
  requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI, Role.TIM_PRODI),
  getCertificateFileHandler
);

router.get('/:prodiId/dashboard', requireProdiAccess('read'), getDashboardByProdiHandler);
router.put('/:prodiId/dashboard', requireProdiAccess('write'), validate(updateDashboardSchema), updateDashboardByProdiHandler);

export default router;
