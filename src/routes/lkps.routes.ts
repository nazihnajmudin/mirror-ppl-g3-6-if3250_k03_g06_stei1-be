import { Router } from 'express';
import multer from 'multer';
import {
  previewLKPSHandler,
  confirmLKPSHandler,
  getLKPSHistoryHandler,
  exportLKPSHandler,
  getLKPSDocumentHandler,
  updateLKPSDocumentHandler,
  getLKPSSheetHandler,
  updateLKPSSheetHandler,
  completeSheetHandler,
  getSheetConfigHandler,
  getSheetsByProgramHandler,
  getDocumentSheetsHandler,
  autoSaveLKPSSheetHandler,
  saveLKPSDocumentAsDraftHandler,
  finalizeLKPSDocumentHandler,
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

// 1. Helper routes (get config, sheets by program, etc) - BEFORE specific ID routes
router.get('/config/:sheetName', getSheetConfigHandler);
router.get('/sheets-by-program/:programType', getSheetsByProgramHandler);
router.get('/document/:documentId/sheets', getDocumentSheetsHandler);

// 2. Sheet-level operations (must be before document routes to avoid conflicts)
router.get('/sheet/:criteriaId/:sheetName', getLKPSSheetHandler);
router.put('/sheet/:criteriaId/:sheetName', updateLKPSSheetHandler);
router.put('/sheet/:criteriaId/:sheetName/autosave', autoSaveLKPSSheetHandler);
router.post('/sheet/:criteriaId/:sheetName/complete', completeSheetHandler);

// 3. Document-level operations (save draft, finalize)
router.post('/document/:documentId/save-draft', saveLKPSDocumentAsDraftHandler);
router.post('/document/:documentId/finalize', finalizeLKPSDocumentHandler);

// 4. Get/Update Single Document (Matches UUIDs, prioritized over history/export)
router.get('/:id', getLKPSDocumentHandler);
router.put('/:id', updateLKPSDocumentHandler);

// 5. High priority fixed routes
router.post('/preview', upload.single('file'), previewLKPSHandler);
router.post('/confirm', upload.single('file'), confirmLKPSHandler);

// 6. History and Export
router.get('/history/:prodiId', getLKPSHistoryHandler);
router.get('/export/:id', exportLKPSHandler);

export default router;
