import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import lkpsRoutes from './lkps.routes';
import prodiRoutes from './prodi.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/lkps', lkpsRoutes);
router.use('/prodi', prodiRoutes);

export default router;