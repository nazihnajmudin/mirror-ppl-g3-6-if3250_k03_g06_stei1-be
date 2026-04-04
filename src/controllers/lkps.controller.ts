import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import { parseLKPSExcel } from '../parsers/lkps.parser';
import * as lkpsService from '../services/lkps.service';
import prisma from '../config/database.config';
import fs from 'fs';
import path from 'path';

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

    const document = await lkpsService.createLKPSDocument(
      targetProdiId, 
      {}, // Empty content since we're just storing the binary file
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

export const exportLKPSHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const document = await lkpsService.getLKPSDocumentById(id);

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
