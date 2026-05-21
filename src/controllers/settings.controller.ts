import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import * as settingsService from '../services/settings.service';
import { generateEarlyWarnings } from '../services/notification.service';

export const getThresholdsHandler = async (req: Request, res: Response) => {
  try {
    const thresholds = await settingsService.getThresholds();
    return successResponse(res, thresholds, 'Berhasil mengambil data pengaturan');
  } catch (error: any) {
    console.error('Error getting thresholds:', error);
    return errorResponse(res, 'Gagal mengambil data pengaturan', 500);
  }
};

export const updateThresholdHandler = async (req: Request, res: Response) => {
  try {
    const { name, value } = req.body;
    if (!name || value === undefined) {
      return errorResponse(res, 'Nama dan nilai pengaturan harus diisi', 400);
    }
    const threshold = await settingsService.updateThreshold(name, Number(value));
    
    // Recalculate early warnings in real-time when thresholds are modified
    generateEarlyWarnings().catch(err => console.error('Failed to trigger early warnings after threshold change:', err));

    return successResponse(res, threshold, 'Berhasil memperbarui pengaturan');
  } catch (error: any) {
    console.error('Error updating threshold:', error);
    return errorResponse(res, 'Gagal memperbarui pengaturan', 500);
  }
};
