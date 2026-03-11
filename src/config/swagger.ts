import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

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
        url: process.env.API_URL || 'http://localhost:8000',
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
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            password: { type: 'string', format: 'password' },
            role: {
              type: 'string',
              enum: ['ADMIN_INSTITUSI', 'PIMPINAN', 'KAPRODI', 'ADMIN_PRODI', 'DOSEN'],
            },
            prodiId: { type: 'integer', nullable: true },
          },
        },
        UpdateAccountRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
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
  ],
};

export const swaggerSpec = swaggerJsdoc(options);