import { Router } from 'express';
import {
  getAllProdiHandler,
  getDashboardByProdiHandler,
  getMyProdiHandler,
  getProdiHandler,
  updateDashboardByProdiHandler,
} from '../controllers/prodi.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireProdiAccess } from '../middlewares/prodi.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateDashboardSchema } from '../validators/prodi.validator';

/**
 * @swagger
 * tags:
 *   name: Prodi
 *   description: API untuk Program Studi dan Dashboard Per Prodi
 */

const router = Router();

// All prodi routes require authentication
router.use(authenticate);

router.get('/', getAllProdiHandler);
router.get('/my-prodi', getMyProdiHandler);
router.get('/:prodiId', requireProdiAccess('read'), getProdiHandler);
router.get('/:prodiId/dashboard', requireProdiAccess('read'), getDashboardByProdiHandler);
router.put('/:prodiId/dashboard', requireProdiAccess('write'), validate(updateDashboardSchema), updateDashboardByProdiHandler);

export default router;
