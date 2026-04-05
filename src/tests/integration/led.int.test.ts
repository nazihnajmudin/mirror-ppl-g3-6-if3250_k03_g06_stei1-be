import request from 'supertest';
import app from '../../app'; 
import prisma from '../../config/database.config';
import { Role, DocumentStatus } from '@prisma/client';
import path from 'path';
import fs from 'fs';

describe('LED API - Integration Test', () => {
  let authToken: string;
  const dummyProdiId = "550e8400-e29b-41d4-a716-446655440001";
  const dummyUserId = "user-led-test-id";
  const periodeTest = "2026";

  beforeAll(async () => {
    await prisma.prodi.upsert({
      where: { id: dummyProdiId },
      update: {},
      create: { 
        id: dummyProdiId, 
        fullname: "Informatika Test", 
        abbreviation: "IF", 
        degree: "S1" 
      }
    });

    const testUser = {
      id: dummyUserId,
      email: "tester.led@itb.ac.id",
      name: "Tester LED",
      password: "password123",
      role: Role.TIM_PRODI,
      prodiId: dummyProdiId
    };

    await prisma.user.upsert({
      where: { id: dummyUserId },
      update: {},
      create: testUser
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: "password123" });
    
    authToken = loginRes.body.data.token;

    await prisma.documentLED.deleteMany({
      where: { prodiId: dummyProdiId, periode: periodeTest }
    });
  });

  afterAll(async () => {
    await prisma.documentLED.deleteMany({ where: { prodiId: dummyProdiId } });
    await prisma.$disconnect();
  });

  describe('POST /api/led/import', () => {
    it('harus berhasil mengunggah dokumen LED baru (Versi 1)', async () => {
      const filePath = path.join(__dirname, 'dummy-led.pdf');
      fs.writeFileSync(filePath, 'content');

      const res = await request(app)
        .post('/api/led/import')
        .set('Authorization', `Bearer ${authToken}`)
        .field('prodiId', dummyProdiId)
        .field('periode', periodeTest)
        .attach('file', filePath);

      expect(res.status).toBe(201);
      expect(res.body.data.versi).toBe(1);
      expect(res.body.data.status).toBe(DocumentStatus.DRAFT);

      fs.unlinkSync(filePath);
    });
  });

  describe('GET /api/led/history/{prodiId}/{periode}', () => {
    it('harus mengembalikan riwayat dokumen berdasarkan path parameters', async () => {
      const res = await request(app)
        .get(`/api/led/history/${dummyProdiId}/${periodeTest}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('versi');
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

  describe('GET /api/led/export/{prodiId}/{periode}', () => {
    it('harus berhasil mendapatkan dokumen versi terbaru', async () => {
      const res = await request(app)
        .get(`/api/led/export/${dummyProdiId}/${periodeTest}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.dokumen).toHaveProperty('versi');
      expect(res.body.data).toHaveProperty('filePath');
    });
  });

  describe('GET /api/led/export/document/{id}', () => {
    it('harus berhasil mengambil dokumen spesifik berdasarkan ID', async () => {
      const history = await prisma.documentLED.findFirst({
        where: { prodiId: dummyProdiId, periode: periodeTest }
      });

      const res = await request(app)
        .get(`/api/led/export/document/${history?.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.dokumen.id).toBe(history?.id);
    });

    it('harus mengembalikan 404 jika ID dokumen tidak valid', async () => {
      const res = await request(app)
        .get(`/api/led/export/document/non-existent-id`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});