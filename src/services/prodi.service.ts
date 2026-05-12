import prisma from '../config/database.config';
import { Role } from '@prisma/client';
import { UpdateProdiInput, UpsertAccreditationInput } from '../validators/prodi.validator';
import { storageProvider } from '../utils/storage';

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
  lamTemplate: 'LAM_TEKNIK' | 'INFOKOM';
  criteria: Array<{
    id: string;
    code: string;
    name: string;
    progress: number;
    subsections: Array<{
      id: string;
      name: string;
      progress: number;
    }>;
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

  const existing = await prisma.accreditationInfo.findUnique({ where: { prodiId } });
  const finalStartDate = data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : existing?.startDate;
  const finalEndDate = data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : existing?.endDate;

  if (finalStartDate && finalEndDate && finalStartDate > finalEndDate) {
    throw new Error('Tanggal mulai berlaku tidak boleh melebihi tanggal berakhir');
  }

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

export const uploadAccreditationCertificate = async (prodiId: string, file: Express.Multer.File) => {
  const prodi = await prisma.prodi.findUnique({ where: { id: prodiId } });
  if (!prodi) throw new Error('Program studi tidak ditemukan');

  const existing = await prisma.accreditationInfo.findUnique({ where: { prodiId } });

  if (existing?.certificateUrl && !existing.certificateUrl.startsWith('http')) {
    try { await storageProvider.delete(existing.certificateUrl, 'accreditation'); } catch (_) {}
  }

  const savedFileName = await storageProvider.upload(file, 'accreditation');

  return prisma.accreditationInfo.upsert({
    where: { prodiId },
    update: {
      certificateUrl: savedFileName,
      certificateOriginalName: file.originalname,
    },
    create: {
      prodiId,
      certificateUrl: savedFileName,
      certificateOriginalName: file.originalname,
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

  const lkpsDoc = prodi.documentLKPS[0] as { status: string } | undefined;
  const ledDoc = prodi.documentLED[0] as { status: string } | undefined;

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

  const latestLEDForm = await (prisma as any).ledForm.findFirst({
    where: { prodiId },
    orderBy: { createdAt: 'desc' },
    select: { template: true, content: true },
  });
  const isInfokom = latestLEDForm?.template === 'INFOKOM';

  const recentFormsPromise = (prisma as any).ledForm.findMany({
    where: { prodiId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, createdAt: true, template: true, createdBy: { select: { name: true } } },
  });
  const recentUploadsPromise = (prisma as any).documentLED.findMany({
    where: { prodiId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: { id: true, updatedAt: true, name: true, pengunggah: { select: { name: true } } },
  });

  const [recentForms, recentUploads] = await Promise.all([recentFormsPromise, recentUploadsPromise]);

  const recentActivitiesUnsorted: Array<{ id: string; user: string; action: string; timestamp: Date }> = [];
  
  recentForms.forEach((f: any) => {
    recentActivitiesUnsorted.push({
      id: f.id,
      user: f.createdBy?.name || 'Sistem',
      action: `Menyimpan draft formulir LED (${f.template === 'INFOKOM' ? 'Infokom' : 'Teknik'})`,
      timestamp: f.createdAt,
    });
  });

  recentUploads.forEach((u: any) => {
    recentActivitiesUnsorted.push({
      id: u.id,
      user: u.pengunggah?.name || 'Sistem',
      action: `Mengunggah dokumen final LED (${u.name || 'Dokumen LED'})`,
      timestamp: u.updatedAt,
    });
  });

  const recentActivities = recentActivitiesUnsorted
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 4)
    .map(a => ({ ...a, timestamp: a.timestamp.toISOString() }));

  const simulationRecord = await prisma.accreditationSimulation.findUnique({ where: { prodiId } });
  const simulationScore = simulationRecord?.totalScore ?? 0;

  const rawContent = latestLEDForm?.content ?? null;
  const formContent: Record<string, string> = rawContent
    ? (typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent)
    : {};

  const isFilledSection = (html: string | undefined): boolean => {
    if (!html) return false;
    const plainText = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (plainText.length < 300) return false;
    const lower = plainText.toLowerCase();
    if (lower.includes('diisi oleh pengusul')) return false;
    if (lower.includes('penjelasan disampaikan oleh pengusul')) return false;
    if (lower.includes('bagian ini berisi')) return false;
    if (lower.includes('bagian ini menjelaskan')) return false;
    return true;
  };

  const calcProgress = (keys: string[]): number => {
    if (keys.length === 0) return 0;
    const filled = keys.filter((k) => isFilledSection(formContent[k])).length;
    return Math.round((filled / keys.length) * 100);
  };

  const LAM_TEKNIK_CRITERIA = [
    { id: 'c1', code: 'C.1', name: 'Visi, Misi, Tujuan, dan Strategi',
      subs: ['latar_belakang', 'kebijakan', 'iku', 'analisis', 'strategi'],
      subNames: ['Latar Belakang', 'Kebijakan', 'Indikator Kinerja Utama', 'Analisis Faktor', 'Strategi Perbaikan (SWOT)'] },
    { id: 'c2', code: 'C.2', name: 'Tata Pamong, Tata Kelola, dan Kerja Sama',
      subs: ['latar_belakang', 'kebijakan', 'iku', 'analisis', 'strategi'],
      subNames: ['Latar Belakang', 'Kebijakan', 'Indikator Kinerja Utama', 'Analisis Faktor', 'Strategi Perbaikan (SWOT)'] },
    { id: 'c3', code: 'C.3', name: 'Relevansi Pendidikan, Penelitian, dan PkM',
      subs: ['latar_belakang', 'kebijakan', 'iku', 'analisis', 'strategi'],
      subNames: ['Latar Belakang', 'Kebijakan', 'Indikator Kinerja Utama', 'Analisis Faktor', 'Strategi Perbaikan (SWOT)'] },
    { id: 'c4', code: 'C.4', name: 'Sumber Daya Manusia',
      subs: ['latar_belakang', 'kebijakan', 'iku', 'analisis', 'strategi'],
      subNames: ['Latar Belakang', 'Kebijakan', 'Indikator Kinerja Utama', 'Analisis Faktor', 'Strategi Perbaikan (SWOT)'] },
    { id: 'c5', code: 'C.5', name: 'Sarana, Prasarana, dan K3L',
      subs: ['latar_belakang', 'kebijakan', 'iku', 'analisis', 'strategi'],
      subNames: ['Latar Belakang', 'Kebijakan', 'Indikator Kinerja Utama', 'Analisis Faktor', 'Strategi Perbaikan (SWOT)'] },
    { id: 'c6', code: 'C.6', name: 'Mahasiswa dan Luaran Mahasiswa',
      subs: ['latar_belakang', 'kebijakan', 'iku', 'analisis', 'strategi'],
      subNames: ['Latar Belakang', 'Kebijakan', 'Indikator Kinerja Utama', 'Analisis Faktor', 'Strategi Perbaikan (SWOT)'] },
    { id: 'c7', code: 'C.7', name: 'Sistem Penjaminan Mutu',
      subs: ['latar_belakang', 'kebijakan', 'iku', 'analisis', 'strategi'],
      subNames: ['Latar Belakang', 'Kebijakan', 'Indikator Kinerja Utama', 'Analisis Faktor', 'Strategi Perbaikan (SWOT)'] },
  ];

  const LAM_INFOKOM_CRITERIA = [
    { id: 'c1', code: 'C.1', name: 'Budaya Mutu',
      subs: ['penetapan', 'pelaksanaan', 'evaluasi', 'pengendalian', 'peningkatan'],
      subNames: ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'] },
    { id: 'c2', code: 'C.2', name: 'Relevansi Pendidikan',
      subs: ['penetapan', 'pelaksanaan', 'evaluasi', 'pengendalian', 'peningkatan'],
      subNames: ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'] },
    { id: 'c3', code: 'C.3', name: 'Relevansi Penelitian',
      subs: ['penetapan', 'pelaksanaan', 'evaluasi', 'pengendalian', 'peningkatan'],
      subNames: ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'] },
    { id: 'c4', code: 'C.4', name: 'Relevansi Pengabdian kepada Masyarakat',
      subs: ['penetapan', 'pelaksanaan', 'evaluasi', 'pengendalian', 'peningkatan'],
      subNames: ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'] },
    { id: 'c5', code: 'C.5', name: 'Akuntabilitas',
      subs: ['penetapan', 'pelaksanaan', 'evaluasi', 'pengendalian', 'peningkatan'],
      subNames: ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'] },
    { id: 'c6', code: 'C.6', name: 'Diferensiasi Misi',
      subs: ['penetapan', 'pelaksanaan', 'evaluasi', 'pengendalian', 'peningkatan'],
      subNames: ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'] },
  ];

  const criteriaList = isInfokom ? LAM_INFOKOM_CRITERIA : LAM_TEKNIK_CRITERIA;

  const criteria = criteriaList.map((c) => {
    const subSectionProgress = c.subs.map((sub, idx) => ({
      id: sub,
      name: c.subNames[idx],
      progress: isFilledSection(formContent[`${c.id}_${sub}`]) ? 100 : 0,
    }));
    const filledCount = subSectionProgress.filter((s) => s.progress === 100).length;
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      progress: Math.round((filledCount / c.subs.length) * 100),
      subsections: subSectionProgress,
    };
  });

  const criticalIndicators: Array<{ id: string; name: string; status: string }> = [];

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
    lamTemplate: isInfokom ? 'INFOKOM' : 'LAM_TEKNIK',
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

    const finalStartDate = data.accreditationInfo.startDate !== undefined ? (data.accreditationInfo.startDate ? new Date(data.accreditationInfo.startDate) : null) : existingAccreditation?.startDate;
    const finalEndDate = data.accreditationInfo.endDate !== undefined ? (data.accreditationInfo.endDate ? new Date(data.accreditationInfo.endDate) : null) : existingAccreditation?.endDate;

    if (finalStartDate && finalEndDate && finalStartDate > finalEndDate) {
      throw new Error('Tanggal mulai berlaku tidak boleh melebihi tanggal berakhir');
    }

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
