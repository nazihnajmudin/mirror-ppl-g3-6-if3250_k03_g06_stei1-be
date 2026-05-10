import { Router } from 'express';
import { 
  getNotificationsHandler, 
  markAsReadHandler, 
  triggerEarlyWarningHandler 
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * Middleware untuk membatasi akses hanya ke SUPER_ADMIN dan PIMPINAN
 */
const authorizeAlertAccess = (req: any, res: any, next: any) => {
  const role = req.user?.role;
  if (role !== 'SUPER_ADMIN' && role !== 'PIMPINAN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Akses hanya untuk Admin atau Pimpinan' 
    });
  }
  next();
};

router.get('/', authorizeAlertAccess, getNotificationsHandler);
router.patch('/:id/read', authorizeAlertAccess, markAsReadHandler);
router.post('/trigger', triggerEarlyWarningHandler);

export default router;
