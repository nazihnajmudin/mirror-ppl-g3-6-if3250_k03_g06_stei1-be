import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 10;

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  prodiId: true,
  prodi: { select: { id: true, nama: true } },
  createdAt: true,
  updatedAt: true,
};

export const getAllAccounts = async () => {
  return prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
};

export const getAccountById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new Error('Pengguna tidak ditemukan');
  return user;
};

export const createAccount = async (data: {
  email: string;
  name: string;
  password?: string;
  role: Role;
  prodiId?: number | null;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email sudah terdaftar');

  const hashedPassword = data.password ? await bcrypt.hash(data.password, SALT_ROUNDS) : null;

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

export const updateAccount = async (
  id: number,
  data: { name?: string; role?: Role; isActive?: boolean; prodiId?: number | null }
) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error('Pengguna tidak ditemukan');
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
};

export const deleteAccount = async (id: number) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error('Pengguna tidak ditemukan');
  return prisma.user.delete({ where: { id }, select: userSelect });
};