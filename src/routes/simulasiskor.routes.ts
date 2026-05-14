import { Router } from 'express';
import {
  getSimulationByProdiHandler,
  updateSimulationQualitativeHandler,
} from '../controllers/simulasiskor.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { requireResourceAccess } from '../middlewares/resourceAccess.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateSimulationQualitativeSchema } from '../validators/simulasiskor.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI));

router.get('/:prodiId', requireResourceAccess('prodi', 'read', 'prodiId'), getSimulationByProdiHandler);
router.put('/:prodiId/qualitative', requireResourceAccess('prodi', 'write', 'prodiId'), validate(updateSimulationQualitativeSchema), updateSimulationQualitativeHandler);

export default router;