import * as prodiService from '../../services/prodi.service';
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';

jest.mock('../../config/database.config', () => ({
  prodi: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  accreditationInfo: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  documentLKPS: {
    findFirst: jest.fn(),
    orderBy: jest.fn(),
    take: jest.fn(),
  },
  documentLED: {
    findMany: jest.fn().mockResolvedValue([]),
    orderBy: jest.fn(),
    take: jest.fn(),
  },
  ledForm: {
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../services/simulasiskor.service', () => ({
  getSimulationByProdi: jest.fn().mockResolvedValue({
    totalScore: 85,
    indicators: [],
  }),
}));

describe('Prodi Service - Unit Test', () => {
  const mockProdiData = {
    id: "prodi-1",
    fullname: "Test Prodi",
    abbreviation: "TP",
    degree: "S1",
    accreditation: {
      grade: "A",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2029-01-01"),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserData = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: Role.KAPRODI,
    prodiId: "prodi-1",
    prodi: mockProdiData,
    assignments: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProdi', () => {
    it('harus mendapatkan semua program studi', async () => {
      const mockProdis = [mockProdiData];
      (prisma.prodi.findMany as jest.Mock).mockResolvedValue(mockProdis);

      const result = await prodiService.getAllProdi();

      expect(prisma.prodi.findMany).toHaveBeenCalledWith({
        select: expect.any(Object),
        orderBy: { fullname: 'asc' },
      });
      expect(result).toEqual(mockProdis);
    });
  });

  describe('getProdiForUser', () => {
    it('harus mendapatkan semua prodi untuk admin', async () => {
      const adminUser = { ...mockUserData, role: Role.SUPER_ADMIN };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (prisma.prodi.findMany as jest.Mock).mockResolvedValue([mockProdiData]);

      const result = await prodiService.getProdiForUser("user-1");

      expect(result).toEqual([mockProdiData]);
    });

    it('harus mendapatkan prodi untuk kaprodi', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);

      const result = await prodiService.getProdiForUser("user-1");

      expect(result).toEqual([mockProdiData]);
    });

    it('harus gagal jika user tidak ditemukan', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(prodiService.getProdiForUser("non-existent")).rejects.toThrow('Pengguna tidak ditemukan');
    });
  });

  describe('getProdiById', () => {
    it('harus mendapatkan prodi berdasarkan ID', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdiData);

      const result = await prodiService.getProdiById("prodi-1");

      expect(prisma.prodi.findUnique).toHaveBeenCalledWith({
        where: { id: "prodi-1" },
        select: expect.any(Object)
      });
      expect(result).toEqual(mockProdiData);
    });

    it('harus gagal jika prodi tidak ditemukan', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(prodiService.getProdiById("non-existent")).rejects.toThrow('Program studi tidak ditemukan');
    });
  });

  describe('updateProdi', () => {
    it('harus berhasil mengupdate prodi', async () => {
      const updateData = { fullname: "Updated Prodi" };
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValueOnce(mockProdiData);
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValueOnce(null); 
      (prisma.prodi.update as jest.Mock).mockResolvedValue({ ...mockProdiData, ...updateData });

      const result = await prodiService.updateProdi("prodi-1", updateData);

      expect(prisma.prodi.update).toHaveBeenCalledWith({
        where: { id: "prodi-1" },
        data: updateData,
        select: expect.any(Object),
      });
      expect(result.fullname).toBe("Updated Prodi");
    });

    it('harus gagal jika prodi tidak ditemukan', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(prodiService.updateProdi("non-existent", {})).rejects.toThrow('Program studi tidak ditemukan');
    });

    it('harus gagal jika nama sudah digunakan', async () => {
      const updateData = { fullname: "Existing Prodi" };
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValueOnce(mockProdiData);
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValueOnce({ id: "other-prodi" });

      await expect(prodiService.updateProdi("prodi-1", updateData)).rejects.toThrow('Nama program studi sudah digunakan');
    });
  });

  describe('getAccreditation', () => {
    it('harus mendapatkan akreditasi prodi', async () => {
      const mockAccreditation = { grade: "A", startDate: new Date(), endDate: new Date() };
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdiData);
      (prisma.accreditationInfo.findUnique as jest.Mock).mockResolvedValue(mockAccreditation);

      const result = await prodiService.getAccreditation("prodi-1");

      expect(result).toEqual(mockAccreditation);
    });

    it('harus gagal jika prodi tidak ditemukan', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(prodiService.getAccreditation("non-existent")).rejects.toThrow('Program studi tidak ditemukan');
    });
  });

  describe('upsertAccreditation', () => {
    it('harus berhasil upsert akreditasi', async () => {
      const accreditationData = { grade: "A", startDate: "2024-01-01", endDate: "2029-01-01" };
      const mockResult = { prodiId: "prodi-1", ...accreditationData };
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdiData);
      (prisma.accreditationInfo.upsert as jest.Mock).mockResolvedValue(mockResult);

      const result = await prodiService.upsertAccreditation("prodi-1", accreditationData);

      expect(result).toEqual(mockResult);
    });

    it('harus gagal jika prodi tidak ditemukan', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(prodiService.upsertAccreditation("non-existent", {})).rejects.toThrow('Program studi tidak ditemukan');
    });
  });

  describe('getDashboardByProdi', () => {
    it('harus mendapatkan dashboard prodi', async () => {
      const mockProdiWithRelations = {
        ...mockProdiData,
        documentLKPS: [{ status: 'FINAL' }],
        documentLED: [{ status: 'DRAFT' }],
        users: []
      };
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdiWithRelations);

      const result = await prodiService.getDashboardByProdi("prodi-1");

      expect(result.prodi.id).toBe("prodi-1");
      expect(result.documents.lkps.status).toBe('FINAL');
      expect(result.documents.lkps.progress).toBe(100);
      expect(result.documents.led.status).toBe('DRAFT');
      expect(result.documents.led.progress).toBe(50);
    });

    it('harus gagal jika prodi tidak ditemukan', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(prodiService.getDashboardByProdi("non-existent")).rejects.toThrow('Program studi tidak ditemukan');
    });
  });
});