import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  createMonitoringHandler,
  getMonitoringHistoryHandler,
  getMonitoringSummaryHandler,
  updateMonitoringHandler,
  deleteMonitoringHandler,
} from '../controllers/monitoring.controller';

const router = Router();

router.use(authenticate);

router.get('/summary', requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI, Role.TIM_PRODI), getMonitoringSummaryHandler);
router.get('/history/:documentType/:documentId', getMonitoringHistoryHandler);
router.post('/', requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI, Role.TIM_PRODI), createMonitoringHandler);
router.put('/:id', requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI, Role.TIM_PRODI), updateMonitoringHandler);
router.delete('/:id', requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI, Role.TIM_PRODI), deleteMonitoringHandler);

export default router;