import * as authService from '../../services/auth.service';
import prisma from '../../config/database.config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

jest.mock('../../config/database.config', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('Auth Service Unit Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: Role.TIM_PRODI,
    isActive: true,
    prodiId: 'prodi-456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('register', () => {
    it('should create a new user and return token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const result = await authService.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: Role.TIM_PRODI,
        prodiId: 'prodi-456',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mockToken');
    });

    it('should throw error if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: Role.TIM_PRODI,
        prodiId: 'prodi-456',
      })).rejects.toThrow('Email sudah terdaftar');
    });
  });

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mockToken');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login({
        email: 'notfound@example.com',
        password: 'password123',
      })).rejects.toThrow('Email atau password salah');
    });

    it('should throw error if password is incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('Email atau password salah');
    });

    it('should throw error if account is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveUser);

      await expect(authService.login({
        email: 'test@example.com',
        password: 'password123',
      })).rejects.toThrow('Akun Anda dinonaktifkan');
    });
  });
});
