import prisma from '../config/database.config';
import { UpdateProdiInput, UpsertAccreditationInput } from '../validators/prodi.validator';

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