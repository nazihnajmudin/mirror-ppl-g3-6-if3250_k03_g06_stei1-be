import request from 'supertest';
import ExcelJS from 'exceljs';
import app from '../../app';
import prisma from '../../config/database.config';
import { Role } from '@prisma/client';

describe('LKPS Integration Tests', () => {
  const user = {
    email: 'lkps-test@example.com',
    password: 'password123',
    name: 'LKPS Test User',
    role: Role.ADMIN_INSTITUSI,
  };
  let token: string;
  let documentId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    await prisma.user.deleteMany();
    await prisma.document.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.document.deleteMany();
    await prisma.$disconnect();
  });

  it('harus register dan login', async () => {
    const register = await request(app).post('/api/auth/register').send(user);
    expect(register.status).toBe(201);
    expect(register.body.data).toHaveProperty('token');

    const login = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: user.password,
    });
    expect(login.status).toBe(200);
    expect(login.body.data).toHaveProperty('token');
    token = login.body.data.token;
  });

  it('harus import LKPS menggunakan file Excel', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('2a1');

    for (let i = 1; i <= 12; i += 1) {
      sheet.addRow([]);
    }
    sheet.addRow([1, 'ITB', 'V', '', '', 'Kegiatan A', 'Manfaat A', '2024-01-01', '2024-12-31', '12 bulan']);

    const buffer = await workbook.xlsx.writeBuffer();

    const res = await request(app)
      .post('/api/lkps/import')
      .set('Authorization', `Bearer ${token}`)
      .field('prodiId', 'prodi-test')
      .attach('file', buffer, 'lkps.xlsx');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    documentId = res.body.data.id;
  });

  it('harus mendapatkan LKPS berdasarkan ID', async () => {
    const res = await request(app)
      .get(`/api/lkps/${documentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(documentId);
    expect(res.body.data.content).toBeDefined();
  });

  it('harus mengekspor LKPS sebagai file Excel', async () => {
    const res = await request(app)
      .get(`/api/lkps/export/${documentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(res.headers['content-disposition']).toContain('attachment; filename=LKPS_Export_');
    expect(res.body).toBeDefined();
  });
});
