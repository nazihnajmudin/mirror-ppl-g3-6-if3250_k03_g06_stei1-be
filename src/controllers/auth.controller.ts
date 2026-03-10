import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
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