import { Request, Response } from 'express';
import * as accountService from '../services/account.service';
import { successResponse, errorResponse } from '../utils/response';
import { Role } from '@prisma/client';

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Mendapatkan semua akun pengguna
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [SUPER_ADMIN, PIMPINAN, KAPRODI, TIM_PRODI]
 *       - in: query
 *         name: prodiId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         required: false
 *         schema:
 *           type: boolean
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
export const getAllAccountsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const role =
      typeof req.query.role === 'string' && Object.values(Role).includes(req.query.role as Role)
        ? (req.query.role as Role)
        : undefined;
    const prodiId =
      typeof req.query.prodiId === 'string'
        ? req.query.prodiId
        : undefined;
    const isActive =
      req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const users = await accountService.getAllAccounts({ role, prodiId, isActive });
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
 *           type: string
 *         description: ID pengguna
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diambil
 *       400:
 *         description: ID tidak valid
 *       404:
 *         description: Pengguna tidak ditemukan
 */
export const getAccountByIdHandler = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

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
 *         description: Data tidak valid
 *       409:
 *         description: Email sudah terdaftar
 */
export const createAccountHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await accountService.createAccount(req.body);
    successResponse(res, user, 'Akun pengguna berhasil dibuat', 201);
  } catch (err: any) {
    const message = err?.message || 'Gagal membuat akun pengguna';
    const code = message.includes('sudah terdaftar') ? 409 : 400;
    errorResponse(res, message, code);
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
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAccountRequest'
 *     responses:
 *       200:
 *         description: Akun pengguna berhasil diperbarui
 *       400:
 *         description: ID tidak valid atau data update tidak sesuai aturan bisnis
 *       404:
 *         description: Pengguna tidak ditemukan
 */
export const updateAccountHandler = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  try {
    const user = await accountService.updateAccount(id, req.body);
    successResponse(res, user, 'Akun pengguna berhasil diperbarui');
  } catch (err: any) {
    const message = err?.message || 'Gagal memperbarui akun pengguna';
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
  }
};

/**
 * @swagger
 * /api/accounts/{id}/deactivate:
 *   patch:
 *     summary: Menonaktifkan akun pengguna (soft delete)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Akun pengguna berhasil dinonaktifkan
 *       400:
 *         description: ID tidak valid
 *       404:
 *         description: Pengguna tidak ditemukan
 */
export const deactivateAccountHandler = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  try {
    await accountService.deactivateAccount(id);
    successResponse(res, null, 'Akun pengguna berhasil dinonaktifkan');
  } catch (err: any) {
    const message = err?.message || 'Gagal menonaktifkan akun pengguna';
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
  }
};

/**
 * @swagger
 * /api/accounts/{id}/activate:
 *   patch:
 *     summary: Mengaktifkan kembali akun pengguna
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Akun pengguna berhasil diaktifkan
 *       400:
 *         description: ID tidak valid
 *       404:
 *         description: Pengguna tidak ditemukan
 */
export const activateAccountHandler = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  try {
    await accountService.activateAccount(id);
    successResponse(res, null, 'Akun pengguna berhasil diaktifkan');
  } catch (err: any) {
    const message = err?.message || 'Gagal mengaktifkan akun pengguna';
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
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
 *           type: string
 *     responses:
 *       200:
 *         description: Akun pengguna berhasil dihapus
 *       400:
 *         description: ID tidak valid
 *       404:
 *         description: Pengguna tidak ditemukan
 */
export const deleteAccountHandler = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  try {
    const user = await accountService.deleteAccount(id);
    successResponse(res, user, 'Akun pengguna berhasil dihapus');
  } catch (err: any) {
    errorResponse(res, err.message, 404);
  }
};