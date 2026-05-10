import { Request, Response } from 'express';
import * as InstitusiService from '../services/institusi.service';
import { upsertInstitusiSchema } from '../validators/institusi.validator';
import { errorResponse } from '../utils/response'; 

export const upsertInstitusiHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = upsertInstitusiSchema.parse({ body: req.body });
    const { periode, sheetName, data } = validatedData.body;

    const userId = req.user!.userId; 

    const result = await InstitusiService.upsertAndSyncInstitusi(
      periode, 
      sheetName, 
      data, 
      userId
    );

    return res.status(200).json({
      status: 'success',
      message: 'Data institusi berhasil disimpan dan disinkronisasi ke 11 Prodi',
      data: result
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ status: 'error', message: error.errors });
    }
    return errorResponse(res, error.message, 500);
  }
};

export const getInstitusiHandler = async (req: Request, res: Response) => {
  try {
    const { periode, sheetName } = req.query;
    if (!periode) return errorResponse(res, 'Periode wajib diisi', 400);

    const result = await InstitusiService.getDataInstitusi(
      periode as string, 
      sheetName as string | undefined
    );

    return res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};