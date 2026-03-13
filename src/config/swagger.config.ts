import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'STEI Akreditasi API',
      version: '1.0.0',
      description:
        'API documentation for Sistem Terintegrasi Repository dan Dashboard Data Akreditasi STEI ITB',
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ProdiSummary: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nama: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: {
              type: 'string',
              enum: ['ADMIN_INSTITUSI', 'PIMPINAN', 'KAPRODI', 'ADMIN_PRODI', 'DOSEN'],
            },
            isActive: { type: 'boolean' },
            prodiId: { type: 'integer', nullable: true },
            prodi: {
              oneOf: [{ $ref: '#/components/schemas/ProdiSummary' }, { type: 'null' }],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@itb.ac.id' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'name', 'password', 'role'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@itb.ac.id' },
            name: { type: 'string', example: 'Budi Santoso' },
            password: { type: 'string', format: 'password', example: 'password123' },
            role: {
              type: 'string',
              enum: ['ADMIN_INSTITUSI', 'PIMPINAN', 'KAPRODI', 'ADMIN_PRODI', 'DOSEN'],
            },
            prodiId: { type: 'integer', nullable: true },
          },
        },
        CreateAccountRequest: {
          type: 'object',
          required: ['email', 'name', 'role'],
          description:
            'Untuk role DOSEN, KAPRODI, dan ADMIN_PRODI, field prodiId wajib diisi.',
          properties: {
            email: { type: 'string', format: 'email', example: 'dosen@itb.ac.id' },
            name: { type: 'string', minLength: 3, maxLength: 100, example: 'Budi Santoso' },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'password123',
            },
            role: {
              type: 'string',
              enum: ['ADMIN_INSTITUSI', 'PIMPINAN', 'KAPRODI', 'ADMIN_PRODI', 'DOSEN'],
            },
            prodiId: { type: 'integer', nullable: true },
          },
        },
        UpdateAccountRequest: {
          type: 'object',
          description:
            'Jika role diubah menjadi DOSEN, KAPRODI, atau ADMIN_PRODI maka prodiId wajib diisi.',
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
            role: {
              type: 'string',
              enum: ['ADMIN_INSTITUSI', 'PIMPINAN', 'KAPRODI', 'ADMIN_PRODI', 'DOSEN'],
            },
            isActive: { type: 'boolean' },
            prodiId: { type: 'integer', nullable: true },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string' },
            data: {},
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
            error: {},
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../controllers/*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);