import { Router } from 'express';
import {
  importLEDHandler,
  exportLEDHandler,
  getLEDHistoryHandler,
  getAvailablePeriodsHandler,
  exportLEDByIdHandler,
  softDeleteDocumentHandler,
  softDeleteAllDraftsHandler,
  createLEDFormHandler,
  getLEDFormHistoryHandler,
  getLEDFormVersionHandler,
  exportLEDFormHandler,
  uploadLEDImageHandler,
} from '../controllers/led.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { uploadLEDMiddleware, uploadLEDImageMiddleware } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { importLEDSchema, createLEDFormSchema } from '../validators/led.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Import LED
router.post(
    '/import',
    requireRole(Role.KAPRODI, Role.TIM_PRODI),
    uploadLEDMiddleware.single('file'),
    validate(importLEDSchema),
    importLEDHandler
);

// Export LED Form
router.get(
    '/export/form/:id',
    exportLEDFormHandler
);

// Export Specific LED
router.get(
    '/export/document/:id',
    exportLEDByIdHandler
);

// Export/Download LED
router.get(
    '/export/:prodiId/:periode',
    exportLEDHandler
);

// Upload History
router.get(
    '/history/:prodiId/:periode',
    getLEDHistoryHandler
);

// Available Acreditation Periods
router.get(
    '/periods/:prodiId', 
    getAvailablePeriodsHandler
);

// Soft Delete Single (Draft atau Final)
router.delete(
    '/document/:id', 
    requireRole(Role.SUPER_ADMIN), 
    softDeleteDocumentHandler
);

// Soft Delete All Drafts
router.delete(
    '/periode/:prodiId/:periode', 
    requireRole(Role.SUPER_ADMIN), 
    softDeleteAllDraftsHandler
);


router.post(
    '/form/:prodiId',
    requireRole(Role.KAPRODI, Role.TIM_PRODI),
    validate(createLEDFormSchema),
    createLEDFormHandler
);

router.get(
    '/form/history/:prodiId/:periode',
    getLEDFormHistoryHandler
);

router.get(
    '/form/:versionId',
    getLEDFormVersionHandler
);

router.post(
    '/upload/image',
    requireRole(Role.KAPRODI, Role.TIM_PRODI),
    uploadLEDImageMiddleware.single('image'),
    uploadLEDImageHandler
);

export default router;