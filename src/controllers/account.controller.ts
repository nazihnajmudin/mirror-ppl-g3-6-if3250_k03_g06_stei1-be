import { Request, Response } from 'express';
import * as accountService from '../services/account.service';
import { successResponse, errorResponse } from '../utils/response';

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Mendapatkan semua akun pengguna
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Tidak terautentikasi
 */
export const getAllAccountsHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await accountService.getAllAccounts();
    successResponse(res, users, 'Daftar pengguna berhasil diambil');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Mendapatkan detail akun pengguna berdasarkan ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pengguna
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diambil
 *       404:
 *         description: Pengguna tidak ditemukan
 */
export const getAccountByIdHandler = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    errorResponse(res, 'ID tidak valid', 400);
    return;
  }

  try {
    const user = await accountService.getAccountById(id);
    successResponse(res, user, 'Data pengguna berhasil diambil');
  } catch (err: any) {
    errorResponse(res, err.message, 404);
  }
};

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Membuat akun pengguna baru
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountRequest'
 *     responses:
 *       201:
 *         description: Akun pengguna berhasil dibuat
 *       400:
 *         description: Data tidak valid atau email sudah terdaftar
 */
export const createAccountHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password, role, prodiId } = req.body;

  if (!email || !name || !role) {
    errorResponse(res, 'Email, name, dan role wajib diisi', 400);
    return;
  }

  try {
    const user = await accountService.createAccount({ email, name, password, role, prodiId });
    successResponse(res, user, 'Akun pengguna berhasil dibuat', 201);
  } catch (err: any) {
    errorResponse(res, err.message, 400);
  }
};

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Memperbarui akun pengguna
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAccountRequest'
 *     responses:
 *       200:
 *         description: Akun pengguna berhasil diperbarui
 *       404:
 *         description: Pengguna tidak ditemukan
 */
export const updateAccountHandler = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    errorResponse(res, 'ID tidak valid', 400);
    return;
  }

  const { name, role, isActive, prodiId } = req.body;

  try {
    const user = await accountService.updateAccount(id, { name, role, isActive, prodiId });
    successResponse(res, user, 'Akun pengguna berhasil diperbarui');
  } catch (err: any) {
    errorResponse(res, err.message, 404);
  }
};

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Menghapus akun pengguna
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Akun pengguna berhasil dihapus
 *       404:
 *         description: Pengguna tidak ditemukan
 */
export const deleteAccountHandler = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    errorResponse(res, 'ID tidak valid', 400);
    return;
  }

  try {
    const user = await accountService.deleteAccount(id);
    successResponse(res, user, 'Akun pengguna berhasil dihapus');
  } catch (err: any) {
    errorResponse(res, err.message, 404);
  }
};