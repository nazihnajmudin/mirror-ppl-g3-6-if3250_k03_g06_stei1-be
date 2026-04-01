import { Router } from 'express';
import multer from 'multer';
import { 
  importLKPSHandler, 
  exportLKPSHandler, 
  getLKPSHandler 
} from '../controllers/lkps.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { uploadLKPSMiddleware } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { importLKPSSchema } from '../validators/lkps.validator';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: LKPS
 *   description: Manajemen Laporan Kinerja Program Studi (LKPS)
 */

// All LKPS routes require authentication
router.use(authenticate);

router.get('/:id', getLKPSHandler);
router.post(
  '/import', 
  requireRole(Role.KAPRODI, Role.TIM_PRODI),
  uploadLKPSMiddleware.single('file'), // Buffer
  validate(importLKPSSchema),
  importLKPSHandler
);
router.get('/export/:id', exportLKPSHandler);

export default router;
