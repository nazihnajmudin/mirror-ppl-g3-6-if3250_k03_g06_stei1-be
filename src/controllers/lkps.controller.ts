import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import { parseLKPSExcel } from '../parsers/lkps.parser';
import * as lkpsService from '../services/lkps.service';
import prisma from '../config/database.config';
import path from 'path';
import fs from 'fs';

/**
 * @swagger
 * /api/lkps/preview:
 *   post:
 *     summary: Preview file Excel LKPS sebelum diupload
 *     description: Memparsing file Excel dan mengembalikan data dalam format JSON untuk direview user
 *     tags: [LKPS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Berhasil memparsing file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Data yang sudah diparsing dari Excel
 *                 message:
 *                   type: string
 *       400:
 *         description: File tidak ditemukan
 *       401:
 *         description: Tidak terautentikasi
 *       500:
 *         description: Gagal memparsing file
 */
export const previewLKPSHandler = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return errorResponse(res, 'File tidak ditemukan', 400);
    }

    const data = await parseLKPSExcel(file.buffer);
    return successResponse(res, data, 'Berhasil memparsing file LKPS');
  } catch (error: any) {
    console.error('Error previewing LKPS:', error);
    return errorResponse(res, 'Gagal memparsing file LKPS', 500);
  }
};

/**
 * @swagger
 * /api/lkps/confirm:
 *   post:
 *     summary: Konfirmasi dan simpan dokumen LKPS
 *     description: Menyimpan data LKPS yang sudah diparsing ke database dan menyimpan file fisiknya
 *     tags: [LKPS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               prodiId:
 *                 type: string
 *                 format: id
 *               periode:
 *                 type: string
 *                 example: "2024"
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Berhasil menyimpan dokumen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Data tidak lengkap
 *       401:
 *         description: Tidak terautentikasi
 *       500:
 *         description: Gagal mengupload LKPS
 */
export const confirmLKPSHandler = async (req: Request, res: Response) => {
  try {
    const { prodiId, name, periode } = req.body;
    const file = req.file;
    
    // Default to req.user.prodiId if not provided (for Kaprodi)
    let targetProdiId = (prodiId as string) || (req.user as any)?.prodiId;

    // "God Mode" for Super Admin: If no Prodi is provided, pick the first one from DB
    if (!targetProdiId && (req.user as any)?.role === 'SUPER_ADMIN') {
      const firstProdi = await prisma.prodi.findFirst();
      if (firstProdi) {
        targetProdiId = firstProdi.id;
      }
    }

    if (!targetProdiId || !file) {
      return errorResponse(res, 'File atau Program studi tidak ditemukan', 400);
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'lkps');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalFilename = file.originalname;
    const fileExt = path.extname(originalFilename);
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = path.join('uploads', 'lkps', uniqueFilename);
    const fullPath = path.join(process.cwd(), filePath);
    
    fs.writeFileSync(fullPath, file.buffer);

    // Parse the file to get content for Mirror Data Entry
    let content = {};
    try {
      content = await parseLKPSExcel(file.buffer);
    } catch (parseError) {
      console.error('Failed to parse LKPS content on confirm, storing empty content', parseError);
    }

    const document = await lkpsService.createLKPSDocument(
      targetProdiId, 
      content, 
      name || `LKPS - ${originalFilename}`, 
      filePath, 
      originalFilename,
      periode?.toString()
    );
    
    return successResponse(res, document, 'LKPS berhasil diupload', 201);
  } catch (error: any) {
    console.error('Error uploading LKPS:', error);
    return errorResponse(res, 'Gagal mengupload LKPS', 500);
  }
};

/**
 * @swagger
 * /api/lkps/history/{prodiId}:
 *   get:
 *     summary: Mendapatkan riwayat dokumen LKPS untuk program studi tertentu
 *     description: Mengambil semua dokumen LKPS yang pernah dibuat oleh suatu program studi, diurutkan dari terbaru hingga terlama
 *     tags: [LKPS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodiId
 *         required: true
 *         schema:
 *           type: string
 *           format: id
 *         description: ID program studi untuk mengambil riwayat dokumentnya
 *     responses:
 *       200:
 *         description: Berhasil mengambil riwayat
 *       401:
 *         description: Tidak terautentikasi
 *       500:
 *         description: Gagal mengambil riwayat
 */
