import { Router } from 'express';
import { upsertInstitusiHandler, getInstitusiHandler } from '../controllers/institusi.controller';
import { authenticate, onlySuperAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, onlySuperAdmin, getInstitusiHandler);
router.post('/sync', authenticate, onlySuperAdmin, upsertInstitusiHandler);

export default router;