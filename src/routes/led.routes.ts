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
  toggleDocumentLEDStatusHandler,
  toggleLEDFormStatusHandler,
  updateLEDFormHandler,
} from '../controllers/led.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { requireResourceAccess } from '../middlewares/resourceAccess.middleware';
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
    requireResourceAccess('led_form', 'read', 'id'),
    exportLEDFormHandler
);

// Export Specific LED
router.get(
    '/export/document/:id',
    requireResourceAccess('led_document', 'read', 'id'),
    exportLEDByIdHandler
);

// Export/Download LED
router.get(
    '/export/:prodiId/:periode',
    requireResourceAccess('prodi', 'read', 'prodiId'),
    exportLEDHandler
);

// Upload History
router.get(
    '/history/:prodiId/:periode',
    requireResourceAccess('prodi', 'read', 'prodiId'),
    getLEDHistoryHandler
);

// Available Acreditation Periods
router.get(
    '/periods/:prodiId', 
    requireResourceAccess('prodi', 'read', 'prodiId'),
    getAvailablePeriodsHandler
);

// Soft Delete Single (Draft atau Final)
router.delete(
    '/document/:id', 
    requireResourceAccess('led_document', 'write', 'id'),
    requireRole(Role.SUPER_ADMIN), 
    softDeleteDocumentHandler
);

// Soft Delete All Drafts
router.delete(
    '/periode/:prodiId/:periode', 
    requireResourceAccess('prodi', 'write', 'prodiId'),
    requireRole(Role.SUPER_ADMIN), 
    softDeleteAllDraftsHandler
);


router.post(
    '/form/:prodiId',
    requireResourceAccess('prodi', 'write', 'prodiId'),
    requireRole(Role.KAPRODI, Role.TIM_PRODI),
    validate(createLEDFormSchema),
    createLEDFormHandler
);

router.get(
    '/form/history/:prodiId/:periode',
    requireResourceAccess('prodi', 'read', 'prodiId'),
    getLEDFormHistoryHandler
);

router.get(
    '/form/:versionId',
    requireResourceAccess('led_form', 'read', 'versionId'),
    getLEDFormVersionHandler
);

router.post(
    '/upload/image',
    requireRole(Role.KAPRODI, Role.TIM_PRODI),
    uploadLEDImageMiddleware.single('image'),
    uploadLEDImageHandler
);

router.put(
    '/document/status/:id', 
    requireResourceAccess('led_document', 'write', 'id'),
    requireRole(Role.SUPER_ADMIN, Role.KAPRODI), 
    toggleDocumentLEDStatusHandler
);
router.put(
    '/form/status/:id', 
    requireResourceAccess('led_form', 'write', 'id'),
    requireRole(Role.SUPER_ADMIN, Role.KAPRODI), 
    toggleLEDFormStatusHandler
);

router.put(
    '/form/version/:id',
    requireResourceAccess('led_form', 'write', 'id'),
    requireRole(Role.KAPRODI, Role.TIM_PRODI),
    updateLEDFormHandler
);

export default router;