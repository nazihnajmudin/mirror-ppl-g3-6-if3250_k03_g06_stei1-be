import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database.config';
import { Role } from '.prisma/client/wasm';

describe('Prodi Management - Integration Test', () => {
  let adminToken: string;
  let kaprodiToken: string;
  let testProdiId: string;

  const adminUser = {
    email: "admin_prodi_test@itb.ac.id",
    name: "Admin Prodi Test",
    password: "password123",
    role: Role.SUPER_ADMIN as any,
    prodiId: "1"
  };

  const kaprodiUser = {
    email: "kaprodi_prodi_test@itb.ac.id",
    name: "Kaprodi Prodi Test",
    password: "password123",
    role: Role.KAPRODI as any,
    prodiId: "1"
  };

  beforeAll(async () => {
    let existingProdi = await prisma.prodi.findUnique({ where: { id: "550e8400-e29b-41d4-a716-446655440000" } });

    if (!existingProdi) {
      existingProdi = await prisma.prodi.create({
        data: { id: "550e8400-e29b-41d4-a716-446655440000", fullname: "Test Prodi Profil", abbreviation: "TPP", degree: "S1" }
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
    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, kaprodiUser.email] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/prodi', () => {
    it('harus mendapatkan semua program studi untuk admin', async () => {
      const res = await request(app)
        .get('/api/prodi')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/prodi/my-prodi', () => {
    it('harus mendapatkan prodi yang dapat diakses oleh admin', async () => {
      const res = await request(app)
        .get('/api/prodi/my-prodi')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('harus mendapatkan prodi yang dapat diakses oleh kaprodi', async () => {
      const res = await request(app)
        .get('/api/prodi/my-prodi')
        .set('Authorization', `Bearer ${kaprodiToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/prodi/:id', () => {
    it('harus mendapatkan prodi berdasarkan ID untuk admin', async () => {
      const res = await request(app)
        .get(`/api/prodi/${testProdiId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testProdiId);
    });

    it('harus mendapatkan prodi berdasarkan ID untuk kaprodi', async () => {
      const res = await request(app)
        .get(`/api/prodi/${testProdiId}`)
        .set('Authorization', `Bearer ${kaprodiToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testProdiId);
    });
  });

  describe('PUT /api/prodi/:id', () => {
    it('harus berhasil mengupdate prodi untuk admin', async () => {
      const updateData = {
        fullname: "Updated Test Prodi",
        abbreviation: "UTP",
        degree: "S2"
      };

      const res = await request(app)
        .put(`/api/prodi/${testProdiId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data.fullname).toBe(updateData.fullname);
      expect(res.body.data.abbreviation).toBe(updateData.abbreviation);
      expect(res.body.data.degree).toBe(updateData.degree);
    });

    it('harus berhasil mengupdate prodi untuk kaprodi', async () => {
      const updateData = {
        fullname: "Updated Test Prodi Kaprodi",
        abbreviation: "UTPK",
        degree: "S3"
      };

      const res = await request(app)
        .put(`/api/prodi/${testProdiId}`)
        .set('Authorization', `Bearer ${kaprodiToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data.fullname).toBe(updateData.fullname);
    });
  });

  describe('GET /api/prodi/:id/accreditation', () => {
    it('harus mendapatkan akreditasi prodi', async () => {
      const res = await request(app)
        .get(`/api/prodi/${testProdiId}/accreditation`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/prodi/:id/accreditation', () => {
    it('harus berhasil mengupdate akreditasi prodi', async () => {
      const accreditationData = {
        grade: "A",
        startDate: new Date("2024-01-01").toISOString(),
        endDate: new Date("2029-01-01").toISOString()
      };

      const res = await request(app)
        .put(`/api/prodi/${testProdiId}/accreditation`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(accreditationData);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/prodi/:id/dashboard', () => {
    it('harus mendapatkan dashboard prodi', async () => {
      const res = await request(app)
        .get(`/api/prodi/${testProdiId}/dashboard`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/prodi/:id/dashboard', () => {
    it('harus berhasil mengupdate dashboard prodi', async () => {
      const dashboardData = {
        accreditationInfo: {
          grade: "A",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString()
        },
        documents: {
          lkps: { status: "Draft", progress: 50 },
          led: { status: "Draft", progress: 30 }
        },
        simulationScore: 85,
        criteria: [],
        criticalIndicators: [],
        recentActivities: []
      };

      const res = await request(app)
        .put(`/api/prodi/${testProdiId}/dashboard`)
        .set('Authorization', `Bearer ${kaprodiToken}`)
        .send(dashboardData);

      expect(res.status).toBe(200);
    });
  });
});