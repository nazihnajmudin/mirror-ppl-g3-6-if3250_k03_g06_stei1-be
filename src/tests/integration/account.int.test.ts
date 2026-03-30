import request from 'supertest';
import app from '../../app'; 
import prisma from '../../config/database.config';

describe('Account Management - Integration Test', () => {
  let adminToken: string;
  let testUserId: string;

  const testUser = {
    email: "admin_test@itb.ac.id",
    name: "Admin Test",
    password: "password123",
    role: "SUPER_ADMIN" as any,
    prodiId: "1"
  };

  beforeAll(async () => {
    // Check if prodi exists
    const existingProdi = await prisma.prodi.findUnique({ where: { id: "1" } });
    if (!existingProdi) {
      await prisma.prodi.create({
        data: { id: "1", fullname: "Teknik Informatika", abbreviation: "IF", degree: "S1" }
      });
    }

    await prisma.user.deleteMany({ where: { email: testUser.email } });
    
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    adminToken = registerRes.body.data.token;
    testUserId = registerRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe('GET /api/accounts', () => {
    it('harus mendapatkan semua akun', async () => {
      const res = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${adminToken}`); // WAJIB ADA

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

describe('POST /api/accounts', () => {
    it('harus bisa membuat pengguna baru oleh admin', async () => {
      const newUser = {
        email: "staff_baru@itb.ac.id",
        name: "Dosen Baru",
        password: "password123",
        role: "TIM_PRODI" as any,
        prodiId: "1"
      };

      const res = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      if (res.status !== 201) {
        console.log("CREATE_ACCOUNT_ERROR:", res.body);
      }

      expect(res.status).toBe(201);
      
      expect(res.body.data.email).toBe(newUser.email);
      expect(res.body.data.name).toBe(newUser.name);
      expect(res.body.data).toHaveProperty('id');

      await prisma.user.delete({ where: { email: newUser.email } });
    });

    it('harus gagal membuat pengguna jika email sudah ada', async () => {
      const duplicateUser = {
        email: testUser.email, 
        name: "Duplicate",
        password: "password123",
        role: "TIM_PRODI" as any,
        prodiId: "1"
      };

      const res = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateUser);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/accounts/:id', () => {
    it('harus mendapatkan detail satu akun', async () => {
      const res = await request(app)
        .get(`/api/accounts/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.id).toBe(testUserId);
    });
  });

  describe('PUT /api/accounts/:id', () => {
    it('harus berhasil memperbarui data akun', async () => {
      const res = await request(app)
        .put(`/api/accounts/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: "Nama Baru" });

      expect(res.status).toBe(200);
      
      expect(res.body.data.name).toBe("Nama Baru");
    });
  });

  describe('DELETE /api/accounts/:id', () => {
    it('harus berhasil menghapus akun', async () => {
      const res = await request(app)
        .delete(`/api/accounts/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const checkUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(checkUser).toBeNull();
    });
  });
});
