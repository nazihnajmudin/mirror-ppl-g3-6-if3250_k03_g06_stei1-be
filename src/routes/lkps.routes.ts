import { Router } from 'express';
import multer from 'multer';
import {
  previewLKPSHandler,
  confirmLKPSHandler,
  getLKPSHistoryHandler,
  exportLKPSHandler,
} from '../controllers/lkps.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: LKPS
 *   description: Manajemen Laporan Kinerja Program Studi
 */

router.use(authenticate);

// 1. Preview Excel upload
router.post('/preview', upload.single('file'), previewLKPSHandler);

// 2. Confirm import (Save as Document + Save File)
router.post('/confirm', upload.single('file'), confirmLKPSHandler);

// 3. Get History for a Program
router.get('/history/:prodiId', getLKPSHistoryHandler);

// 4. Export as Excel
router.get('/export/:id', exportLKPSHandler);

export default router;
