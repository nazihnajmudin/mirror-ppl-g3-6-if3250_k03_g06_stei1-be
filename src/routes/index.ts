import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import prodiRoutes from './prodi.routes';
import penugasanRoutes from './penugasan.routes';
import lkpsRoutes from './lkps.routes';
import ledRoutes from './led.routes';
import templateRoutes from './template.routes';
import evidenRoutes from './eviden.routes';
import institusiRoutes from './institusi.routes';
import notificationRoutes from './notification.routes';
import settingsRoutes from './settings.routes';
import simulasiskorRoutes from './simulasiskor.routes';
import monitoringRoutes from './monitoring.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/prodi', prodiRoutes);
router.use('/penugasan', penugasanRoutes);
router.use('/lkps', lkpsRoutes);
router.use('/led', ledRoutes);
router.use('/templates', templateRoutes);
router.use('/eviden', evidenRoutes);
router.use('/institusi', institusiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/monitoring-evaluasi', monitoringRoutes);
router.use('/settings', settingsRoutes);
router.use('/simulasi-skor', simulasiskorRoutes);

export default router;
