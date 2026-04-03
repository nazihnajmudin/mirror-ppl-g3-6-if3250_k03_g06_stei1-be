import { Request, Response } from 'express';
import * as ledService from '../services/led.service';
import { successResponse, errorResponse } from '../utils/response';

/**
 * @swagger
 * /api/led/import:
 *   post:
 *     summary: Import/Upload dokumen LED (S-02-32)
 *     tags:
 *       - LED
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - prodiId
 *               - periode
 *               - file
 *             properties:
 *               prodiId:
 *                 type: integer
 *                 example: 1
 *               periode:
 *                 type: string
 *                 example: "2025"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Dokumen LED berhasil diimpor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Data atau file tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const importLEDHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const pengunggahId = String(req.user?.userId); 
        const prodiId = String(req.body.prodiId);
        const periode = String(req.body.periode);
        const file = req.file; 

        if (!req.user?.userId) {
            errorResponse(res, 'Pengguna tidak terautentikasi', 401);
            return;
        }
        if (!file) {
            errorResponse(res, 'File dokumen LED wajib diunggah', 400);
            return;
        }

        const dokumen = await ledService.importLED({
            prodiId,
            pengunggahId,
            periode,
            file,
        });

        successResponse(res, dokumen, 'Dokumen LED berhasil diimpor', 201);
    } catch (err: any) {
        errorResponse(res, err.message, 500);
    }
};

/**
 * @swagger
 * /api/led/export/{prodiId}/{periode}:
 *   get:
 *     summary: Export/Download dokumen LED versi terbaru (S-02-33)
 *     tags:
 *       - LED
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodiId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: periode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File dokumen LED (Binary)
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parameter tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Dokumen tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const exportLEDHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const prodiId = String(req.params.prodiId);
        const periode = String(req.params.periode);

        if (!req.params.prodiId || !req.params.periode) {
            errorResponse(res, 'Parameter prodiId dan periode tidak valid', 400);
            return;
        }

        const { dokumen, filePath } = await ledService.exportLED(prodiId, periode);

        const downloadName = dokumen.name || 'LED_Document.docx';

        res.download(filePath, downloadName, (err) => {
            if (err && !res.headersSent) {
                errorResponse(res, 'Terjadi kesalahan saat mengunduh file', 500);
            }
        });
    } catch (err: any) {
        const code = err.message.includes('belum tersedia') ? 404 : 500;
        errorResponse(res, err.message, code);
    }
};

/**
 * @swagger
 * /api/led/history/{prodiId}/{periode}:
 *   get:
 *     summary: Mendapatkan riwayat versi dokumen LED
 *     tags:
 *       - LED
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodiId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: periode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Riwayat dokumen LED berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export const getLEDHistoryHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const prodiId = String(req.params.prodiId);
        const periode = String(req.params.periode);

        if (!req.params.prodiId || !req.params.periode) {
            errorResponse(res, 'Parameter prodiId dan periode tidak valid', 400);
            return;
        }

        const history = await ledService.getLEDHistory(prodiId, periode);
        successResponse(res, history, 'Riwayat dokumen LED berhasil diambil');
    } catch (err: any) {
        errorResponse(res, err.message, 500);
    }
};

/**
 * @swagger
 * /api/led/periods/{prodiId}:
 *   get:
 *     summary: Mendapatkan daftar periode yang tersedia untuk Prodi
 *     tags: 
 *       - LED
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodiId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar periode berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Parameter tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getAvailablePeriodsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
    const prodiId = String(req.params.prodiId);

    if (!req.params.prodiId) {
        errorResponse(res, 'Parameter prodiId wajib diisi', 400);
        return;
    }

    const periods = await ledService.getAvailablePeriods(prodiId);

    // Jika masih kosong banget (prodi baru), defaultnya tahun ini
    const finalPeriods = periods.length > 0 ? periods : [new Date().getFullYear().toString()];

    successResponse(res, finalPeriods, 'Daftar periode berhasil diambil');
    } catch (err: any) {
        errorResponse(res, err.message, 500);
    }
};

/**
 * @swagger
 * /api/led/export/document/{id}:
 *   get:
 *     summary: Export dokumen LED berdasarkan ID spesifik
 *     tags:
 *       - LED
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
 *         description: Dokumen berhasil diexport
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parameter ID tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Dokumen tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const exportLEDByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);
        if (!id) {
            errorResponse(res, 'Parameter ID dokumen wajib diisi', 400);
            return;
        }

        const { dokumen, filePath } = await ledService.exportLEDById(id);
        const downloadName = dokumen.name || `LED_Document_V${dokumen.versi}.docx`;

        res.download(filePath, downloadName, (err) => {
            if (err && !res.headersSent) errorResponse(res, 'Terjadi kesalahan saat mengunduh file', 500);
        });
    } catch (err: any) {
        errorResponse(res, err.message, 404);
    }
};