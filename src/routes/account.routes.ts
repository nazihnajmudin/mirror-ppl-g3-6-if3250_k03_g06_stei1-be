import { Router } from 'express';
import {
  getAllAccountsHandler,
  getAccountByIdHandler,
  createAccountHandler,
  updateAccountHandler,
  deleteAccountHandler,
  deactivateAccountHandler,
  activateAccountHandler,
} from '../controllers/account.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Role } from '@prisma/client';
import { createAccountSchema, updateAccountSchema } from '../validators/account.validator';

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Manajemen akun pengguna sistem (hanya Admin Institusi)
 */

const router = Router();

// All account management routes require authentication and SUPER_ADMIN role
router.use(authenticate);
router.use(requireRole(Role.SUPER_ADMIN));

router.get('/', getAllAccountsHandler);
router.get('/:id', getAccountByIdHandler);
router.post('/', validate(createAccountSchema), createAccountHandler);
router.put('/:id', validate(updateAccountSchema), updateAccountHandler);
router.patch('/:id/deactivate', deactivateAccountHandler);
router.patch('/:id/activate', activateAccountHandler);
router.delete('/:id', deleteAccountHandler);

export default router;
