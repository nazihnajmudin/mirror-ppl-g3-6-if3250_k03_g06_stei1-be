import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import lkpsRoutes from './lkps.routes';
import prodiRoutes from './prodi.routes';
import penugasanRoutes from './penugasan.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/lkps', lkpsRoutes);
router.use('/prodi', prodiRoutes);
router.use('/penugasan', penugasanRoutes);

export default router;
