import * as institusiService from '../../services/institusi.service';
import prisma from '../../config/database.config';

jest.mock('../../config/database.config', () => ({
  dataInstitusi: {
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  lKPSSheetData: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
}));

describe('Institusi Service - Unit Test', () => {
  const mockUserId = "admin-123";
  const mockPeriode = "2025/2026";
  const mockSheetName = "2b";
  
  const mockPayloadData = [
    { no: 1, upps_ts: 100, upps_ts_minus1: 50 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDataInstitusi', () => {
    it('harus berhasil mengambil data pusat berdasarkan periode', async () => {
      const mockResult = [{ id: "1", periode: mockPeriode, sheetName: mockSheetName, data: mockPayloadData }];
      (prisma.dataInstitusi.findMany as jest.Mock).mockResolvedValue(mockResult);

      const result = await institusiService.getDataInstitusi(mockPeriode, mockSheetName);

      expect(prisma.dataInstitusi.findMany).toHaveBeenCalledWith({
        where: { periode: mockPeriode, sheetName: mockSheetName }
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('upsertAndSyncInstitusi', () => {
    it('harus menyimpan data institusi dan melakukan sinkronisasi parsial ke prodi', async () => {
      const mockUpsertResult = { id: "master-1", periode: mockPeriode, sheetName: mockSheetName, data: mockPayloadData };
      (prisma.dataInstitusi.upsert as jest.Mock).mockResolvedValue(mockUpsertResult);

      const mockExistingProdiSheets = [
        { 
          id: "sheet-prodi-1", 
          data: [{ no: 1, ps_ts: 999 }]
        }
      ];
      (prisma.lKPSSheetData.findMany as jest.Mock).mockResolvedValue(mockExistingProdiSheets);

      (prisma.lKPSSheetData.update as jest.Mock).mockResolvedValue(true);

      const result = await institusiService.upsertAndSyncInstitusi(mockPeriode, mockSheetName, mockPayloadData, mockUserId);

      expect(prisma.dataInstitusi.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { periode_sheetName: { periode: mockPeriode, sheetName: mockSheetName } }
      }));

      expect(prisma.lKPSSheetData.update).toHaveBeenCalledWith({
        where: { id: "sheet-prodi-1" },
        data: {
          data: [{ no: 1, ps_ts: 999, upps_ts: 100, upps_ts_minus1: 50 }]
        }
      });

      expect(result).toEqual(mockUpsertResult);
    });
  });
});