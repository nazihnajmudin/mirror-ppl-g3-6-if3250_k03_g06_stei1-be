import bcrypt from 'bcryptjs';
import prisma from '../config/database.config';
import { Role, Prisma } from '@prisma/client';
import { CreateAccountInput, UpdateAccountInput } from '../validators/account.validator';

// Number of salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

// Helper function to determine if a role requires an associated prodiId
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

// Get all accounts with optional filters
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

// Get a single account by Id
export const getAccountById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new Error('Pengguna tidak ditemukan');
  return user;
};

// get a single account by email
export const getAccountByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email }, select: userSelect });
};

// Create a new account
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

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role,
      prodiId: data.prodiId ?? null,
    },
    select: userSelect,
  });
};

// Update an existing account
export const updateAccount = async ( id: string, data: UpdateAccountInput) => {
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

// Deactivate an account (soft delete)
export const deactivateAccount = async (id: string) => {
  await getAccountById(id);
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: userSelect,
  });
};

// Activate an account
export const activateAccount = async (id: string) => {
  await getAccountById(id);
  return prisma.user.update({
    where: { id },
    data: { isActive: true },
    select: userSelect,
  });
};

// Permanently delete an account
export const deleteAccount = async (id: string) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error('Pengguna tidak ditemukan');
  return prisma.user.delete({ where: { id }, select: userSelect });
};

// Get prodi options for dropdowns
export const getProdiOptions = async () => {
  return prisma.prodi.findMany({
    select: {
      id: true,
      fullname: true,
      abbreviation: true,
      degree: true,
    },
    orderBy: { fullname: 'asc' },
  });
};
