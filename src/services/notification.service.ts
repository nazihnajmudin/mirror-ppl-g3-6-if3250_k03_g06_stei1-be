import prisma from '../config/database.config';
import { getThresholdValue } from './settings.service';
import { NotificationType } from '@prisma/client';
import { getSimulationByProdi } from './simulasiskor.service';

export const generateEarlyWarnings = async () => {
  console.log('[Notification Service] Generating early warnings...');
  
  const expiryThreshold = await getThresholdValue('accreditation_expiry_warning_days', 180);
  const passingGradeThresholdRaw = await getThresholdValue('indicator_passing_grade', 25);
  const passingGradeThreshold = passingGradeThresholdRaw / 10; // Convert 25 -> 2.5
  
  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + expiryThreshold);

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

    // 2. Check Indicator Scores (Low Achievement Warning)
    try {
      const simulation = await getSimulationByProdi(prodi.id);
      for (const indicator of simulation.indicators) {
        // Convert 0-100 score to 0-4 scale for comparison with threshold (e.g. 2.5)
        const scaledScore = indicator.totalScore / 25;
        
        if (scaledScore < passingGradeThreshold) {
          await createNotificationIfNotExists({
            prodiId: prodi.id,
            title: `Capaian Indikator Rendah: ${indicator.name}`,
            message: `Skor indikator ${indicator.name} (${scaledScore.toFixed(2)}) berada di bawah passing grade (${passingGradeThreshold.toFixed(2)}).`,
            type: 'WARNING',
            targetUrl: `/dashboard/lkps/${prodi.id}`,
          });
        }
      }
    } catch (simError) {
      console.error(`[Notification Service] Gagal mengambil simulasi untuk prodi ${prodi.id}:`, simError);
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
