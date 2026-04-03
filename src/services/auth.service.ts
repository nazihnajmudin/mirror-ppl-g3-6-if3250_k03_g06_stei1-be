import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.config';
import { Role } from '@prisma/client';
import { JwtPayload } from '../middlewares/auth.middleware';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
  role: Role;
  prodiId?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

const signToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET tidak dikonfigurasi');
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error('Email sudah terdaftar');
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword,
      role: input.role,
      prodiId: input.prodiId ?? null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      prodiId: true,
      createdAt: true,
    },
  });
  const token = signToken({ userId: user.id, name: user.name, email: user.email, role: user.role, prodiId: user.prodiId });
  return { user, token };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new Error('Email atau password salah');
  if (!user.isActive) throw new Error('Akun Anda dinonaktifkan. Hubungi Administrator.');
  if (!user.password) throw new Error('Akun ini tidak menggunakan login password. Gunakan SSO ITB.');
  
  const valid = await bcrypt.compare(input.password, user.password);
  
  if (!valid) throw new Error('Email atau password salah');
  
  const token = signToken({ userId: user.id, name: user.name, email: user.email, role: user.role, prodiId: user.prodiId });
  const { password: _pw, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};