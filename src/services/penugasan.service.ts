import prisma from '../config/database.config';
import { Role } from '@prisma/client';
import { CreatePenugasanInput } from '../validators/penugasan.validator';

const assignmentSelect = {
  id: true,
  userId: true,
  prodiId: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true, role: true } },
  prodi: { select: { id: true, fullname: true } },
};

export const getAllPenugasan = async (prodiId?: string) => {
  return prisma.prodiAssignment.findMany({
    where: { prodiId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createPenugasan = async (data: CreatePenugasanInput) => {
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) throw new Error('Pengguna tidak ditemukan');
  if (user.role !== Role.TIM_PRODI && user.role !== Role.KAPRODI) {
    throw new Error('Pengguna harus memiliki role TIM_PRODI atau KAPRODI');
  }

  const prodi = await prisma.prodi.findUnique({ where: { id: data.prodiId } });
  if (!prodi) throw new Error('Program studi tidak ditemukan');

  const existing = await prisma.prodiAssignment.findUnique({
    where: { userId_prodiId: { userId: data.userId, prodiId: data.prodiId } },
  });
  if (existing) throw new Error('Penugasan sudah ada untuk pengguna dan program studi ini');

  return prisma.prodiAssignment.create({
    data: { userId: data.userId, prodiId: data.prodiId },
    select: assignmentSelect,
  });
};

export const deletePenugasan = async (id: string) => {
  const existing = await prisma.prodiAssignment.findUnique({ where: { id } });
  if (!existing) throw new Error('Penugasan tidak ditemukan');
  return prisma.prodiAssignment.delete({ where: { id }, select: assignmentSelect });
};