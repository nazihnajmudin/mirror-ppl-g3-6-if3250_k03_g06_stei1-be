import { Request, Response } from 'express';
import * as simulasiskorService from '../services/simulasiskor.service';
import { successResponse, errorResponse } from '../utils/response';

export const getSimulationByProdiHandler = async (req: Request, res: Response) => {
  try {
    const prodiId = String(req.params.prodiId);
    const simulation = await simulasiskorService.getSimulationByProdi(prodiId);
    successResponse(res, simulation, 'Simulasi skor akreditasi berhasil diambil');
  } catch (err: any) {
    const status = err.message?.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, err.message || 'Gagal mengambil simulasi skor akreditasi', status);
  }
};

export const updateSimulationQualitativeHandler = async (req: Request, res: Response) => {
  try {
    // Only KAPRODI can update qualitative scores
    const userRole = (req.user as any)?.role;
    if (userRole !== 'KAPRODI') {
      return errorResponse(res, 'Hanya Kaprodi yang dapat mengubah skor kualitatif', 403);
    }

    const prodiId = String(req.params.prodiId);
    const { qualitativeScores } = req.body;
    const simulation = await simulasiskorService.updateSimulationQualitative(prodiId, qualitativeScores);
    successResponse(res, simulation, 'Skor kualitatif simulasi akreditasi berhasil disimpan');
  } catch (err: any) {
    const status = err.message?.includes('tidak ditemukan') ? 404 : 400;
    errorResponse(res, err.message || 'Gagal menyimpan skor kualitatif', status);
  }
};
