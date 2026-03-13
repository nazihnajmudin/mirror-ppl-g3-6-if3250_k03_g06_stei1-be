import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  meHandler,
  loginWithSSO,
  handleSSOCallback,
  logoutHandler,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoint autentikasi pengguna
 */

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', authenticate, meHandler);
router.get('/sso', loginWithSSO);
router.get('/callback', ...handleSSOCallback);
router.post('/logout', authenticate, logoutHandler);

export default router;