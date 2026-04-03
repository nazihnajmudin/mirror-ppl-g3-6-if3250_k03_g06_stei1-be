import { Router } from 'express';
import prisma from '../config/database.config';
import { successResponse, errorResponse } from '../utils/response';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/prodi:
 *   get:
 *     summary: Mendapatkan semua daftar Program Studi
 *     tags: [Prodi]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req, res) => {
  try {
    const prodis = await prisma.prodi.findMany({
      orderBy: { fullname: 'asc' }
    });
    return successResponse(res, prodis, 'Berhasil mengambil daftar Prodi');
  } catch (error: any) {
    return errorResponse(res, 'Gagal mengambil daftar Prodi', 500);
  }
});

export default router;
