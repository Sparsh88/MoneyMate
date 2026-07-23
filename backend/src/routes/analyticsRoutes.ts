import { Router } from 'express';
import {
  getDashboardSummary,
  getCategorySpending,
  getTrends,
  getCashFlow,
} from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/category', getCategorySpending);
router.get('/trends', getTrends);
router.get('/cashflow', getCashFlow);

export default router;
