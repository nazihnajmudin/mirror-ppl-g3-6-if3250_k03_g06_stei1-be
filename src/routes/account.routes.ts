import { Router } from 'express';
import {
  getAllAccountsHandler,
  getAccountByIdHandler,
  createAccountHandler,
  updateAccountHandler,
  deleteAccountHandler,
} from '../controllers/account.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Manajemen akun pengguna sistem (hanya Admin Institusi)
 */

const router = Router();

// All account management routes require authentication and ADMIN_INSTITUSI role
router.use(authenticate);
router.use(requireRole(Role.ADMIN_INSTITUSI));

router.get('/', getAllAccountsHandler);
router.get('/:id', getAccountByIdHandler);
router.post('/', createAccountHandler);
router.put('/:id', updateAccountHandler);
router.delete('/:id', deleteAccountHandler);

export default router;