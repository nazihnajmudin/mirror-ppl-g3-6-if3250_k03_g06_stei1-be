import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';

describe('Penugasan Management - Integration Test', () => {
  let adminToken: string;
  let testProdiId: string;
  let testUserId: string;
  let testAssignmentId: string;

  const adminUser = {
    email: "admin_penugasan_test@itb.ac.id",
    name: "Admin Penugasan Test",
    password: "password123",
    role: Role.SUPER_ADMIN as any,
    prodiId: "0"
  };

  const timProdiUser = {
    email: "tim_prodi_test@itb.ac.id",
    name: "Tim Prodi Test",
    password: "password123",
    role: Role.TIM_PRODI as any,
    prodiId: "1"
  };

  beforeAll(async () => {
    let existingProdi = await prisma.prodi.findUnique({ where: { id: "550e8400-e29b-41d4-a716-446655440000" } });

    if (!existingProdi) {
      existingProdi = await prisma.prodi.create({
        data: { id: "550e8400-e29b-41d4-a716-446655440000", fullname: "Test Prodi Penugasan", abbreviation: "TPP", degree: "S1" }
      });
    }

    testProdiId = existingProdi.id;

    adminUser.prodiId = testProdiId;
    timProdiUser.prodiId = testProdiId;

    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, timProdiUser.email] } } });

    const adminRegisterRes = await request(app)
      .post('/api/auth/register')
      .send(adminUser);

    adminToken = adminRegisterRes.body.data.token;

    const timProdiRegisterRes = await request(app)
      .post('/api/auth/register')
      .send(timProdiUser);

    testUserId = timProdiRegisterRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.prodiAssignment.deleteMany({ where: { prodiId: testProdiId } });
    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, timProdiUser.email] } } });
    await prisma.accreditationInfo.deleteMany({ where: { prodiId: testProdiId } });
    await prisma.prodi.deleteMany({ where: { id: testProdiId } });
    await prisma.$disconnect();
  });

  describe('GET /api/penugasan', () => {
    it('harus mendapatkan semua penugasan', async () => {
      const res = await request(app)
        .get('/api/penugasan')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('harus mendapatkan penugasan berdasarkan prodiId', async () => {
      const res = await request(app)
        .get(`/api/penugasan?prodiId=${testProdiId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/penugasan', () => {
    it('harus berhasil membuat penugasan baru', async () => {
      const newAssignment = {
        userId: testUserId,
        prodiId: testProdiId
      };

      const res = await request(app)
        .post('/api/penugasan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAssignment);

      if (res.status === 201) {
        testAssignmentId = res.body.data.id;
      }

      expect(res.status).toBe(201);
      expect(res.body.data.userId).toBe(testUserId);
      expect(res.body.data.prodiId).toBe(testProdiId);
      expect(res.body.data).toHaveProperty('id');
    });

    it('harus gagal membuat penugasan jika sudah ada', async () => {
      const duplicateAssignment = {
        userId: testUserId,
        prodiId: testProdiId
      };

      const res = await request(app)
        .post('/api/penugasan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateAssignment);

      expect(res.status).toBe(400);
    });

    it('harus gagal membuat penugasan untuk user yang tidak valid', async () => {
      const invalidAssignment = {
        userId: "invalid-user-id",
        prodiId: testProdiId
      };

      const res = await request(app)
        .post('/api/penugasan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidAssignment);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/penugasan/:id', () => {
    it('harus berhasil menghapus penugasan', async () => {
      if (!testAssignmentId) {
        return;
      }

      const res = await request(app)
        .delete(`/api/penugasan/${testAssignmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('harus gagal menghapus penugasan yang tidak ada', async () => {
      const res = await request(app)
        .delete('/api/penugasan/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});