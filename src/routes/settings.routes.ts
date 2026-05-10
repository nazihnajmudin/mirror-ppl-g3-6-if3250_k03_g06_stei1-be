import { Router } from 'express';
import { getThresholdsHandler, updateThresholdHandler } from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * Middleware untuk membatasi akses hanya ke SUPER_ADMIN
 */
const authorizeSuperAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Akses hanya untuk Super Admin' 
    });
  }
  next();
};

router.get('/threshold', authorizeSuperAdmin, getThresholdsHandler);
router.put('/threshold', authorizeSuperAdmin, updateThresholdHandler);

export default router;
