import { Router } from 'express';
import {
  getSimulationByProdiHandler,
  updateSimulationQualitativeHandler,
} from '../controllers/simulasiskor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireProdiAccess } from '../middlewares/prodi.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateSimulationQualitativeSchema } from '../validators/simulasiskor.validator';

const router = Router();

router.use(authenticate);

router.get('/:prodiId', requireProdiAccess('read'), getSimulationByProdiHandler);
router.put('/:prodiId/qualitative', requireProdiAccess('write'), validate(updateSimulationQualitativeSchema), updateSimulationQualitativeHandler);

export default router;
