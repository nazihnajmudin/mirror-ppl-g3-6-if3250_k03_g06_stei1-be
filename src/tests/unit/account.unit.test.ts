import * as accountService from '../../services/account.service';
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';

jest.mock('../../config/database.config', () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  prodi: {
    findUnique: jest.fn(),
  },
}));

describe('Account Service Unit Tests', () => {
  const mockUser = {
    id: 'user-1',
    email: 'admin@itb.ac.id',
    name: 'Admin ITB',
    role: Role.SUPER_ADMIN,
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAccounts', () => {
    it('should return all accounts', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
      const result = await accountService.getAllAccounts();
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe(mockUser.email);
    });
  });

  describe('createAccount', () => {
    it('should create a new account', async () => {
      const newUserData = {
        name: 'Tim Prodi',
        email: 'tim@itb.ac.id',
        role: Role.TIM_PRODI,
        prodiId: 'prodi-123',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue({ id: 'prodi-123', fullname: 'Informatika' });
      (prisma.user.create as jest.Mock).mockResolvedValue({ ...newUserData, id: 'user-2', isActive: true });

      const result = await accountService.createAccount(newUserData as any);
      expect(result.email).toBe(newUserData.email);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });
});