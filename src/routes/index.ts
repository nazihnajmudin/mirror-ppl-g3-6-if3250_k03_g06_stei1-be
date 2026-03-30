import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import ledRoutes from './led.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/led', ledRoutes);

export default router;