export const getLKPSHistoryHandler = async (req: Request, res: Response) => {
  try {
    const prodiId = req.params.prodiId as string;
    const history = await lkpsService.getLKPSHistoryByProdi(prodiId);
    return successResponse(res, history, 'Berhasil mengambil riwayat LKPS');
  } catch (error: any) {
    console.error('Error getting history:', error);
    return errorResponse(res, 'Gagal mengambil riwayat', 500);
  }
};

/**
 * @swagger
 * /api/lkps/{id}:
 *   get:
 *     summary: Mendapatkan detail satu dokumen LKPS
 *     description: Mengambil data satu dokumen LKPS berdasarkan ID, termasuk konten datanya
 *     tags: [LKPS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: id
 *         description: ID dokumen LKPS
 *     responses:
 *       200:
 *         description: Dokumen berhasil diambil
 *       404:
 *         description: Dokumen tidak ditemukan
 *       500:
 *         description: Gagal mengambil dokumen
 */
export const getLKPSDocumentHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const document = await lkpsService.getLKPSDocumentById(id);
    
    if (!document) {
      return errorResponse(res, 'Dokumen tidak ditemukan', 404);
    }
    
    return successResponse(res, document, 'Berhasil mengambil dokumen LKPS');
  } catch (error: any) {
    console.error('Error getting document:', error);
    return errorResponse(res, 'Gagal mengambil dokumen', 500);
  }
};

/**
 * @swagger
 * /api/lkps/{id}:
 *   put:
 *     summary: Update konten dokumen LKPS
 *     description: Memperbarui data JSON konten di dalam dokumen LKPS
 *     tags: [LKPS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: object
 *     responses:
 *       200:
 *         description: Dokumen berhasil diperbarui
 *       404:
 *         description: Dokumen tidak ditemukan
 *       500:
 *         description: Gagal memperbarui dokumen
 */
export const updateLKPSDocumentHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { content } = req.body;

    const document = await lkpsService.getLKPSDocumentById(id);
    if (!document) {
      return errorResponse(res, 'Dokumen tidak ditemukan', 404);
    }

    const updatedDocument = await prisma.documentLKPS.update({
      where: { id },
      data: { content },
    });

    return successResponse(res, updatedDocument, 'Data LKPS berhasil diperbarui');
  } catch (error: any) {
    console.error('Error updating document:', error);
    return errorResponse(res, 'Gagal memperbarui data LKPS', 500);
  }
};

/**
 * @swagger
 * /api/lkps/export/{id}:
 *   get:
 *     summary: Mengekspor dokumen LKPS sebagai file Excel
 *     description: Mengambil dokumen LKPS dari database dan mengirimnya sebagai file Excel untuk diunduh
 *     tags: [LKPS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: id
 *         description: ID dokumen LKPS yang akan diunduh
 *     responses:
 *       200:
 *         description: File Excel LKPS berhasil digenerate dan siap diunduh
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Dokumen tidak ditemukan
 *       500:
 *         description: Gagal mengekspor LKPS
 */
export const exportLKPSHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const document = await lkpsService.getLKPSDocumentById(id) as any;

    if (!document) {
      return errorResponse(res, 'Dokumen tidak ditemukan', 404);
    }

    if (document.filePath) {
      const fullPath = path.join(process.cwd(), document.filePath);
      if (fs.existsSync(fullPath)) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalFilename || 'LKPS.xlsx'}"`);
        return res.sendFile(fullPath);
      }
    }

    if (!document.content) {
      return errorResponse(res, 'Data dokumen tidak lengkap', 404);
    }

    const { generateLKPSExcel } = require('../exporters/lkps.exporter');
    const buffer = await generateLKPSExcel(document.content);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="LKPS_${document.prodi?.abbreviation || 'Export'}.xlsx"`);
    
    return res.send(buffer);
  } catch (error: any) {
    console.error('Error exporting LKPS:', error);
    return errorResponse(res, 'Gagal mengekspor LKPS', 500);
  }
};
