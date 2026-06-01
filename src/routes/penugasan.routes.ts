import { Router } from 'express';
import {
  getAllPenugasanHandler,
  createPenugasanHandler,
  deletePenugasanHandler,
} from '../controllers/penugasan.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Role } from '@prisma/client';
import { createPenugasanSchema } from '../validators/penugasan.validator';

/**
 * @swagger
 * tags:
 *   name: Penugasan
 *   description: Manajemen penugasan tim prodi ke program studi
 */

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.SUPER_ADMIN, Role.KAPRODI));

router.get('/', getAllPenugasanHandler);
router.post('/', validate(createPenugasanSchema), createPenugasanHandler);
router.delete('/:id', deletePenugasanHandler);

export default router;