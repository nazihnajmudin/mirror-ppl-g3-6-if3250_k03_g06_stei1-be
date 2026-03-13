import * as authService from '../../services/auth.service';
import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service - Unit Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRES_IN = '2d';
  });

  describe('login()', () => {
    it('harus mengirim eror jika user tidak ditemukan', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.login({ email: 'test@itb.ac.id', password: '123' }))
        .rejects.toThrow('Email atau password salah');
    });

    it('harus mengirim eror jika akun tidak aktif', async () => {
      const mockUserInactive = { 
        id: 1,
        email: 'test_account@itb.ac.id', 
        name: 'Test User',
        password: 'password123',
        role: 'DOSEN', 
        isActive: false, 
        prodiId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUserInactive as any);

      await expect(authService.login({ email: 'test@itb.ac.id', password: '123' }))
        .rejects.toThrow('Akun Anda dinonaktifkan');
    });

    it('harus mengembalikan user dan token jika berhasil', async () => {
      const mockUserActive = { 
        id: 1,
        email: 'test@itb.ac.id', 
        name: 'Test User',
        password: 'hashedPassword',
        role: 'DOSEN' as any,
        isActive: true, 
        prodiId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUserActive as any);
      jest.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true));
      jest.mocked(jwt.sign).mockImplementation(() => 'mocked_token');

      const result = await authService.login({ email: 'test@itb.ac.id', password: '123' });

      expect(result).toHaveProperty('token', 'mocked_token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@itb.ac.id');
    });
  });
});