import { Request, Response } from 'express';
import * as penugasanService from '../services/penugasan.service';
import { successResponse, errorResponse } from '../utils/response';

/**
 * @swagger
 * /api/penugasan:
 *   get:
 *     summary: Mendapatkan semua penugasan tim prodi
 *     tags: [Penugasan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: prodiId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter berdasarkan ID program studi
 *     responses:
 *       200:
 *         description: Daftar penugasan berhasil diambil
 *       401:
 *         description: Tidak terautentikasi
 */
export const getAllPenugasanHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const prodiId = typeof req.query.prodiId === 'string' ? req.query.prodiId : undefined;
    const penugasans = await penugasanService.getAllPenugasan(prodiId);
    successResponse(res, penugasans, 'Daftar penugasan berhasil diambil');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * @swagger
 * /api/penugasan:
 *   post:
 *     summary: Membuat penugasan baru untuk tim prodi
 *     tags: [Penugasan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - prodiId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               prodiId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Penugasan berhasil dibuat
 *       400:
 *         description: Data tidak valid atau penugasan sudah ada
 *       404:
 *         description: Pengguna atau program studi tidak ditemukan
 */
export const createPenugasanHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const penugasan = await penugasanService.createPenugasan(req.body);
    successResponse(res, penugasan, 'Penugasan berhasil dibuat', 201);
  } catch (err: any) {
    const message = err.message;
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
  }
};

/**
 * @swagger
 * /api/penugasan/{id}:
 *   delete:
 *     summary: Menghapus penugasan tim prodi
 *     tags: [Penugasan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID penugasan
 *     responses:
 *       200:
 *         description: Penugasan berhasil dihapus
 *       404:
 *         description: Penugasan tidak ditemukan
 */
export const deletePenugasanHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const penugasan = await penugasanService.deletePenugasan(req.params.id as string);
    successResponse(res, penugasan, 'Penugasan berhasil dihapus');
  } catch (err: any) {
    const code = err.message.includes('tidak ditemukan') ? 404 : 500;
    errorResponse(res, err.message, code);
  }
};