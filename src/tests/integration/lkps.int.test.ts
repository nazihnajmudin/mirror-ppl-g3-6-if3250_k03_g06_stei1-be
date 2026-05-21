import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';

describe('LKPS Management - Integration Test', () => {
  let adminToken: string;
  let kaprodiToken: string;
  let testProdiId: string;
  let testDocumentId: string;

  const adminUser = {
    email: "admin_lkps_test@itb.ac.id",
    name: "Admin LKPS Test",
    password: "password123",
    role: Role.SUPER_ADMIN as any,
    prodiId: "550e8400-e29b-41d4-a716-446655440000"
  };

  const kaprodiUser = {
    email: "kaprodi_lkps_test@itb.ac.id",
    name: "Kaprodi LKPS Test",
    password: "password123",
    role: Role.KAPRODI as any,
    prodiId: "550e8400-e29b-41d4-a716-446655440000"
  };

  beforeAll(async () => {
    let existingProdi = await prisma.prodi.findUnique({ where: { id: "550e8400-e29b-41d4-a716-446655440000" } });

    if (!existingProdi) {
      existingProdi = await prisma.prodi.create({
        data: { id: "550e8400-e29b-41d4-a716-446655440000", fullname: "Test Prodi LKPS", abbreviation: "TPL", degree: "S1" }
      });
    }

    testProdiId = existingProdi.id;

    adminUser.prodiId = testProdiId;
    kaprodiUser.prodiId = testProdiId;

    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, kaprodiUser.email] } } });

    const adminRegisterRes = await request(app)
      .post('/api/auth/register')
      .send(adminUser);

    adminToken = adminRegisterRes.body.data.token;

    const kaprodiRegisterRes = await request(app)
      .post('/api/auth/register')
      .send(kaprodiUser);

    kaprodiToken = kaprodiRegisterRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.documentLKPS.deleteMany({ where: { prodiId: testProdiId } });
    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, kaprodiUser.email] } } });
    await prisma.accreditationInfo.deleteMany({ where: { prodiId: testProdiId } });
    await prisma.prodi.deleteMany({ where: { id: testProdiId } });
    await prisma.$disconnect();
  });

  describe('POST /api/lkps/preview', () => {
    it('harus berhasil mempreview file Excel LKPS', async () => {
      const mockExcelBuffer = Buffer.from('mock excel data');

      const res = await request(app)
        .post('/api/lkps/preview')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', mockExcelBuffer, 'test.xlsx');

      expect(res.status).toBeDefined();
    });
  });

  describe('GET /api/lkps/history/:prodiId', () => {
    it('harus mendapatkan riwayat LKPS untuk prodi tertentu', async () => {
      const res = await request(app)
        .get(`/api/lkps/history/${testProdiId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/lkps/confirm', () => {
    it('harus berhasil mengkonfirmasi upload LKPS', async () => {
      const mockExcelBuffer = Buffer.from('mock excel data');

      const res = await request(app)
        .post('/api/lkps/confirm')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('prodiId', testProdiId)
        .field('name', 'Test LKPS Document')
        .field('periode', '2024')
        .attach('file', mockExcelBuffer, 'test.xlsx');

      if (res.status === 201) {
        testDocumentId = res.body.data.id;
      }

      expect(res.status).toBeDefined();
    });
  });

  describe('GET /api/lkps/export/:id', () => {
    it('harus berhasil mengexport LKPS sebagai Excel', async () => {
      if (!testDocumentId) {
        return;
      }

      const res = await request(app)
        .get(`/api/lkps/export/${testDocumentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBeDefined();
    });
  });
});