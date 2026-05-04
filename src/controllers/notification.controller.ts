import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import * as notificationService from '../services/notification.service';
import { JwtPayload } from '../middlewares/auth.middleware';

export const getNotificationsHandler = async (req: Request, res: Response) => {
  try {
    const user = req.user as JwtPayload;
    if (!user) {
      return errorResponse(res, 'Tidak terautentikasi', 401);
    }
    
    const notifications = await notificationService.getNotifications(
      String(user.role), 
      user.prodiId ? String(user.prodiId) : null
    );
    return successResponse(res, notifications, 'Berhasil mengambil notifikasi');
  } catch (error: any) {
    console.error('Error getting notifications:', error);
    return errorResponse(res, 'Gagal mengambil notifikasi', 500);
  }
};

export const markAsReadHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id as string);
    return successResponse(res, notification, 'Notifikasi ditandai sudah dibaca');
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return errorResponse(res, 'Gagal memperbarui notifikasi', 500);
  }
};

/**
 * Trigger manual untuk testing sistem early warning
 */
export const triggerEarlyWarningHandler = async (req: Request, res: Response) => {
  try {
    await notificationService.generateEarlyWarnings();
    return successResponse(res, null, 'Early warning system triggered');
  } catch (error: any) {
    console.error('Error triggering early warning:', error);
    return errorResponse(res, 'Gagal menjalankan early warning system', 500);
  }
};
