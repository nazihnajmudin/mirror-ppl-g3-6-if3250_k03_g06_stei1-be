import bcrypt from 'bcryptjs';
import prisma from '../config/database.config';
import { Role, Prisma } from '@prisma/client';
import { CreateAccountInput, UpdateAccountInput } from '../validators/account.validator';

const SALT_ROUNDS = 10;

const requiresProdiRole = (role: Role): boolean => {
  return role === Role.TIM_PRODI || role === Role.KAPRODI;
};

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  prodiId: true,
  prodi: { select: { id: true, fullname: true } },
  createdAt: true,
  updatedAt: true,
};

export const getAllAccounts = async (filters?: {
  role?: Role;
  prodiId?: string;
  isActive?: boolean;
}) => {
  const where: Prisma.UserWhereInput = {
    ...(filters?.role && { role: filters.role }),
    ...(filters?.prodiId !== undefined && { prodiId: filters.prodiId }),
    ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
  };

  return prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  });
};

export const getAccountById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new Error('Pengguna tidak ditemukan');
  return user;
};

export const getAccountByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email }, select: userSelect });
};

export const createAccount = async (data: CreateAccountInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email sudah terdaftar dalam sistem');

  const requiresProdi = requiresProdiRole(data.role);
  if (requiresProdi && !data.prodiId) {
    throw new Error('ProdiId wajib diisi untuk role ini');
  }

  if (data.prodiId) {
    const prodi = await prisma.prodi.findUnique({ where: { id: data.prodiId } });
    if (!prodi) throw new Error('Program studi tidak ditemukan');
  }

  const hashedPassword = data.password ? await bcrypt.hash(data.password, SALT_ROUNDS) : null;

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword ?? '',
      role: data.role,
      prodiId: data.prodiId ?? null,
    },
    select: userSelect,
  });
};

export const updateAccount = async (
  id: string,
  data: UpdateAccountInput
) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error('Pengguna tidak ditemukan');

  if (data.prodiId) {
    const prodi = await prisma.prodi.findUnique({ where: { id: data.prodiId } });
    if (!prodi) throw new Error('Program studi tidak ditemukan');
  }

  const effectiveRole = data.role ?? existing.role;
  const effectiveProdiId = data.prodiId === undefined ? existing.prodiId : data.prodiId;
  const requiresProdi = requiresProdiRole(effectiveRole);
  if (requiresProdi && !effectiveProdiId) {
    throw new Error('ProdiId wajib diisi untuk role ini');
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...data,
      prodiId: data.prodiId === undefined ? undefined : (data.prodiId ?? null),
    },
    select: userSelect,
  });
};

export const deactivateAccount = async (id: string) => {
  await getAccountById(id);
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: userSelect,
  });
};

export const activateAccount = async (id: string) => {
  await getAccountById(id);
  return prisma.user.update({
    where: { id },
    data: { isActive: true },
    select: userSelect,
  });
};

export const deleteAccount = async (id: string) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error('Pengguna tidak ditemukan');
  return prisma.user.delete({ where: { id }, select: userSelect });
};