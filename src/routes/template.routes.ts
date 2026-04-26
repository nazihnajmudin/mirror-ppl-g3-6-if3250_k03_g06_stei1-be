import { Router } from 'express';
import { uploadTemplateHandler, getTemplatesHandler, downloadTemplateHandler, deleteTemplateHandler } from '../controllers/template.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadTemplateMiddleware } from '../middlewares/upload.middleware';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/response';

const router = Router();

router.use(authenticate);

// Custom Middleware untuk RBAC Admin/Pimpinan
const requireAdminOrPimpinan = (req: any, res: any, next: any) => {
    const role = req.user?.role;
    if (role === Role.SUPER_ADMIN || role === Role.PIMPINAN) return next();
    return errorResponse(res, 'Akses ditolak. Hanya untuk Super Admin atau Pimpinan.', 403);
};

// GET: Semua role bisa lihat daftar dan download 
// (Service sudah menangani filter data-nya)
router.get(
    '/', 
    getTemplatesHandler
);
router.get(
    '/download/:id', 
    downloadTemplateHandler
);

// POST & DELETE: Admin / Pimpinan
router.post(
    '/upload', 
    requireAdminOrPimpinan, 
    uploadTemplateMiddleware.single('file'), 
    uploadTemplateHandler
);
router.delete(
    '/:id', 
    requireAdminOrPimpinan, 
    deleteTemplateHandler
);

export default router;