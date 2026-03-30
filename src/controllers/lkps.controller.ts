import { Request, Response } from 'express';
import * as lkpsService from '../services/lkps.service';
import { successResponse, errorResponse } from '../utils/response';

/**
 * @swagger
 * /api/lkps/{id}:
 *   get:
 *     summary: Mendapatkan data LKPS berdasarkan ID dokumen
 *     tags: [LKPS]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: ID dokumen LKPS
 *     responses:
 *       200:
 *         description: Data LKPS berhasil diambil
 *       404:
 *         description: LKPS tidak ditemukan
 *       401:
 *         description: Unauthorized 
 *       500:
 *         description: Terjadi kesalahan pada server
 */
export const getLKPSHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const lkps = await lkpsService.getLKPSById(id);
    successResponse(res, lkps, 'Data LKPS berhasil diambil');
  } catch (err: any) {
    errorResponse(res, err.message, 404);
  }
};

/**
 * @swagger
 * /api/lkps/import:
 *   post:
 *     summary: Impor data LKPS dari file Excel
 *     tags: [LKPS]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: File Excel (.xlsx) yang berisi data LKPS
 *       - in: formData
 *         name: prodiId
 *         type: string
 *         required: false
 *         description: ID program studi (opsional)
 *     responses:
 *       200:
 *         description: Data LKPS berhasil diimpor
 *       400:
 *         description: File tidak ditemukan atau prodiId tidak valid
 *       401:
 *         description: Unauthorized 
 *       500:
 *         description: Terjadi kesalahan pada server
 */
export const importLKPSHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      errorResponse(res, 'File tidak ditemukan', 400);
      return;
    }
    
    const prodiId = (req.body.prodiId as string) || (req.user as any)?.prodiId;
    if (!prodiId) {
      errorResponse(res, 'prodiId wajib diisi', 400);
      return;
    }

    const result = await lkpsService.importLKPS(req.file.buffer, prodiId);
    successResponse(res, result, 'Data LKPS berhasil diimpor');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

/**
 * @swagger
 * /api/lkps/export/{id}:
 *   get:
 *     summary: Ekspor data LKPS ke file Excel
 *     tags: [LKPS]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: ID dokumen LKPS
 *     responses:
 *       200:
 *         description: File Excel LKPS berhasil diekspor
 *       404:
 *         description: LKPS tidak ditemukan
 *       401:
 *         description: Unauthorized 
 *       500:
 *         description: Terjadi kesalahan pada server
 */
export const exportLKPSHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { buffer, filename } = await lkpsService.exportLKPS(id);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};
