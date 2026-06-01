import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import passport from '../config/passport.config';
import { isSSOConfigured } from '../config/sso.config';
import { successResponse, errorResponse } from '../utils/response';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register pengguna baru
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Data tidak valid atau email sudah terdaftar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password, role, prodiId } = req.body;

  if (!email || !name || !password || !role) {
    errorResponse(res, 'Email, name, password, dan role wajib diisi', 400);
    return;
  }

  try {
    const result = await authService.register({ email, name, password, role, prodiId });
    successResponse(res, result, 'Registrasi berhasil', 201);
  } catch (err: any) {
    errorResponse(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login dengan email dan password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token JWT dan data user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Email atau password salah / akun nonaktif
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    errorResponse(res, 'Email dan password wajib diisi', 400);
    return;
  }

  try {
    const result = await authService.login({ email, password });
    successResponse(res, result, 'Login berhasil');
  } catch (err: any) {
    errorResponse(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Mendapatkan data pengguna yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const meHandler = (req: Request, res: Response): void => {
  successResponse(res, req.user, 'Data pengguna berhasil diambil');
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
export const logoutHandler = (req: Request, res: Response, next: NextFunction): void => {
  req.logout((err) => {
    if (err) {
      next(err);
      return;
    }
    successResponse(res, null, 'Logout berhasil');
  });
};

/**
 * @swagger
 * /api/auth/sso:
 *   get:
 *     summary: Redirect ke halaman login SSO ITB
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirect ke SSO ITB
 *       503:
 *         description: SSO belum dikonfigurasi di server
 */
export const loginWithSSO = (req: Request, res: Response, next: NextFunction): void => {
  if (!isSSOConfigured) {
    errorResponse(res, 'SSO belum dikonfigurasi di server', 503);
    return;
  }
  return passport.authenticate('sso-itb', {
    scope: ['openid', 'profile', 'email'],
  })(req, res, next);
};

/**
 * @swagger
 * /api/auth/callback:
 *   get:
 *     summary: Callback dari SSO ITB setelah login
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Callback berhasil
 *       302:
 *         description: Redirect ke frontend login ketika autentikasi SSO gagal
 *       401:
 *         description: Profil SSO tidak valid/tidak memiliki email
 *       503:
 *         description: SSO belum dikonfigurasi di server
 */
export const handleSSOCallback = [
  (req: Request, res: Response, next: NextFunction): void => {
    if (!isSSOConfigured) {
      errorResponse(res, 'SSO belum dikonfigurasi di server', 503);
      return;
    }

    return passport.authenticate('sso-itb', {
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=sso_failed`,
      session: false,
    })(req, res, next);
  },
  async (req: Request, res: Response): Promise<void> => {
    const ssoProfile = req.user as Record<string, string> | undefined;

    if (!ssoProfile?.email) {
      errorResponse(res, 'Gagal mendapatkan profil dari SSO ITB', 401);
      return;
    }

    // TODO (AU-02-02): cari user di DB, generate JWT, redirect ke frontend
    res.json({
      status: 'success',
      message: 'SSO callback berhasil (JWT generation belum diimplementasi)',
      ssoProfile,
    });
  },
];