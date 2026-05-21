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
      const isExpiringSoon = endDate <= warningDate && endDate > now;
      const isExpired = endDate <= now;

      if (isExpiringSoon) {
        const title = 'Peringatan Akreditasi';
        const message = `Akreditasi prodi ${prodi.fullname} akan berakhir pada ${endDate.toLocaleDateString('id-ID')}.`;
        const type = 'WARNING';
        const targetUrl = `/profil-prodi?prodiId=${prodi.id}`;

        await createOrUpdateNotification({
          prodiId: prodi.id,
          title,
          message,
          type,
          targetUrl,
          clearTitles: ['Peringatan Akreditasi', 'Akreditasi Kedaluwarsa']
        });
      } else if (isExpired) {
        const title = 'Akreditasi Kedaluwarsa';
        const message = `Akreditasi prodi ${prodi.fullname} telah kedaluwarsa pada ${endDate.toLocaleDateString('id-ID')}.`;
        const type = 'DANGER';
        const targetUrl = `/profil-prodi?prodiId=${prodi.id}`;

        await createOrUpdateNotification({
          prodiId: prodi.id,
          title,
          message,
          type,
          targetUrl,
          clearTitles: ['Peringatan Akreditasi', 'Akreditasi Kedaluwarsa']
        });
      } else {
        // Safe! Clear any existing accreditation warnings
        await prisma.notification.deleteMany({
          where: {
            prodiId: prodi.id,
            title: { in: ['Peringatan Akreditasi', 'Akreditasi Kedaluwarsa'] },
          },
        });
      }
    } else {
      // No accreditation date set, clear any existing accreditation warnings
      await prisma.notification.deleteMany({
        where: {
          prodiId: prodi.id,
          title: { in: ['Peringatan Akreditasi', 'Akreditasi Kedaluwarsa'] },
        },
      });
    }

    // 2. Check Indicator Scores (Low Achievement Warning)
    try {
      const simulation = await getSimulationByProdi(prodi.id);
      for (const indicator of simulation.indicators) {
        const scaledScore = indicator.totalScore / 25;
        const title = `Capaian Indikator Rendah: ${indicator.name}`;

        if (scaledScore < passingGradeThreshold) {
          const message = `Skor indikator ${indicator.name} (${scaledScore.toFixed(2)}) berada di bawah passing grade (${passingGradeThreshold.toFixed(2)}).`;
          const type = 'WARNING';
          const targetUrl = `/dashboard/lkps/${prodi.id}`;

          await createOrUpdateNotification({
            prodiId: prodi.id,
            title,
            message,
            type,
            targetUrl,
            clearTitles: [title]
          });
        } else {
          // Clear this specific indicator warning if it is now passing
          await prisma.notification.deleteMany({
            where: {
              prodiId: prodi.id,
              title: title,
            },
          });
        }
      }
    } catch (simError) {
      console.error(`[Notification Service] Gagal mengambil simulasi untuk prodi ${prodi.id}:`, simError);
    }
  }
};

const createOrUpdateNotification = async (params: {
  prodiId: string;
  title: string;
  message: string;
  type: NotificationType;
  targetUrl: string;
  clearTitles: string[];
}) => {
  const existing = await prisma.notification.findFirst({
    where: {
      prodiId: params.prodiId,
      title: params.title,
      message: params.message,
    }
  });

  if (!existing) {
    // If message changed or is new, clear outdated notifications of specified titles
    await prisma.notification.deleteMany({
      where: {
        prodiId: params.prodiId,
        title: { in: params.clearTitles },
      }
    });

    // Create the correct updated notification
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
