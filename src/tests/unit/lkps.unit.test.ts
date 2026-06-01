import * as lkpsService from '../../services/lkps.service';
import prisma from '../../config/database.config';
import { DocumentStatus } from '@prisma/client';

jest.mock('../../config/database.config', () => ({
  documentLKPS: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  prodi: {
    findUnique: jest.fn(),
  },
}));

describe('LKPS Service - Unit Test', () => {
  const mockDocumentData = {
    id: "doc-1",
    prodiId: "prodi-1",
    content: { test: "data" },
    name: "Test LKPS",
    status: DocumentStatus.DRAFT,
    filePath: "/uploads/lkps/test.xlsx",
    originalFilename: "test.xlsx",
    periode: "2024",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProdiData = {
    id: "prodi-1",
    fullname: "Test Prodi",
    abbreviation: "TP",
    degree: "S1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLKPSDocument', () => {
    it('harus berhasil membuat dokumen LKPS', async () => {
      (prisma.documentLKPS.create as jest.Mock).mockResolvedValue(mockDocumentData);

      const result = await lkpsService.createLKPSDocument(
        "prodi-1",
        { test: "data" },
        "Test LKPS",
        "/uploads/lkps/test.xlsx",
        "test.xlsx",
        "2024"
      );

      expect(prisma.documentLKPS.create).toHaveBeenCalledWith({
        data: {
          prodiId: "prodi-1",
          content: { test: "data" },
          name: "Test LKPS",
          status: DocumentStatus.DRAFT,
          filePath: "/uploads/lkps/test.xlsx",
          originalFilename: "test.xlsx",
          periode: "2024",
          versi: 1,
        },
      });
      expect(result).toEqual(mockDocumentData);
    });

    it('harus menggunakan nama default jika tidak disediakan', async () => {
      (prisma.documentLKPS.create as jest.Mock).mockResolvedValue({
        ...mockDocumentData,
        name: "LKPS 2024 - Versi 1"
      });

      await lkpsService.createLKPSDocument("prodi-1", { test: "data" }, undefined, undefined, undefined, "2024");

      expect(prisma.documentLKPS.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "LKPS 2024 - Versi 1",
        }),
      });
    });
  });

  describe('getLKPSHistoryByProdi', () => {
    it('harus mendapatkan riwayat LKPS untuk prodi tertentu', async () => {
      const mockHistory = [mockDocumentData];
      (prisma.documentLKPS.findMany as jest.Mock).mockResolvedValue(mockHistory);

      const result = await lkpsService.getLKPSHistoryByProdi("prodi-1");

      expect(prisma.documentLKPS.findMany).toHaveBeenCalledWith({
        where: { prodiId: "prodi-1" },
        orderBy: { createdAt: 'desc' },
        include: {
          prodi: {
            select: { fullname: true },
          },
        },
      });
      expect(result).toEqual(mockHistory);
    });
  });

  describe('getLKPSDocumentById', () => {
    it('harus mendapatkan dokumen LKPS berdasarkan ID', async () => {
      (prisma.documentLKPS.findUnique as jest.Mock).mockResolvedValue({
        ...mockDocumentData,
        prodi: mockProdiData,
      });

      const result = await lkpsService.getLKPSDocumentById("doc-1");

      expect(prisma.documentLKPS.findUnique).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        include: {
          prodi: true,
          criterias: {
            include: {
              sheets: true,
            },
          },
        },
      });
      expect(result).toEqual({
        ...mockDocumentData,
        prodi: mockProdiData,
      });
    });

    it('harus mengembalikan null jika dokumen tidak ditemukan', async () => {
      (prisma.documentLKPS.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await lkpsService.getLKPSDocumentById("non-existent");

      expect(result).toBeNull();
    });
  });
});