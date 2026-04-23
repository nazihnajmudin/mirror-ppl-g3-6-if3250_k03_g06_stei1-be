import { Router } from 'express';
import multer from 'multer';
import {
  previewLKPSHandler,
  confirmLKPSHandler,
  getLKPSHistoryHandler,
  exportLKPSHandler,
  getLKPSDocumentHandler,
  updateLKPSDocumentHandler,
} from '../controllers/lkps.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } 
});

/**
 * @swagger
 * tags:
 *   name: LKPS
 *   description: Manajemen Laporan Kinerja Program Studi
 */

router.use(authenticate);

// 1. Get/Update Single Document (Matches UUIDs, prioritized over history/export)
router.get('/:id', getLKPSDocumentHandler);
router.put('/:id', updateLKPSDocumentHandler);

// 2. High priority fixed routes
router.post('/preview', upload.single('file'), previewLKPSHandler);
router.post('/confirm', upload.single('file'), confirmLKPSHandler);

// 3. History and Export
router.get('/history/:prodiId', getLKPSHistoryHandler);
router.get('/export/:id', exportLKPSHandler);

export default router;
