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
  });
});