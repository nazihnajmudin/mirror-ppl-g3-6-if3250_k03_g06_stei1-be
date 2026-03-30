import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import lkpsRoutes from './lkps.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/lkps', lkpsRoutes);

export default router;