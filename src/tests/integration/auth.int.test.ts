import request from 'supertest';
import app from '../../app'; 
import prisma from '../../config/database';

describe('Auth API - Integration Test', () => {
  
  const testUser = {
    "email": "test_account@itb.ac.id",
    "name": "Budi Santoso",
    "password": "password123",
    "role": "ADMIN_INSTITUSI",
    "prodiId": 1
  };

  beforeAll(async () => {
    await prisma.prodi.upsert({
      where: { id: 1 },
      update: {},
      create: { 
        id: 1, 
        nama: "Teknik Informatika" 
      }
    });

    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email }
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

      if (res.status !== 200) {
        console.log("ME_ERROR:", res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email', testUser.email);
    });

    it('harus gagal mendapatkan profil jika tidak menyertakan token', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.status).toBe(401);
    });
  });
});