import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database.config';
import { Role, DocumentStatus } from '@prisma/client';

describe('Monitoring Evaluation - Integration Test', () => {
  let adminToken: string;
  let prodiId: string;
  let ledId: string;

  const adminUser = {
    email: 'monitoring_admin_test@itb.ac.id',
    name: 'Monitoring Admin Test',
    password: 'password123',
    role: Role.SUPER_ADMIN as any,
    prodiId: '550e8400-e29b-41d4-a716-446655440010',
  };

  beforeAll(async () => {
    const existingProdi = await prisma.prodi.upsert({
      where: { id: adminUser.prodiId },
      update: { fullname: 'Test Prodi Monitoring', abbreviation: 'TPM', degree: 'S1' },
      create: { id: adminUser.prodiId, fullname: 'Test Prodi Monitoring', abbreviation: 'TPM', degree: 'S1' },
    });

    prodiId = existingProdi.id;

    await prisma.monitoringEvaluation.deleteMany({ where: { prodiId } });
    await prisma.documentLED.deleteMany({ where: { prodiId } });
    await prisma.user.deleteMany({ where: { email: adminUser.email } });

    const registerRes = await request(app).post('/api/auth/register').send(adminUser);
    adminToken = registerRes.body.data.token;

    const adminDbUser = await prisma.user.findUnique({ where: { email: adminUser.email } });
    if (!adminDbUser) {
      throw new Error('Admin test user tidak ditemukan');
    }

    const ledDocument = await prisma.documentLED.create({
      data: {
        id: 'led-monitoring-test',
        prodiId,
        name: 'LED Monitoring Test',
        status: DocumentStatus.DRAFT,
        content: 'stored-led-file',
        periode: '2026',
        versi: 1,
        pengunggahId: adminDbUser.id,
      },
    });

    ledId = ledDocument.id;
  });

  afterAll(async () => {
    await prisma.monitoringEvaluation.deleteMany({ where: { documentRefId: ledId } });
    await prisma.documentLED.deleteMany({ where: { id: ledId } });
    await prisma.user.deleteMany({ where: { email: adminUser.email } });
    await prisma.prodi.deleteMany({ where: { id: prodiId } });
    await prisma.$disconnect();
  });

  it('harus menyimpan catatan monitoring dan mengembalikan riwayatnya', async () => {
    const createRes = await request(app)
      .post('/api/monitoring-evaluasi')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        documentType: 'LED',
        documentId: ledId,
        indicatorCode: 'C1',
        indicatorName: 'Visi Misi',
        note: 'Perlu revisi bahasa',
        evaluation: 'Sudah sesuai secara umum',
        recommendation: 'Perjelas narasi indikator',
        status: 'OPEN',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.documentRefId).toBe(ledId);

    const historyRes = await request(app)
      .get(`/api/monitoring-evaluasi/history/LED/${ledId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body.data)).toBe(true);
    expect(historyRes.body.data.length).toBeGreaterThan(0);
    expect(historyRes.body.data[0].documentRefId).toBe(ledId);
  });
});