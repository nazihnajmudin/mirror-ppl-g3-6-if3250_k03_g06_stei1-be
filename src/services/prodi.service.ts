import prisma from '../config/database.config';
import { Role } from '@prisma/client';
import { UpdateProdiInput, UpsertAccreditationInput } from '../validators/prodi.validator';

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

const prodiSelect = {
  id: true,
  fullname: true,
  abbreviation: true,
  degree: true,
  accreditation: true,
  createdAt: true,
  updatedAt: true,
};

export const getAllProdi = async () => {
  return prisma.prodi.findMany({
    select: prodiSelect,
    orderBy: { fullname: 'asc' },
  });
};

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

  // Admin/Pimpinan see everything
  if (user.role === Role.SUPER_ADMIN || user.role === Role.PIMPINAN) {
    return prisma.prodi.findMany({
      orderBy: { fullname: 'asc' },
    });
  }

  // For Prodi Staff (KAPRODI/TIM_PRODI): Collect unique prodis from primary prodiId AND assignments
  const prodiMap = new Map<string, any>();

  if (user.prodi) {
    prodiMap.set(user.prodi.id, user.prodi);
  }

  user.assignments.forEach((a) => {
    if (a.prodi) {
      prodiMap.set(a.prodi.id, a.prodi);
    }
  });

  return Array.from(prodiMap.values());
};

export const getProdiById = async (id: string) => {
  const prodi = await prisma.prodi.findUnique({ where: { id }, select: prodiSelect });
  if (!prodi) throw new Error('Program studi tidak ditemukan');
  return prodi;
};

export const updateProdi = async (id: string, data: UpdateProdiInput) => {
  const existing = await prisma.prodi.findUnique({ where: { id } });
  if (!existing) throw new Error('Program studi tidak ditemukan');

  if (data.fullname && data.fullname !== existing.fullname) {
    const conflict = await prisma.prodi.findUnique({ where: { fullname: data.fullname } });
    if (conflict) throw new Error('Nama program studi sudah digunakan');
  }

  return prisma.prodi.update({
    where: { id },
    data,
    select: prodiSelect,
  });
};

export const getAccreditation = async (prodiId: string) => {
  const prodi = await prisma.prodi.findUnique({ where: { id: prodiId } });
  if (!prodi) throw new Error('Program studi tidak ditemukan');

  const accreditation = await prisma.accreditationInfo.findUnique({ where: { prodiId } });
  return accreditation;
};

export const upsertAccreditation = async (prodiId: string, data: UpsertAccreditationInput) => {
  const prodi = await prisma.prodi.findUnique({ where: { id: prodiId } });
  if (!prodi) throw new Error('Program studi tidak ditemukan');

  return prisma.accreditationInfo.upsert({
    where: { prodiId },
    update: {
      ...(data.grade !== undefined && { grade: data.grade }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      ...(data.certificateUrl !== undefined && { certificateUrl: data.certificateUrl }),
    },
    create: {
      prodiId,
      grade: data.grade,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      certificateUrl: data.certificateUrl,
    },
  });
};

export const getDashboardByProdi = async (prodiId: string): Promise<DashboardData> => {
  const prodi = await prisma.prodi.findUnique({
    where: { id: prodiId },
    include: {
      accreditation: true,
      documentLKPS: {
        orderBy: { updatedAt: 'desc' },
        take: 1
      },
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

  const accreditation = prodi.accreditation || {
    grade: null,
    startDate: null,
    endDate: null,
  };

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

  const simulationScore = 0;

  const criteria = Array.from({ length: 9 }, (_, i) => ({
    id: `k${i + 1}`,
    code: `K${i + 1}`,
    name: `Kriteria ${i + 1}`,
    progress: 100,
  }));

  const criticalIndicators: Array<{ id: string; name: string; status: string }> = [];

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
  const prodi = await prisma.prodi.findUnique({ where: { id: prodiId } });
  if (!prodi) throw new Error('Program studi tidak ditemukan');

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

  if (data.accreditationInfo) {
    const existingAccreditation = await prisma.accreditationInfo.findFirst({
      where: { prodiId },
    });

    if (existingAccreditation) {
      await prisma.accreditationInfo.update({
        where: { id: existingAccreditation.id },
        data: {
          ...(data.accreditationInfo.grade && { grade: data.accreditationInfo.grade }),
          ...(data.accreditationInfo.startDate && { startDate: new Date(data.accreditationInfo.startDate) }),
          ...(data.accreditationInfo.endDate && { endDate: new Date(data.accreditationInfo.endDate) }),
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

  return getDashboardByProdi(prodiId);
};
