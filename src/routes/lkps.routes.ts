import { Router } from 'express';
import multer from 'multer';
import { 
  importLKPSHandler, 
  exportLKPSHandler, 
  getLKPSHandler 
} from '../controllers/lkps.controller';
import { authenticate } from '../middlewares/auth.middleware';

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
router.post('/import', upload.single('file'), importLKPSHandler);
router.get('/export/:id', exportLKPSHandler);

export default router;
