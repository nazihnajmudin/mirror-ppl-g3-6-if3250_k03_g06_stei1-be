import { Router } from 'express';
import { importLEDHandler, exportLEDHandler, getLEDHistoryHandler, getAvailablePeriodsHandler, exportLEDByIdHandler } from '../controllers/led.controller';
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
    requireRole(Role.KAPRODI, Role.TIM_PRODI),
    uploadLEDMiddleware.single('file'),
    validate(importLEDSchema),
    importLEDHandler
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

export default router;