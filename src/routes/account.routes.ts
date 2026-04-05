import { Router } from 'express';
import {
  getAllAccountsHandler,
  getAccountByIdHandler,
  createAccountHandler,
  updateAccountHandler,
  deleteAccountHandler,
  deactivateAccountHandler,
  activateAccountHandler,
  getProdiOptionsHandler,
} from '../controllers/account.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Role } from '@prisma/client';
import { createAccountSchema, updateAccountSchema } from '../validators/account.validator';

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Manajemen akun pengguna sistem (hanya Super Admin)
 */

const router = Router();
router.get('/prodi-options', getProdiOptionsHandler);

// All account management routes require authentication and SUPER_ADMIN role
router.use(authenticate);

router.get('/', requireRole(Role.SUPER_ADMIN, Role.PIMPINAN, Role.KAPRODI, Role.TIM_PRODI), getAllAccountsHandler);
router.get('/:id', requireRole(Role.SUPER_ADMIN), getAccountByIdHandler);
router.post('/', requireRole(Role.SUPER_ADMIN), validate(createAccountSchema), createAccountHandler);
router.put('/:id', requireRole(Role.SUPER_ADMIN), validate(updateAccountSchema), updateAccountHandler);
router.patch('/:id/deactivate', requireRole(Role.SUPER_ADMIN), deactivateAccountHandler);
router.patch('/:id/activate', requireRole(Role.SUPER_ADMIN), activateAccountHandler);
router.delete('/:id', requireRole(Role.SUPER_ADMIN), deleteAccountHandler);

export default router;