import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';

describe('Institusi Management - Integration Test', () => {
  let adminToken: string;
  let kaprodiToken: string;

  const adminUser = {
    email: "admin_institusi_test@itb.ac.id",
    name: "Admin Institusi Test",
    password: "password123",
    role: Role.SUPER_ADMIN,
  };

  const kaprodiUser = {
    email: "kaprodi_institusi_test@itb.ac.id",
    name: "Kaprodi Institusi Test",
    password: "password123",
    role: Role.KAPRODI,
  };

  beforeAll(async () => {
    await prisma.dataInstitusi.deleteMany({ where: { periode: "2025/2026-TEST" } });
    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, kaprodiUser.email] } } });

    const adminRegisterRes = await request(app).post('/api/auth/register').send(adminUser);
    adminToken = adminRegisterRes.body.data.token;

    const kaprodiRegisterRes = await request(app).post('/api/auth/register').send(kaprodiUser);
    kaprodiToken = kaprodiRegisterRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.dataInstitusi.deleteMany({ where: { periode: "2025/2026-TEST" } });
    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, kaprodiUser.email] } } });
    await prisma.$disconnect();
  });

  describe('POST /api/institusi/sync', () => {
    const payloadSync = {
      periode: "2025/2026-TEST",
      sheetName: "2b",
      data: [
        { no: 1, upps_ts: 600000000 },
        { no: 2, upps_ts: 170000000 }
      ]
    };

    it('harus menolak akses jika pengguna adalah Kaprodi (403)', async () => {
      const res = await request(app)
        .post('/api/institusi/sync')
        .set('Authorization', `Bearer ${kaprodiToken}`)
        .send(payloadSync);

      expect(res.status).toBe(403);
    });

    it('harus menolak akses jika input tidak lengkap (400)', async () => {
      const res = await request(app)
        .post('/api/institusi/sync')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ periode: "2025/2026-TEST" });

      expect(res.status).toBe(400);
    });

    it('harus berhasil menyimpan dan menyinkronisasi untuk admin (200)', async () => {
      const res = await request(app)
        .post('/api/institusi/sync')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payloadSync);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("berhasil");
      expect(res.body.data.periode).toBe("2025/2026-TEST");
    });
  });

  describe('GET /api/institusi', () => {
    it('harus mendapatkan error 400 jika query periode tidak dikirim', async () => {
      const res = await request(app)
        .get('/api/institusi')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('harus berhasil mendapatkan data institusi berdasarkan periode', async () => {
      const res = await request(app)
        .get('/api/institusi?periode=2025/2026-TEST')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});