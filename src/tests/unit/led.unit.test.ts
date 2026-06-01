import * as ledService from '../../services/led.service';
import prisma from '../../config/database.config';
import { storageProvider } from '../../utils/storage';
import { generateLEDFormDocxBuffer, buildLEDFormFilename } from '../../exporters/ledForm.exporter';
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
  ledForm: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
}));

jest.mock('../../utils/storage', () => ({
  storageProvider: {
    upload: jest.fn(),
    getFilePath: jest.fn(),
  },
}));

jest.mock('../../exporters/ledForm.exporter', () => ({
  generateLEDFormDocxBuffer: jest.fn(),
  buildLEDFormFilename: jest.fn(),
}));

describe('LED Service Unit Tests', () => {
  const mockProdi = { id: 'prodi-123', fullname: 'Teknik Informatika' };
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

  const mockLEDForm = {
    id: 'led-form-abc',
    prodiId: 'prodi-123',
    template: 'INFOKOM',
    periode: '2026',
    content: { sectionA: 'Data A' },
    createdById: 'user-123',
    prodi: { fullname: 'Teknik Informatika' },
    createdBy: { name: 'Dosen', email: 'dosen@example.com' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importLED', () => {
    it('harus berhasil mengunggah LED dan membuat catatan dengan versi 1', async () => {
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

    it('harus meningkatkan versi jika dokumen sebelumnya ada', async () => {
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

    it('harus melempar error jika program studi tidak ditemukan', async () => {
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
    it('harus mengembalikan path file untuk dokumen terbaru', async () => {
      (prisma.documentLED.findFirst as jest.Mock).mockResolvedValue(mockLEDDoc);
      (storageProvider.getFilePath as jest.Mock).mockReturnValue('/full/path/led_v1.pdf');

      const result = await ledService.exportLED('prodi-123', '2026');

      expect(result.filePath).toBe('/full/path/led_v1.pdf');
      expect(result.dokumen.versi).toBe(1);
    });

    it('harus melempar error jika dokumen tidak ditemukan untuk periode tertentu', async () => {
      (prisma.documentLED.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(ledService.exportLED('prodi-123', '2099'))
        .rejects.toThrow('Dokumen LED untuk periode 2099 belum tersedia.');
    });
  });

  describe('getAvailablePeriods', () => {
    it('harus menggabungkan periode unik dari dokumen dan informasi akreditasi', async () => {
      (prisma.documentLED.findMany as jest.Mock).mockResolvedValue([
        { periode: '2021' },
        { periode: '2022' }
      ]);
      (prisma.accreditationInfo.findUnique as jest.Mock).mockResolvedValue({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31')
      });

      const result = await ledService.getAvailablePeriods('prodi-123');

      expect(result).toEqual(['2021', '2022', '2025']);
      expect(result).toHaveLength(3);
    });

    it('harus tetap bekerja jika informasi akreditasi tidak tersedia', async () => {
      (prisma.documentLED.findMany as jest.Mock).mockResolvedValue([{ periode: '2021' }]);
      (prisma.accreditationInfo.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await ledService.getAvailablePeriods('prodi-123');

      expect(result).toEqual(['2021']);
    });
  });

  describe('createLEDFormVersion', () => {
    it('harus berhasil membuat versi LED form baru', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(mockProdi);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      ((prisma as any).ledForm.create as jest.Mock).mockResolvedValue(mockLEDForm);

      const result = await ledService.createLEDFormVersion({
        prodiId: 'prodi-123',
        template: 'INFOKOM',
        periode: '2026',
        content: { sectionA: 'Data A' },
        createdById: 'user-123',
      });

      expect((prisma as any).ledForm.create).toHaveBeenCalledWith({
        data: {
          prodiId: 'prodi-123',
          template: 'INFOKOM',
          periode: '2026',
          content: { sectionA: 'Data A' },
          createdById: 'user-123',
        },
        include: {
          prodi: { select: { fullname: true } },
          createdBy: { select: { name: true, email: true } },
        },
      });
      expect(result).toEqual(mockLEDForm);
    });

    it('harus melempar error jika prodi tidak ditemukan', async () => {
      (prisma.prodi.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(ledService.createLEDFormVersion({
        prodiId: 'invalid',
        template: 'INFOKOM',
        periode: '2026',
        content: {},
        createdById: 'user-123',
      })).rejects.toThrow('Program studi tidak ditemukan');
    });
  });

  describe('getLEDFormHistory', () => {
    it('harus mengembalikan riwayat LED form untuk prodi dan periode tertentu', async () => {
      const mockHistory = [mockLEDForm];
      ((prisma as any).ledForm.findMany as jest.Mock).mockResolvedValue(mockHistory);

      const result = await ledService.getLEDFormHistory('prodi-123', '2026');

      expect((prisma as any).ledForm.findMany).toHaveBeenCalledWith({
        where: { prodiId: 'prodi-123', periode: '2026' },
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, email: true } } },
      });
      expect(result).toEqual(mockHistory);
    });

    it('harus memfilter berdasarkan template jika diberikan', async () => {
      const mockHistory = [mockLEDForm];
      ((prisma as any).ledForm.findMany as jest.Mock).mockResolvedValue(mockHistory);

      const result = await ledService.getLEDFormHistory('prodi-123', '2026', 'INFOKOM');

      expect((prisma as any).ledForm.findMany).toHaveBeenCalledWith({
        where: { prodiId: 'prodi-123', periode: '2026', template: 'INFOKOM' },
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, email: true } } },
      });
      expect(result).toEqual(mockHistory);
    });
  });

  describe('getLEDFormVersionById', () => {
    it('harus mengembalikan versi LED form berdasarkan ID', async () => {
      ((prisma as any).ledForm.findUnique as jest.Mock).mockResolvedValue(mockLEDForm);

      const result = await ledService.getLEDFormVersionById('form-123');

      expect((prisma as any).ledForm.findUnique).toHaveBeenCalledWith({
        where: { id: 'form-123' },
        include: {
          prodi: { select: { fullname: true } },
          createdBy: { select: { name: true, email: true } },
        },
      });
      expect(result).toEqual(mockLEDForm);
    });
  });

  describe('getLatestLEDFormVersion', () => {
    it('harus mengembalikan versi LED form terbaru untuk prodi', async () => {
      ((prisma as any).ledForm.findFirst as jest.Mock).mockResolvedValue(mockLEDForm);

      const result = await ledService.getLatestLEDFormVersion('prodi-123');

      expect((prisma as any).ledForm.findFirst).toHaveBeenCalledWith({
        where: { prodiId: 'prodi-123' },
        orderBy: { createdAt: 'desc' },
        include: {
          prodi: { select: { fullname: true } },
          createdBy: { select: { name: true, email: true } },
        },
      });
      expect(result).toEqual(mockLEDForm);
    });

    it('harus memfilter berdasarkan periode dan template jika diberikan', async () => {
      ((prisma as any).ledForm.findFirst as jest.Mock).mockResolvedValue(mockLEDForm);

      const result = await ledService.getLatestLEDFormVersion('prodi-123', '2026', 'INFOKOM');

      expect((prisma as any).ledForm.findFirst).toHaveBeenCalledWith({
        where: { prodiId: 'prodi-123', periode: '2026', template: 'INFOKOM' },
        orderBy: { createdAt: 'desc' },
        include: {
          prodi: { select: { fullname: true } },
          createdBy: { select: { name: true, email: true } },
        },
      });
      expect(result).toEqual(mockLEDForm);
    });
  });

  describe('exportLEDForm', () => {
    it('harus mengekspor LED form berdasarkan ID versi', async () => {
      ((prisma as any).ledForm.findUnique as jest.Mock).mockResolvedValue(mockLEDForm);
      ((prisma as any).ledForm.findMany as jest.Mock).mockResolvedValue([{ id: 'form-123' }]);
      (generateLEDFormDocxBuffer as jest.Mock).mockResolvedValue(Buffer.from('docx content'));
      (buildLEDFormFilename as jest.Mock).mockReturnValue('LED_Teknik Informatika_V1_2026.docx');

      const result = await ledService.exportLEDForm('form-123');

      expect(result).toEqual({
        buffer: Buffer.from('docx content'),
        filename: 'LED_Teknik Informatika_V1_2026.docx',
      });
    });

    it('harus menggunakan versi terbaru jika ID tidak ditemukan', async () => {
      ((prisma as any).ledForm.findUnique as jest.Mock).mockResolvedValue(null);
      ((prisma as any).ledForm.findFirst as jest.Mock).mockResolvedValue(mockLEDForm);
      ((prisma as any).ledForm.findMany as jest.Mock).mockResolvedValue([{ id: 'form-123' }]);
      (generateLEDFormDocxBuffer as jest.Mock).mockResolvedValue(Buffer.from('docx content'));
      (buildLEDFormFilename as jest.Mock).mockReturnValue('LED_Teknik Informatika_V1_2026.docx');

      const result = await ledService.exportLEDForm('invalid-id');

      expect(result).toEqual({
        buffer: Buffer.from('docx content'),
        filename: 'LED_Teknik Informatika_V1_2026.docx',
      });
    });

    it('harus melempar error jika tidak ada versi yang ditemukan', async () => {
      ((prisma as any).ledForm.findUnique as jest.Mock).mockResolvedValue(null);
      ((prisma as any).ledForm.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(ledService.exportLEDForm('invalid-id')).rejects.toThrow('Dokumen LED form belum tersedia untuk prodi atau versi yang diminta.');
    });
  });
});