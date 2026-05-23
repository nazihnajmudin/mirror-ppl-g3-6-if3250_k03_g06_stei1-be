import * as monitoringService from '../../services/monitoring.service';
import prisma from '../../config/database.config';

jest.mock('../../config/database.config', () => ({
  user: { findUnique: jest.fn() },
  prodi: { findUnique: jest.fn() },
  documentLKPS: { findUnique: jest.fn() },
  documentLED: { findUnique: jest.fn() },
  dokumenEviden: { findUnique: jest.fn() },
  monitoringEvaluation: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../services/prodi.service', () => ({
  getProdiForUser: jest.fn(),
}));

describe('Monitoring Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('harus membuat catatan monitoring untuk dokumen LED', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', role: 'SUPER_ADMIN' });
    (prisma.documentLED.findUnique as jest.Mock).mockResolvedValue({ id: 'led-1', prodiId: 'prodi-1', name: 'LED Test' });
    (prisma.monitoringEvaluation.create as jest.Mock).mockResolvedValue({ id: 'mon-1' });

    const result = await monitoringService.createMonitoringEvaluation({
      documentType: 'LED',
      documentId: 'led-1',
      indicatorCode: 'C1',
      indicatorName: 'Visi Misi',
      note: 'Perlu perbaikan redaksi',
      evaluation: 'Sudah cukup baik',
      recommendation: 'Tambahkan indikator bukti',
      status: 'OPEN',
      createdById: 'user-1',
    });

    expect(prisma.monitoringEvaluation.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        documentType: 'LED',
        documentRefId: 'led-1',
        ledId: 'led-1',
        indicatorName: 'Visi Misi',
      }),
    }));
    expect(result).toEqual({ id: 'mon-1' });
  });

  it('harus mengambil riwayat monitoring untuk dokumen yang sama', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', role: 'SUPER_ADMIN' });
    (prisma.documentLED.findUnique as jest.Mock).mockResolvedValue({ id: 'led-1', prodiId: 'prodi-1', name: 'LED Test' });
    (prisma.monitoringEvaluation.findMany as jest.Mock).mockResolvedValue([{ id: 'mon-1' }]);

    const result = await monitoringService.getMonitoringHistory('LED', 'led-1', 'user-1');

    expect(prisma.monitoringEvaluation.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { documentType: 'LED', documentRefId: 'led-1' },
    }));
    expect(result).toEqual([{ id: 'mon-1' }]);
  });
});