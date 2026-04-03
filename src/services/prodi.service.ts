import prisma from '../config/database.config';
import { Role } from '@prisma/client';

export interface DashboardData {
  prodi: {
    id: string;
    fullname: string;
    abbreviation: string | null;
    degree: string | null;
  };
  accreditation: {
    grade: string | null;
    startDate: string | null;
    endDate: string | null;
  };
  documents: {
    lkps: {
      status: string;
      progress: number;
    };
    led: {
      status: string;
      progress: number;
    };
  };
  simulationScore: number;
  criteria: Array<{
    id: string;
    code: string;
    name: string;
    progress: number;
  }>;
  criticalIndicators: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
}

/**
 * Get all prodi for current user based on their role and assignments
 */
export const getProdiForUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      prodi: true,
      assignments: {
        include: {
          prodi: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  // If user is KAPRODI, return their single prodi
  if (user.role === Role.KAPRODI && user.prodi) {
    return [user.prodi];
  }

  // If user is TIM_PRODI, return all assigned prodi
  if (user.role === Role.TIM_PRODI) {
    return user.assignments.map((a) => a.prodi);
  }

  // SUPER_ADMIN and PIMPINAN can see all prodi
  return prisma.prodi.findMany({
    orderBy: { fullname: 'asc' },
  });
};

/**
 * Get specific prodi by ID
 */
export const getProdiById = async (prodiId: string) => {
  const prodi = await prisma.prodi.findUnique({
    where: { id: prodiId },
    select: {
      id: true,
      fullname: true,
      abbreviation: true,
      degree: true,
    },
  });

  if (!prodi) {
    throw new Error('Program studi tidak ditemukan');
  }

  return prodi;
};

/**
 * Get dashboard data for a specific prodi
 * Returns aggregated data about accreditation status, documents, and activities
 */
export const getDashboardByProdi = async (prodiId: string): Promise<DashboardData> => {
  const prodi = await prisma.prodi.findUnique({
    where: { id: prodiId },
    include: {
      accreditation: true,
      // Dokumen LKPS terakhir di-update
      documentLKPS: {
        orderBy: { updatedAt: 'desc' },
        take: 1
      },
      // Ddokumen LED versi tertinggi
      documentLED: {
        orderBy: { versi: 'desc' },
        take: 1
      },
      users: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!prodi) {
    throw new Error('Program studi tidak ditemukan');
  }

  // Get accreditation info
  const accreditation = prodi.accreditation || {
    grade: null,
    startDate: null,
    endDate: null,
  };

  // Calculate document progress (placeholder - will be updated based on actual document content)
  const lkpsDoc = prodi.documentLKPS[0];
  const ledDoc = prodi.documentLED[0];

  const documents = {
    lkps: {
      status: lkpsDoc?.status || 'DRAFT',
      progress: lkpsDoc?.status === 'FINAL' ? 100 : (lkpsDoc ? 50 : 0),
    },
    led: {
      status: ledDoc?.status || 'DRAFT',
      progress: ledDoc?.status === 'FINAL' ? 100 : (ledDoc ? 50 : 0),
    },
  };

  // Placeholder for simulation score (will be updated based on actual criteria data)
  const simulationScore = 0;

  // Placeholder for criteria progress (K1-K9)
  const criteria = Array.from({ length: 9 }, (_, i) => ({
    id: `k${i + 1}`,
    code: `K${i + 1}`,
    name: `Kriteria ${i + 1}`,
    progress: 100, // Placeholder
  }));

  // Placeholder for critical indicators
  const criticalIndicators: Array<{
    id: string;
    name: string;
    status: string;
  }> = []; // Empty by default

  // Placeholder for recent activities (will be updated based on actual activity logs)
  const recentActivities = prodi.users
    .slice(0, 4)
    .map((user, index) => ({
      id: user.id,
      user: user.name,
      action: 'Melakukan aktivitas sistem',
      timestamp: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    }));

  return {
    prodi: {
      id: prodi.id,
      fullname: prodi.fullname,
      abbreviation: prodi.abbreviation,
      degree: prodi.degree,
    },
    accreditation: {
      grade: accreditation.grade,
      startDate: accreditation.startDate?.toISOString() || null,
      endDate: accreditation.endDate?.toISOString() || null,
    },
    documents,
    simulationScore,
    criteria,
    criticalIndicators,
    recentActivities,
  };
};

/**
 * Update dashboard for a specific prodi
 * Updates documents and accreditation info
 */
export const updateDashboardByProdi = async (
  prodiId: string,
  data: {
    documentLKPS?: Array<{ id: string; status?: string; content?: any }>;
    documentLED?: Array<{ id: string; status?: string; content?: string }>;
    accreditationInfo?: {
      grade?: string;
      startDate?: string;
      endDate?: string;
    };
  }
) => {
  // Verify prodi exists
  const prodi = await prisma.prodi.findUnique({
    where: { id: prodiId },
  });

  if (!prodi) {
    throw new Error('Program studi tidak ditemukan');
  }

  // Update LKPS if provided
  if (data.documentLKPS && Array.isArray(data.documentLKPS)) {
    for (const doc of data.documentLKPS) {
      if (doc.id) {
        await prisma.documentLKPS.update({
          where: { id: doc.id },
          data: {
            ...(doc.status && { status: doc.status as any }),
            ...(doc.content && { content: doc.content }),
          },
        });
      }
    }
  }

  // Update LED if provided
  if (data.documentLED && Array.isArray(data.documentLED)) {
    for (const doc of data.documentLED) {
      if (doc.id) {
        await prisma.documentLED.update({
          where: { id: doc.id },
          data: {
            ...(doc.status && { status: doc.status as any }),
            ...(doc.content && { content: doc.content }),
          },
        });
      }
    }
  }

  // Update accreditation info if provided
  if (data.accreditationInfo) {
    const existingAccreditation = await prisma.accreditationInfo.findFirst({
      where: { prodiId },
    });

    if (existingAccreditation) {
      await prisma.accreditationInfo.update({
        where: { id: existingAccreditation.id },
        data: {
          ...(data.accreditationInfo.grade && { grade: data.accreditationInfo.grade }),
          ...(data.accreditationInfo.startDate && {
            startDate: new Date(data.accreditationInfo.startDate),
          }),
          ...(data.accreditationInfo.endDate && {
            endDate: new Date(data.accreditationInfo.endDate),
          }),
        },
      });
    } else {
      await prisma.accreditationInfo.create({
        data: {
          prodiId,
          grade: data.accreditationInfo.grade || '',
          startDate: data.accreditationInfo.startDate ? new Date(data.accreditationInfo.startDate) : null,
          endDate: data.accreditationInfo.endDate ? new Date(data.accreditationInfo.endDate) : null,
        },
      });
    }
  }

  // Return updated dashboard
  return getDashboardByProdi(prodiId);
};
