import request from 'supertest';
import app from '../../app'; 
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';

describe('Auth API - Integration Test', () => {
  
  const testUser = {
    email: "test_account@itb.ac.id",
    name: "Budi Santoso",
    password: "password123",
    role: Role.SUPER_ADMIN,
    prodiId: "550e8400-e29b-41d4-a716-446655440001"
  };

  beforeAll(async () => {
    // Check if prodi exists
    let existingProdi = await prisma.prodi.findUnique({ where: { id: testUser.prodiId } });
    if (!existingProdi) {
      existingProdi = await prisma.prodi.findUnique({ where: { fullname: "Test Prodi Auth" } });
    }

    if (!existingProdi) {
      await prisma.prodi.create({
        data: { id: testUser.prodiId, fullname: "Test Prodi Auth", abbreviation: "TPA", degree: "S1" }
      });
    } else {
      testUser.prodiId = existingProdi.id;
    }

    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.accreditationInfo.deleteMany({
      where: { prodiId: testUser.prodiId }
    });
    await prisma.prodi.deleteMany({
      where: { id: testUser.prodiId }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('harus berhasil mendaftarkan user baru', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data).toHaveProperty('token');
    });
  });

  describe('POST /api/auth/login', () => {
    it('harus berhasil login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      
      expect(res.body.data).toHaveProperty('token');
    });
  });

  describe('GET /api/auth/me', () => {
    it('harus berhasil mendapatkan pengguna yang sedang login', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`) 
        .send();

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email', testUser.email);
    });

    it('harus gagal mendapatkan profil jika tidak menyertakan token', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.status).toBe(401);
    });
  });
});
