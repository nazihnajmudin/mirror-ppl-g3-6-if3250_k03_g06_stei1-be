import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import prodiRoutes from './prodi.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/prodi', prodiRoutes);

export default router;