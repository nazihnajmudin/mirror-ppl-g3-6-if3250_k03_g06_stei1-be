import { PrismaClient } from '@prisma/client';

// Query Log
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('[DB SUCCEED] Koneksi ke PostgreSQL berhasil dilakukan melalui Prisma.');
    } catch (error) {
        console.error('[DB ERRROR] Gagal terhubung ke database:', error);
        process.exit(1);
    }
};

export default prisma;