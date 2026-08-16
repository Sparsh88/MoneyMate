import { Router } from 'express';
import {
  getUnifiedDashboard,
  getDashboardSummary,
  getCategorySpending,
  getTrends,
  getCashFlow,
} from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/dashboard', getUnifiedDashboard);
router.get('/summary', getDashboardSummary);
router.get('/category', getCategorySpending);
router.get('/trends', getTrends);
router.get('/cashflow', getCashFlow);

export default router;

