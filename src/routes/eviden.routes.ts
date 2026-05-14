import { Router } from 'express';
import { 
    createEvidenHandler, 
    getEvidenListHandler, 
    getEvidenByIdHandler, 
    updateEvidenHandler, 
    deleteEvidenHandler, 
    downloadFileHandler, 
    toggleEvidenStatusHandler
} from '../controllers/eviden.controller';
import { authenticate, requireRole, prodiStaff } from '../middlewares/auth.middleware';
import { requireResourceAccess } from '../middlewares/resourceAccess.middleware';
import { uploadEvidenMiddleware } from '../middlewares/upload.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// GET: Semua role bisa melihat list dan mendownload file
router.get('/', getEvidenListHandler);
router.get('/:id', requireResourceAccess('eviden', 'read', 'id'), getEvidenByIdHandler);
router.get('/file/download/:fileId', requireResourceAccess('eviden_file', 'read', 'fileId'), downloadFileHandler);

// POST, PUT, DELETE: Hanya Kaprodi dan Tim Prodi
// Middleware uploadEvidenMiddleware.array('files', 20) -> maksimal 20 file sekali upload
router.post('/', prodiStaff, uploadEvidenMiddleware.array('files', 20), createEvidenHandler);
router.put('/:id', requireResourceAccess('eviden', 'write', 'id'), prodiStaff, uploadEvidenMiddleware.array('files', 20), updateEvidenHandler);
router.delete('/:id', requireResourceAccess('eviden', 'write', 'id'), prodiStaff, deleteEvidenHandler);

router.put('/status/:id', requireResourceAccess('eviden', 'write', 'id'), requireRole(Role.SUPER_ADMIN, Role.KAPRODI), toggleEvidenStatusHandler);

export default router;