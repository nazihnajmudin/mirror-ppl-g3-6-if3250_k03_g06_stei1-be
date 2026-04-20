import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import { parseLKPSExcel } from '../parsers/lkps.parser';
import * as lkpsService from '../services/lkps.service';
import prisma from '../config/database.config';
import fs from 'fs';
import path from 'path';

/**
 * @swagger
 * /api/lkps/preview:
 *   post:
 *     summary: Preview file Excel LKPS sebelum diupload
 *     description: Melakukan parsing pada file Excel LKPS untuk menampilkan preview data tanpa menyimpan ke database
 *     tags: [LKPS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File Excel LKPS (.xlsx)
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: File berhasil diurai, menampilkan preview data
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
 *         description: Gagal mengurai file
 */
export const previewLKPSHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File tidak ditemukan', 400);
    }

    const parsedData = await parseLKPSExcel(req.file.buffer);
    return successResponse(res, parsedData, 'File berhasil diurai');
  } catch (error: any) {
    console.error('Error previewing LKPS:', error);
    return errorResponse(res, error.message || 'Gagal mengurai file', 500);
  }
};

/**
 * @swagger
 * /api/lkps/confirm:
 *   post:
 *     summary: Konfirmasi dan simpan dokumen LKPS ke database
 *     description: Menerima file Excel LKPS, menyimpannya ke server, dan membuat record di database. Admin dapat menentukan prodiId, sedangkan Kaprodi akan otomatis menggunakan prodiId mereka
 *     tags: [LKPS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File Excel LKPS (.xlsx)
 *               prodiId:
 *                 type: string
 *                 format: id
 *                 description: ID program studi (opsional untuk admin, required untuk kaprodi)
 *               name:
 *                 type: string
 *                 description: Nama dokumen LKPS (opsional, default berdasarkan filename)
 *               periode:
 *                 type: string
 *                 description: Periode/tahun LKPS (opsional)
 *             required:
 *               - file
 *     responses:
 *       201:
 *         description: LKPS berhasil diupload dan disimpan ke database
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
 *                       format: id
 *                     prodiId:
 *                       type: string
 *                       format: id
 *                     name:
 *                       type: string
 *                     filePath:
 *                       type: string
 *                     originalFilename:
 *                       type: string
 *                     periode:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [DRAFT, FINAL]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: File atau Program studi tidak ditemukan
 *       401:
 *         description: Tidak terautentikasi
 *       500:
 *         description: Gagal mengupload LKPS
 */
export const confirmLKPSHandler = async (req: Request, res: Response) => {
  try {
    console.log('--- LKPS UPLOAD DEBUG ---');
    console.log('Headers:', req.headers['content-type']);
    console.log('Body Keys:', Object.keys(req.body));
    console.log('Periode value:', req.body.periode);
    console.log('-------------------------');
    
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
 *         description: Riwayat LKPS berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: id
 *                       prodiId:
 *                         type: string
 *                         format: id
 *                       name:
 *                         type: string
 *                       periode:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [DRAFT, FINAL]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       prodi:
 *                         type: object
 *                         properties:
 *                           fullname:
 *                             type: string
 *                 message:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: Dokumen tidak ditemukan
 *       500:
 *         description: Gagal mengambil dokumen
 */
export const getLKPSDocumentHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    console.log(`[LKPS Controller] Fetching document ID: ${id}`);
    const document = await lkpsService.getLKPSDocumentById(id);
    
    if (!document) {
      console.log(`[LKPS Controller] Document NOT FOUND: ${id}`);
      return errorResponse(res, 'Dokumen tidak ditemukan', 404);
    }
    
    console.log(`[LKPS Controller] Document FOUND: ${id}, content keys: ${document.content ? Object.keys(document.content as object).length : 0}`);
    return successResponse(res, document, 'Berhasil mengambil dokumen LKPS');
  } catch (error: any) {
    console.error('Error getting document:', error);
    return errorResponse(res, 'Gagal mengambil dokumen', 500);
  }
};

/**
 * @swagger
 * /api/lkps/export/{id}:
 *   get:
 *     summary: Mengekspor dokumen LKPS sebagai file Excel
 *     description: Mengambil dokumen LKPS dari database dan mengirimnya sebagai file Excel untuk diunduh. Jika file original masih tersedia, akan dikirim file aslinya. Jika tidak, akan generate ulang dari data yang tersimpan di database
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
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: 'attachment; filename="LKPS_Informatika.xlsx"'
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Dokumen tidak ditemukan atau data dokumen tidak lengkap
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

    // Prefer serving the original file if it exists
    if (document.filePath) {
      const fullPath = path.join(process.cwd(), document.filePath);
      if (fs.existsSync(fullPath)) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalFilename || 'LKPS.xlsx'}"`);
        return res.sendFile(fullPath);
      }
    }

    // Fallback to generating from content if original file is missing
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
