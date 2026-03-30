import { Router } from 'express';
import { importLEDHandler, exportLEDHandler, getLEDHistoryHandler } from '../controllers/led.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { uploadLEDMiddleware } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { importLEDSchema } from '../validators/led.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Import LED
router.post(
    '/import',
    requireRole(Role.ADMIN_INSTITUSI, Role.PIMPINAN, Role.KAPRODI, Role.ADMIN_PRODI),
    uploadLEDMiddleware.single('file'),
    validate(importLEDSchema),
    importLEDHandler
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

export default router;