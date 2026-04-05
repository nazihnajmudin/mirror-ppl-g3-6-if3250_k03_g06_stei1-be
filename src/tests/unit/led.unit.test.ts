import * as ledService from '../../services/led.service';
import prisma from '../../config/database.config';
import { storageProvider } from '../../utils/storage';
import { DocumentStatus } from '@prisma/client';

jest.mock('../../config/database.config', () => ({
  prodi: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  documentLED: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  accreditationInfo: {
    findUnique: jest.fn(),
  },
}));

jest.mock('../../utils/storage', () => ({
  storageProvider: {
    upload: jest.fn(),
    getFilePath: jest.fn(),
  },
}));

describe('LED Service Unit Tests', () => {
  const mockProdi = { id: 'prodi-123', fullname: 'Teknik Komputer' };
  const mockUser = { id: 'user-123', name: 'Dosen Penguji' };
  const mockFile = {
    originalname: 'led_v1.pdf',
    size: 2048,
    buffer: Buffer.from('dummy'),
  } as Express.Multer.File;

  const mockLEDDoc = {
    id: 'led-abc',
    name: 'led_v1.pdf',
    content: 'led/stored-file-name.pdf',
    versi: 1,
    periode: '2026',
    prodiId: 'prodi-123',
    pengunggahId: 'user-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importLED', () => {
    it('should successfully upload LED and create record with version 1', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdi);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.documentLED.findFirst as jest.Mock).mockResolvedValue(null);
      (storageProvider.upload as jest.Mock).mockResolvedValue('stored-file-name.pdf');
      (prisma.documentLED.create as jest.Mock).mockResolvedValue(mockLEDDoc);

      const result = await ledService.importLED({
        prodiId: 'prodi-123',
        pengunggahId: 'user-123',
        periode: '2026',
        file: mockFile,
      });

      expect(prisma.documentLED.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ versi: 1 })
      }));
      expect(result.versi).toBe(1);
    });

    it('should increment version if previous document exists', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdi);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.documentLED.findFirst as jest.Mock).mockResolvedValue({ versi: 2 });
      (storageProvider.upload as jest.Mock).mockResolvedValue('stored-file-v3.pdf');

      await ledService.importLED({
        prodiId: 'prodi-123',
        pengunggahId: 'user-123',
        periode: '2026',
        file: mockFile,
      });

      expect(prisma.documentLED.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ versi: 3 })
      }));
    });

    it('should throw error if prodi is not found', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(ledService.importLED({
        prodiId: 'invalid',
        pengunggahId: 'user-123',
        periode: '2026',
        file: mockFile,
      })).rejects.toThrow('Program studi tidak ditemukan');
    });
  });

  describe('exportLED', () => {
    it('should return file path for the latest document', async () => {
      (prisma.documentLED.findFirst as jest.Mock).mockResolvedValue(mockLEDDoc);
      (storageProvider.getFilePath as jest.Mock).mockReturnValue('/full/path/led_v1.pdf');

      const result = await ledService.exportLED('prodi-123', '2026');

      expect(result.filePath).toBe('/full/path/led_v1.pdf');
      expect(result.dokumen.versi).toBe(1);
    });

    it('should throw error if no document found for the period', async () => {
      (prisma.documentLED.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(ledService.exportLED('prodi-123', '2099'))
        .rejects.toThrow('Dokumen LED untuk periode 2099 belum tersedia.');
    });
  });

  describe('getAvailablePeriods', () => {
    it('should merge unique periods from documents and accreditation info', async () => {
      (prisma.documentLED.findMany as jest.Mock).mockResolvedValue([
        { periode: '2021' },
        { periode: '2022' }
      ]);
      (prisma.accreditationInfo.findUnique as jest.Mock).mockResolvedValue({
        endDate: new Date('2025-12-31')
      });

      const result = await ledService.getAvailablePeriods('prodi-123');

      expect(result).toEqual(['2021', '2022', '2025']);
      expect(result).toHaveLength(3);
    });

    it('should still work if accreditation info is missing', async () => {
      (prisma.documentLED.findMany as jest.Mock).mockResolvedValue([{ periode: '2021' }]);
      (prisma.accreditationInfo.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await ledService.getAvailablePeriods('prodi-123');

      expect(result).toEqual(['2021']);
    });
  });
});