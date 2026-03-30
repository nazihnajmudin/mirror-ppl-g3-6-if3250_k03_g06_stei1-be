import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database.config';
import * as authService from '../../services/auth.service';
import { Role } from '@prisma/client';

describe('Auth Integration Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: Role.SUPER_ADMIN,
  };

  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data).toHaveProperty('token');
  });
});