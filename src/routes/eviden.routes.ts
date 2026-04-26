import { Router } from 'express';
import { 
    createEvidenHandler, 
    getEvidenListHandler, 
    getEvidenByIdHandler, 
    updateEvidenHandler, 
    deleteEvidenHandler, 
    downloadFileHandler 
} from '../controllers/eviden.controller';
import { authenticate, requireRole, prodiStaff } from '../middlewares/auth.middleware';
import { uploadEvidenMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

// GET: Semua role bisa melihat list dan mendownload file
router.get('/', getEvidenListHandler);
router.get('/:id', getEvidenByIdHandler);
router.get('/file/download/:fileId', downloadFileHandler);

// POST, PUT, DELETE: Hanya Kaprodi dan Tim Prodi
// Middleware uploadEvidenMiddleware.array('files', 20) -> maksimal 20 file sekali upload
router.post('/', prodiStaff, uploadEvidenMiddleware.array('files', 20), createEvidenHandler);
router.put('/:id', prodiStaff, uploadEvidenMiddleware.array('files', 20), updateEvidenHandler);
router.delete('/:id', prodiStaff, deleteEvidenHandler);

export default router;