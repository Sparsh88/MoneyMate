import { Router } from 'express';
import { getNotifications, markNotificationRead, deleteNotification } from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;
