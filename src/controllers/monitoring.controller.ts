import { Request, Response } from 'express';
import { MonitoringDocumentType, MonitoringStatus } from '@prisma/client';
import * as monitoringService from '../services/monitoring.service';
import { successResponse, errorResponse } from '../utils/response';

const parseDocumentType = (value: unknown): MonitoringDocumentType => {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'LKPS' || normalized === 'LED' || normalized === 'EVIDEN') {
    return normalized as MonitoringDocumentType;
  }
  throw new Error('Jenis dokumen monitoring tidak valid');
};

const parseStatus = (value: unknown): MonitoringStatus | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const normalized = String(value).toUpperCase();
  if (normalized === 'OPEN' || normalized === 'IN_PROGRESS' || normalized === 'RESOLVED') {
    return normalized as MonitoringStatus;
  }
  throw new Error('Status monitoring tidak valid');
};

export const createMonitoringHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Pengguna tidak terautentikasi', 401);
    }

    const documentType = parseDocumentType(req.body.documentType);
    const result = await monitoringService.createMonitoringEvaluation({
      documentType,
      documentId: String(req.body.documentId),
      indicatorCode: req.body.indicatorCode,
      indicatorName: String(req.body.indicatorName || '').trim(),
      note: String(req.body.note || '').trim(),
      evaluation: req.body.evaluation,
      recommendation: req.body.recommendation,
      status: parseStatus(req.body.status),
      reviewedAt: req.body.reviewedAt,
      createdById: userId,
    });

    return successResponse(res, result, 'Catatan monitoring berhasil ditambahkan', 201);
  } catch (error: any) {
    return errorResponse(res, error.message, 400);
  }
};

export const getMonitoringHistoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Pengguna tidak terautentikasi', 401);
    }

    const documentType = parseDocumentType(req.params.documentType);
    const result = await monitoringService.getMonitoringHistory(documentType, String(req.params.documentId), userId);
    return successResponse(res, result, 'Riwayat monitoring berhasil diambil');
  } catch (error: any) {
    return errorResponse(res, error.message, 400);
  }
};

export const updateMonitoringHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Pengguna tidak terautentikasi', 401);
    }

    const result = await monitoringService.updateMonitoringEvaluation(String(req.params.id), {
      indicatorCode: req.body.indicatorCode,
      indicatorName: req.body.indicatorName,
      note: req.body.note,
      evaluation: req.body.evaluation,
      recommendation: req.body.recommendation,
      status: parseStatus(req.body.status),
      reviewedAt: req.body.reviewedAt,
    }, userId);

    return successResponse(res, result, 'Catatan monitoring berhasil diperbarui');
  } catch (error: any) {
    return errorResponse(res, error.message, 400);
  }
};

export const deleteMonitoringHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Pengguna tidak terautentikasi', 401);
    }

    await monitoringService.deleteMonitoringEvaluation(String(req.params.id), userId);
    return successResponse(res, null, 'Catatan monitoring berhasil dihapus');
  } catch (error: any) {
    return errorResponse(res, error.message, 400);
  }
};

export const getMonitoringSummaryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Pengguna tidak terautentikasi', 401);
    }

    const result = await monitoringService.getMonitoringSummary(userId);
    return successResponse(res, result, 'Ringkasan monitoring berhasil diambil');
  } catch (error: any) {
    return errorResponse(res, error.message, 400);
  }
};
