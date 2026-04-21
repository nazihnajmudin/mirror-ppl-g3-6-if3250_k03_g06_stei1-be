import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import prodiRoutes from './prodi.routes';
import penugasanRoutes from './penugasan.routes';
import lkpsRoutes from './lkps.routes';
import ledRoutes from './led.routes';
import templateRoutes from './template.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/prodi', prodiRoutes);
router.use('/penugasan', penugasanRoutes);
router.use('/lkps', lkpsRoutes);
router.use('/led', ledRoutes);
router.use('/templates', templateRoutes);

export default router;
