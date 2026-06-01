import * as penugasanService from '../../services/penugasan.service';
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';

jest.mock('../../config/database.config', () => ({
  prodiAssignment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  prodi: {
    findUnique: jest.fn(),
  },
}));

describe('Penugasan Service - Unit Test', () => {
  const mockAssignmentData = {
    id: "assignment-1",
    userId: "user-1",
    prodiId: "prodi-1",
    createdAt: new Date(),
    user: {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: Role.TIM_PRODI
    },
    prodi: {
      id: "prodi-1",
      fullname: "Test Prodi"
    }
  };

  const mockUserData = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: Role.TIM_PRODI,
    prodiId: "prodi-1"
  };

  const mockProdiData = {
    id: "prodi-1",
    fullname: "Test Prodi",
    abbreviation: "TP",
    degree: "S1"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPenugasan', () => {
    it('harus mendapatkan semua penugasan', async () => {
      const mockAssignments = [mockAssignmentData];
      (prisma.prodiAssignment.findMany as jest.Mock).mockResolvedValue(mockAssignments);

      const result = await penugasanService.getAllPenugasan();

      expect(prisma.prodiAssignment.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockAssignments);
    });

    it('harus mendapatkan penugasan berdasarkan prodiId', async () => {
      const mockAssignments = [mockAssignmentData];
      (prisma.prodiAssignment.findMany as jest.Mock).mockResolvedValue(mockAssignments);

      const result = await penugasanService.getAllPenugasan("prodi-1");

      expect(prisma.prodiAssignment.findMany).toHaveBeenCalledWith({
        where: { prodiId: "prodi-1" },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockAssignments);
    });
  });

  describe('createPenugasan', () => {
    it('harus berhasil membuat penugasan baru', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdiData);
      (prisma.prodiAssignment.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.prodiAssignment.create as jest.Mock).mockResolvedValue(mockAssignmentData);

      const result = await penugasanService.createPenugasan({
        userId: "user-1",
        prodiId: "prodi-1"
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
      expect(prisma.prodi.findUnique).toHaveBeenCalledWith({ where: { id: "prodi-1" } });
      expect(prisma.prodiAssignment.findUnique).toHaveBeenCalledWith({
        where: { userId_prodiId: { userId: "user-1", prodiId: "prodi-1" } }
      });
      expect(prisma.prodiAssignment.create).toHaveBeenCalledWith({
        data: { userId: "user-1", prodiId: "prodi-1", kriteria: [] },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockAssignmentData);
    });

    it('harus gagal jika user tidak ditemukan', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(penugasanService.createPenugasan({
        userId: "non-existent",
        prodiId: "prodi-1"
      })).rejects.toThrow('Pengguna tidak ditemukan');
    });

    it('harus gagal jika user tidak memiliki role yang valid', async () => {
      const invalidUser = { ...mockUserData, role: Role.SUPER_ADMIN };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(invalidUser);

      await expect(penugasanService.createPenugasan({
        userId: "user-1",
        prodiId: "prodi-1"
      })).rejects.toThrow('Pengguna harus memiliki role TIM_PRODI atau KAPRODI');
    });

    it('harus gagal jika prodi tidak ditemukan', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(penugasanService.createPenugasan({
        userId: "user-1",
        prodiId: "non-existent"
      })).rejects.toThrow('Program studi tidak ditemukan');
    });

    it('harus gagal jika penugasan sudah ada', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdiData);
      (prisma.prodiAssignment.findUnique as jest.Mock).mockResolvedValue(mockAssignmentData);

      await expect(penugasanService.createPenugasan({
        userId: "user-1",
        prodiId: "prodi-1"
      })).rejects.toThrow('Penugasan sudah ada untuk pengguna dan program studi ini');
    });
  });

  describe('deletePenugasan', () => {
    it('harus berhasil menghapus penugasan', async () => {
      (prisma.prodiAssignment.findUnique as jest.Mock).mockResolvedValue(mockAssignmentData);
      (prisma.prodiAssignment.delete as jest.Mock).mockResolvedValue(mockAssignmentData);

      const result = await penugasanService.deletePenugasan("assignment-1");

      expect(prisma.prodiAssignment.findUnique).toHaveBeenCalledWith({ where: { id: "assignment-1" } });
      expect(prisma.prodiAssignment.delete).toHaveBeenCalledWith({
        where: { id: "assignment-1" },
        select: expect.any(Object)
      });
      expect(result).toEqual(mockAssignmentData);
    });

    it('harus gagal jika penugasan tidak ditemukan', async () => {
      (prisma.prodiAssignment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(penugasanService.deletePenugasan("non-existent")).rejects.toThrow('Penugasan tidak ditemukan');
    });
  });
});