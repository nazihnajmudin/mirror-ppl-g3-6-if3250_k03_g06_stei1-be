import { Request, Response } from 'express';
import * as evidenService from '../services/eviden.service';
import { successResponse, errorResponse } from '../utils/response';
import { evidenSchema } from '../validators/eviden.validator';

/**
 * @swagger
 * tags:
 * - name: Eviden
 * description: Manajemen Dokumen Eviden
 */

export const createEvidenHandler = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.userId;
        const validation = evidenSchema.safeParse(req.body);
        if (!validation.success) throw new Error(validation.error.issues[0].message);

        const data = validation.data;
        const files = req.files as Express.Multer.File[] || [];

        // Parsing JSON strings dari FormData
        const parsedData = {
            ...data,
            indikator: data.indikator ? JSON.parse(data.indikator) : [],
        };

        const result = await evidenService.createEviden(parsedData, files, userId);
        successResponse(res, result, 'Dokumen Eviden berhasil ditambahkan', 201);
    } catch (err: any) {
        errorResponse(res, err.message, 400);
    }
};

export const getEvidenListHandler = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.userId;
        const role = (req.user as any)?.role;
        
        const result = await evidenService.getEvidenList(userId, role);
        successResponse(res, result, 'Berhasil mengambil daftar eviden');
    } catch (err: any) {
        errorResponse(res, err.message, 400);
    }
};

export const getEvidenByIdHandler = async (req: Request, res: Response) => {
    try {
        const result = await evidenService.getEvidenById(String(req.params.id));
        successResponse(res, result, 'Berhasil mengambil detail eviden');
    } catch (err: any) {
        errorResponse(res, err.message, 404);
    }
};

export const updateEvidenHandler = async (req: Request, res: Response) => {
    try {
        const validation = evidenSchema.safeParse(req.body);
        if (!validation.success) throw new Error(validation.error.issues[0].message);

        const data = validation.data;
        const files = req.files as Express.Multer.File[] || [];
        
        const parsedData = {
            ...data,
            indikator: data.indikator ? JSON.parse(data.indikator) : [],
        };
        const deletedFileIds = data.deletedFileIds ? JSON.parse(data.deletedFileIds) : [];

        const result = await evidenService.updateEviden(String(req.params.id), parsedData, files, deletedFileIds);
        successResponse(res, result, 'Dokumen Eviden berhasil diperbarui');
    } catch (err: any) {
        errorResponse(res, err.message, 400);
    }
};

export const deleteEvidenHandler = async (req: Request, res: Response) => {
    try {
        await evidenService.deleteEviden(String(req.params.id));
        successResponse(res, null, 'Dokumen Eviden berhasil dihapus');
    } catch (err: any) {
        errorResponse(res, err.message, 400);
    }
};

export const downloadFileHandler = async (req: Request, res: Response) => {
    try {
        const { file, filePath } = await evidenService.getEvidenFile(String(req.params.fileId));
        res.download(filePath, file.originalFilename, (err) => {
            if (err) res.status(404).send('File fisik tidak ditemukan di server.');
        });
    } catch (err: any) {
        errorResponse(res, err.message, 404);
    }
};