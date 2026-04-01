import * as accountService from '../../services/account.service';
import prisma from '../../config/database.config';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

jest.mock('../../config/database.config', () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  prodi: {
    findUnique: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('Account Management Service - Unit Test', () => {
  
  const mockUserData = {
    id: "user-1",
    email: "test@itb.ac.id",
    name: "Test User",
    password: "hashed_password",
    role: Role.SUPER_ADMIN,
    prodiId: "prodi-1"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('harus berhasil membuat akun jika email belum terdaftar', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue({ id: "prodi-1", fullname: "Test Prodi" });
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUserData);

      const result = await accountService.createAccount({
        email: "test@itb.ac.id",
        name: "Test User",
        password: "password123",
        role: Role.SUPER_ADMIN,
        prodiId: "prodi-1"
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@itb.ac.id" } });
      expect(result).toEqual(mockUserData);
    });

    it('harus melempar error jika email sudah terdaftar', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);

      await expect(accountService.createAccount({
        email: "test@itb.ac.id",
        name: "Dosen Lagi",
        password: "pw123",
        role: Role.TIM_PRODI,
        prodiId: "prodi-1"
      })).rejects.toThrow("Email sudah terdaftar dalam sistem");
    });
  });

  describe('getAllAccounts', () => {
    it('harus mengembalikan array user', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUserData]);

      const result = await accountService.getAllAccounts();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].email).toBe(mockUserData.email);
    });
  });

  describe('getAccountById', () => {
    it('harus mengembalikan data user jika ID ditemukan', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);

      const result = await accountService.getAccountById("user-1");

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-1" }
        })
      );
      expect(result).toEqual(mockUserData);
    });

    it('harus melempar error jika ID tidak ditemukan', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(accountService.getAccountById("unknown-id"))
        .rejects.toThrow("Pengguna tidak ditemukan");
    });
  });

  describe('updateAccount', () => {
    it('harus melempar error jika user yang akan diupdate tidak ditemukan', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(accountService.updateAccount("999", { name: "Gagal" }))
        .rejects.toThrow("Pengguna tidak ditemukan");
    });
  });

  describe('deleteAccount', () => {
    it('harus berhasil menghapus jika user ada', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUserData);

      const result = await accountService.deleteAccount("user-1");

      expect(prisma.user.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-1" }
        })
      );
      
      expect(result).toEqual(mockUserData);
    });
  });
});
