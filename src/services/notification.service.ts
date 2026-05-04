import prisma from '../config/database.config';
import { getThresholdValue } from './settings.service';
import { NotificationType } from '@prisma/client';

export const generateEarlyWarnings = async () => {
  console.log('[Notification Service] Generating early warnings...');
  
  const expiryThreshold = await getThresholdValue('accreditation_expiry_warning_days', 180);
  const inactivityThreshold = await getThresholdValue('document_inactivity_days', 30);
  
  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + expiryThreshold);

  const inactivityDate = new Date();
  inactivityDate.setDate(now.getDate() - inactivityThreshold);

  const prodis = await prisma.prodi.findMany({
    include: { accreditation: true },
  });

  for (const prodi of prodis) {
    // 1. Check Accreditation Expiry
    if (prodi.accreditation?.endDate) {
      const endDate = new Date(prodi.accreditation.endDate);
      if (endDate <= warningDate && endDate > now) {
        await createNotificationIfNotExists({
          prodiId: prodi.id,
          title: 'Peringatan Akreditasi',
          message: `Akreditasi prodi ${prodi.fullname} akan berakhir pada ${endDate.toLocaleDateString('id-ID')}.`,
          type: 'WARNING',
          targetUrl: `/profil-prodi?prodiId=${prodi.id}`,
        });
      } else if (endDate <= now) {
        await createNotificationIfNotExists({
          prodiId: prodi.id,
          title: 'Akreditasi Kedaluwarsa',
          message: `Akreditasi prodi ${prodi.fullname} telah kedaluwarsa pada ${endDate.toLocaleDateString('id-ID')}.`,
          type: 'DANGER',
          targetUrl: `/profil-prodi?prodiId=${prodi.id}`,
        });
      }
    }

    // 2. Check Document Inactivity (LKPS)
    const latestLKPS = await prisma.documentLKPS.findFirst({
      where: { prodiId: prodi.id },
      orderBy: { updatedAt: 'desc' }
    });

    if (latestLKPS && latestLKPS.status === 'DRAFT' && latestLKPS.updatedAt < inactivityDate) {
      await createNotificationIfNotExists({
        prodiId: prodi.id,
        title: 'Dokumen LKPS Tidak Aktif',
        message: `Dokumen LKPS prodi ${prodi.fullname} belum diperbarui selama lebih dari ${inactivityThreshold} hari.`,
        type: 'INFO',
        targetUrl: `/dashboard/lkps/${prodi.id}`,
      });
    }

    // 3. Check Document Inactivity (LED)
    const latestLED = await prisma.documentLED.findFirst({
      where: { prodiId: prodi.id },
      orderBy: { updatedAt: 'desc' }
    });

    if (latestLED && latestLED.status === 'DRAFT' && latestLED.updatedAt < inactivityDate) {
      await createNotificationIfNotExists({
        prodiId: prodi.id,
        title: 'Dokumen LED Tidak Aktif',
        message: `Dokumen LED prodi ${prodi.fullname} belum diperbarui selama lebih dari ${inactivityThreshold} hari.`,
        type: 'INFO',
        targetUrl: `/led`,
      });
    }
  }
};

const createNotificationIfNotExists = async (params: {
  prodiId: string;
  title: string;
  message: string;
  type: NotificationType;
  targetUrl: string;
}) => {
  const existing = await prisma.notification.findFirst({
    where: {
      prodiId: params.prodiId,
      title: params.title,
      isRead: false,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    }
  });

  if (!existing) {
    await prisma.notification.create({
      data: {
        prodiId: params.prodiId,
        title: params.title,
        message: params.message,
        type: params.type,
        targetUrl: params.targetUrl,
      }
    });
  }
};

export const getNotifications = async (role: string, prodiId?: string | null) => {
  if (role === 'SUPER_ADMIN' || role === 'PIMPINAN') {
    return await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: { prodi: true }
    });
  }
  
  if (prodiId) {
    return await prisma.notification.findMany({
      where: { prodiId },
      orderBy: { createdAt: 'desc' },
      include: { prodi: true }
    });
  }
  
  return [];
};

export const markAsRead = async (id: string) => {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
};
