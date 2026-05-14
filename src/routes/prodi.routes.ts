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
import { requireResourceAccess } from '../middlewares/resourceAccess.middleware';
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
  requireResourceAccess('prodi', 'read', 'id'),
  getProdiByIdHandler
);

router.put(
  '/:id',
  requireResourceAccess('prodi', 'write', 'id'),
  validate(updateProdiSchema),
  updateProdiHandler
);

router.get(
  '/:id/accreditation',
  requireResourceAccess('prodi', 'read', 'id'),
  getAccreditationHandler
);

router.put(
  '/:id/accreditation',
  requireResourceAccess('prodi', 'write', 'id'),
  validate(upsertAccreditationSchema),
  upsertAccreditationHandler
);

router.post(
  '/:id/accreditation/certificate',
  requireResourceAccess('prodi', 'write', 'id'),
  uploadCertificateMiddleware.single('file'),
  uploadCertificateHandler
);

router.get(
  '/:id/accreditation/certificate',
  requireResourceAccess('prodi', 'read', 'id'),
  getCertificateFileHandler
);

router.get('/:prodiId/dashboard', requireResourceAccess('prodi', 'read', 'prodiId'), getDashboardByProdiHandler);
router.put('/:prodiId/dashboard', requireResourceAccess('prodi', 'write', 'prodiId'), validate(updateDashboardSchema), updateDashboardByProdiHandler);

export default router;
