import { Router } from 'express';
import {
  getPlatformStats,
  getUsers,
  updateUserStatus,
  getTickets,
  createTicket,
  resolveTicket,
} from '../controllers/adminController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

// All routes require authentication
router.use(protect);

// Support ticket creation accessible by standard users
router.post('/tickets', createTicket);

// Admin-only management endpoints
router.get('/stats', adminOnly, getPlatformStats);
router.get('/users', adminOnly, getUsers);
router.put('/users/:id/status', adminOnly, updateUserStatus);
router.get('/tickets', adminOnly, getTickets);
router.put('/tickets/:id/resolve', adminOnly, resolveTicket);

export default router;
