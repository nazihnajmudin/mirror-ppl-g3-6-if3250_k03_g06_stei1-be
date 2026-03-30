import { Request, Response } from 'express';
import * as prodiService from '../services/prodi.service';
import { successResponse, errorResponse } from '../utils/response';

/**
 * @swagger
 * /api/prodi:
 *   get:
 *     summary: Mendapatkan semua program studi
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua program studi berhasil diambil
 *       401:
 *         description: Tidak terautentikasi
 */
export const getAllProdiHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const prodis = await prodiService.getAllProdi();
    successResponse(res, prodis, 'Daftar program studi berhasil diambil');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * @swagger
 * /api/prodi/{id}:
 *   get:
 *     summary: Mendapatkan detail program studi berdasarkan ID
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID program studi
 *     responses:
 *       200:
 *         description: Data program studi berhasil diambil
 *       404:
 *         description: Program studi tidak ditemukan
 */
export const getProdiByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const prodi = await prodiService.getProdiById(req.params.id);
    successResponse(res, prodi, 'Data program studi berhasil diambil');
  } catch (err: any) {
    const code = err.message.includes('tidak ditemukan') ? 404 : 500;
    errorResponse(res, err.message, code);
  }
};

/**
 * @swagger
 * /api/prodi/{id}:
 *   put:
 *     summary: Memperbarui data program studi
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               degree:
 *                 type: string
 *     responses:
 *       200:
 *         description: Program studi berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       404:
 *         description: Program studi tidak ditemukan
 */
export const updateProdiHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const prodi = await prodiService.updateProdi(req.params.id, req.body);
    successResponse(res, prodi, 'Program studi berhasil diperbarui');
  } catch (err: any) {
    const message = err.message;
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
  }
};

/**
 * @swagger
 * /api/prodi/{id}/accreditation:
 *   get:
 *     summary: Mendapatkan informasi akreditasi program studi
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Data akreditasi berhasil diambil
 *       404:
 *         description: Program studi tidak ditemukan
 */
export const getAccreditationHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const accreditation = await prodiService.getAccreditation(req.params.id);
    successResponse(res, accreditation, 'Data akreditasi berhasil diambil');
  } catch (err: any) {
    const code = err.message.includes('tidak ditemukan') ? 404 : 500;
    errorResponse(res, err.message, code);
  }
};

/**
 * @swagger
 * /api/prodi/{id}/accreditation:
 *   put:
 *     summary: Membuat atau memperbarui informasi akreditasi program studi
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               certificateUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Data akreditasi berhasil disimpan
 *       400:
 *         description: Data tidak valid
 *       404:
 *         description: Program studi tidak ditemukan
 */
export const upsertAccreditationHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const accreditation = await prodiService.upsertAccreditation(req.params.id, req.body);
    successResponse(res, accreditation, 'Data akreditasi berhasil disimpan');
  } catch (err: any) {
    const message = err.message;
    const code = message.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, message, code);
  }
};