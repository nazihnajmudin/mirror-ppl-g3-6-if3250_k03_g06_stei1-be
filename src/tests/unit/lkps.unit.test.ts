import ExcelJS from 'exceljs';
import prisma from '../../config/database.config';
import * as lkpsService from '../../services/lkps.service';
import { DocumentType, DocumentStatus } from '@prisma/client';
import { Role } from '@prisma/client';

jest.mock('../../config/database.config', () => ({
  document: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

describe('LKPS Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLKPSById', () => {
    it('harus mengembalikan dokumen jika ditemukan', async () => {
      const doc = {
        id: 'doc-1',
        prodiId: 'prodi-1',
        name: 'LKPS 2024',
        type: DocumentType.LKPS,
        status: DocumentStatus.DRAFT,
        content: { table_2_1: [] },
      };
      (prisma.document.findUnique as jest.Mock).mockResolvedValue(doc);

      const result = await lkpsService.getLKPSById('doc-1');
      expect(result).toBe(doc);
      expect(prisma.document.findUnique).toHaveBeenCalledWith({
        where: { id: 'doc-1', type: DocumentType.LKPS },
      });
    });

    it('harus mengembalikan error ketika tidak ditemukan', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(lkpsService.getLKPSById('unknown')).rejects.toThrow('Dokumen LKPS tidak ditemukan');
    });
  });

  describe('importLKPS', () => {
    it('harus mengurai Excel dan membuat dokumen', async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('2a1');

      for (let i = 1; i <= 12; i += 1) {
        sheet.addRow([]);
      }
      sheet.addRow([1, 'ITB', 'V', '', '', 'Kegiatan A', 'Manfaat A', '2024-01-01', '2024-12-31', '12 bulan']);

      const buffer = await workbook.xlsx.writeBuffer();

      const created = {
        id: 'doc-2',
        prodiId: 'prodi-2',
        type: DocumentType.LKPS,
        status: DocumentStatus.DRAFT,
        content: { table_2_1: [{ no: 1, lembagaMitra: 'Universitas XYZ' }] },
      };
      (prisma.document.create as jest.Mock).mockResolvedValue(created);

      const result = await lkpsService.importLKPS(buffer, 'prodi-2');

      expect(prisma.document.create).toHaveBeenCalled();
      expect(result).toBe(created);
      expect(result.content.table_2_1[0].lembagaMitra).toBe('Universitas XYZ');
    });
  });
});
