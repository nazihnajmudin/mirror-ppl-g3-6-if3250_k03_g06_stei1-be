import * as accountService from '../../services/account.service';
import prisma from '../../config/database';
import bcrypt from 'bcryptjs';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs');

const prismaMock = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  }
};

describe('Account Management Service - Unit Test', () => {
  
  const mockUserData = {
    id: 1,
    email: "test@itb.ac.id",
    name: "Test User",
    password: "hashed_password",
    role: "ADMIN_INSTITUSI",
    prodiId: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('harus berhasil membuat akun jika email belum terdaftar', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      prismaMock.user.create.mockResolvedValue(mockUserData);

      const result = await accountService.createAccount({
        email: "test@itb.ac.id",
        name: "Test User",
        password: "password123",
        role: "ADMIN_INSTITUSI",
        prodiId: 1
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@itb.ac.id" } });
      expect(result).toEqual(mockUserData);
    });

    it('harus melempar error jika email sudah terdaftar', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserData);

      await expect(accountService.createAccount({
        email: "test@itb.ac.id",
        name: "Dosen Lagi",
        password: "pw123",
        role: "DOSEN",
        prodiId: 1
      })).rejects.toThrow("Email sudah terdaftar");
    });
  });

  describe('getAllAccounts', () => {
    it('harus mengembalikan array user', async () => {
      prismaMock.user.findMany.mockResolvedValue([mockUserData]);

      const result = await accountService.getAllAccounts();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].email).toBe(mockUserData.email);
    });
  });

  describe('getAccountById', () => {
    it('harus mengembalikan data user jika ID ditemukan', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserData);

      const result = await accountService.getAccountById(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 }
        })
      );
      expect(result).toEqual(mockUserData);
    });

    it('harus melempar error jika ID tidak ditemukan', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(accountService.getAccountById(6767))
        .rejects.toThrow("Pengguna tidak ditemukan");
    });
  });

  describe('updateAccount', () => {
    it('harus melempar error jika user yang akan diupdate tidak ditemukan', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(accountService.updateAccount(999, { name: "Gagal" }))
        .rejects.toThrow("Pengguna tidak ditemukan");
    });
  });

  describe('deleteAccount', () => {
    it('harus berhasil menghapus jika user ada', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserData);
      prismaMock.user.delete.mockResolvedValue(mockUserData);

      const result = await accountService.deleteAccount(1);

      expect(prisma.user.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 }
        })
      );
      
      expect(result).toEqual(mockUserData);
    });
  });
});