import { Router } from 'express';
import { updateProfile, changePassword } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
