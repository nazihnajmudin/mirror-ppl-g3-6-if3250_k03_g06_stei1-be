import { Request, Response } from 'express';
import * as prodiService from '../services/prodi.service';
import { successResponse, errorResponse } from '../utils/response';

/**
 * @swagger
 * /api/prodi:
 *   get:
 *     summary: Mendapatkan daftar prodi yang dapat diakses oleh pengguna
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar prodi berhasil diambil
 */
export const getAllProdiHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.userId;

  if (!userId) {
    errorResponse(res, 'Pengguna tidak terautentikasi', 401);
    return;
  }

  try {
    const prodis = await prodiService.getProdiForUser(userId);
    successResponse(res, prodis, 'Daftar prodi berhasil diambil');
  } catch (err: any) {
    const message = err?.message || 'Gagal mengambil daftar prodi';
    errorResponse(res, message, 400);
  }
};

/**
 * @swagger
 * /api/prodi/my-prodi:
 *   get:
 *     summary: Mendapatkan prodi yang dapat diakses oleh pengguna
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar prodi berhasil diambil
 */
export const getMyProdiHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.userId;

  if (!userId) {
    errorResponse(res, 'Pengguna tidak terautentikasi', 401);
    return;
  }

  try {
    const prodis = await prodiService.getProdiForUser(userId);
    successResponse(res, prodis, 'Daftar prodi berhasil diambil');
  } catch (err: any) {
    const message = err?.message || 'Gagal mengambil daftar prodi';
    errorResponse(res, message, 400);
  }
};

/**
 * @swagger
 * /api/prodi/{prodiId}:
 *   get:
 *     summary: Mendapatkan informasi prodi
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID program studi
 *     responses:
 *       200:
 *         description: Informasi prodi berhasil diambil
 *       404:
 *         description: Program studi tidak ditemukan
 */
export const getProdiHandler = async (req: Request, res: Response): Promise<void> => {
  const prodiId = String(req.params.prodiId);

  try {
    const prodi = await prodiService.getProdiById(prodiId);
    successResponse(res, prodi, 'Informasi prodi berhasil diambil');
  } catch (err: any) {
    const message = err?.message || 'Gagal mengambil informasi prodi';
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
  }
};

/**
 * @swagger
 * /api/prodi/{prodiId}/dashboard:
 *   get:
 *     summary: Mendapatkan dashboard per prodi
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID program studi
 *     responses:
 *       200:
 *         description: Dashboard data berhasil diambil
 *       404:
 *         description: Program studi tidak ditemukan
 */
export const getDashboardByProdiHandler = async (req: Request, res: Response): Promise<void> => {
  const prodiId = String(req.params.prodiId);
  const accessInfo = (req as any).prodiAccessInfo;

  try {
    const dashboard = await prodiService.getDashboardByProdi(prodiId);

    successResponse(
      res,
      {
        ...dashboard,
        accessInfo,
      },
      'Dashboard prodi berhasil diambil'
    );
  } catch (err: any) {
    const message = err?.message || 'Gagal mengambil dashboard prodi';
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
  }
};

/**
 * @swagger
 * /api/prodi/{prodiId}/dashboard:
 *   put:
 *     summary: Mengupdate dashboard per prodi
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID program studi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 description: Array dari document updates
 *               accreditationInfo:
 *                 type: object
 *                 description: Accreditation info updates
 *     responses:
 *       200:
 *         description: Dashboard berhasil diupdate
 *       403:
 *         description: Tidak memiliki izin untuk mengupdate
 *       404:
 *         description: Program studi tidak ditemukan
 */
export const updateDashboardByProdiHandler = async (req: Request, res: Response): Promise<void> => {
  const prodiId = String(req.params.prodiId);
  const { documents, accreditationInfo } = req.body;

  try {
    const updatedDashboard = await prodiService.updateDashboardByProdi(prodiId, {
      documents,
      accreditationInfo,
    });

    successResponse(res, updatedDashboard, 'Dashboard prodi berhasil diupdate');
  } catch (err: any) {
    const message = err?.message || 'Gagal mengupdate dashboard prodi';
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
  }
};
