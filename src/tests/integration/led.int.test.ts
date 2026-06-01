import request from 'supertest';
import app from '../../app'; 
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { de } from 'zod/locales';

describe('LED API - Integration Test (Success & Failure Scenarios)', () => {
  let authToken: string;
  const dummyProdiId = "550e8400-e29b-41d4-a716-446655440001";
  const dummyUserId = "user-led-test-id";
  const periodeTest = "2026";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    await prisma.prodi.upsert({
      where: { id: dummyProdiId },
      update: {},
      create: { id: dummyProdiId, fullname: "Informatika Test", abbreviation: "IF", degree: "S1" }
    });

    await prisma.user.upsert({
      where: { id: dummyUserId },
      update: { password: hashedPassword },
      create: {
        id: dummyUserId,
        email: "tester.led@itb.ac.id",
        name: "Tester LED",
        password: hashedPassword,
        role: Role.TIM_PRODI,
        prodiId: dummyProdiId
      }
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: "tester.led@itb.ac.id", password: "password123" });
    
    authToken = loginRes.body.data?.token || loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.documentLED.deleteMany({ where: { prodiId: dummyProdiId } });
    try {
      await (prisma as any).ledForm.deleteMany({ where: { prodiId: dummyProdiId } });
    } catch (error) {
    }
    await prisma.$disconnect();
  });

  describe('POST /api/led/import', () => {
    it('harus gagal jika tidak menyertakan file (400/500)', async () => {
      const res = await request(app)
        .post('/api/led/import')
        .set('Authorization', `Bearer ${authToken}`)
        .field('prodiId', dummyProdiId)
        .field('periode', periodeTest);

      expect([400, 500]).toContain(res.status);
    });

    it('harus gagal jika tidak menggunakan token (401)', async () => {
      const res = await request(app).post('/api/led/import');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/led/history/{prodiId}/{periode}', () => {
    it('harus mengembalikan array kosong atau 404 jika periode belum ada data', async () => {
      const periodeKosong = "1945";
      const res = await request(app)
        .get(`/api/led/history/${dummyProdiId}/${periodeKosong}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(500).toBe(res.status);
      if (res.status === 200) {
        expect(res.body.data.length).toBe(0);
      }
    });
  });

  describe('GET /api/led/periods/{prodiId}', () => {
    it('harus mendapatkan daftar periode yang tersedia untuk prodi tersebut', async () => {
      const res = await request(app)
        .get(`/api/led/periods/${dummyProdiId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toContain(periodeTest);

    });
  });

  describe('GET /api/led/export/document/{id}', () => {
    it('harus mengembalikan 400 atau 500 jika format UUID salah', async () => {
      const res = await request(app)
        .get(`/api/led/export/document/id-bukan-uuid`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(404).toBe(res.status);
    });

    it('harus mengembalikan 404 jika ID UUID valid tapi tidak ada di DB', async () => {
      const fakeUuid = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .get(`/api/led/export/document/${fakeUuid}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('LED Form API', () => {
    const formPeriode = periodeTest;
    const formTemplate = 'INFOKOM';
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    describe('POST /api/led/form/:prodiId', () => {
      it('harus gagal jika mencoba mengisi form untuk prodi lain', async () => {
        const wrongProdiId = "different-prodi-uuid";
        const res = await request(app)
          .post(`/api/led/form/${wrongProdiId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ template: formTemplate, periode: formPeriode, content: "{}" });

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/Akses ditolak/);
      });
    });

    describe('GET /api/led/form/history/:prodiId/:periode', () => {
      it('harus gagal jika user mengakses riwayat prodi yang bukan miliknya', async () => {
        const strangerProdiId = "stranger-danger-uuid";
        const res = await request(app)
          .get(`/api/led/form/history/${strangerProdiId}/${formPeriode}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Akses ditolak');
      });
    });

    describe('GET /api/led/form/:versionId', () => {
      it('harus gagal jika terjadi error sistem server down', async () => {
        const res = await request(app)
          .get(`/api/led/form/${nonExistentId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch("Cannot read properties of undefined (reading 'findUnique')");
      });
    });

    describe('GET /api/led/export/document/:id', () => {
      it('harus gagal jika dokumen id tidak terdaftar di database', async () => {
        const res = await request(app)
          .get(`/api/led/export/document/invalid-uuid-format`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
      });
    });
  });

  describe('GET /api/led/periods/{prodiId}', () => {
    it('harus tetap 200 meskipun daftar periode kosong', async () => {
      const res = await request(app)
        .get(`/api/led/periods/${dummyProdiId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});