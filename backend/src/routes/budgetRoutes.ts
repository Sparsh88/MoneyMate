import { Router } from 'express';
import { getBudgets, createOrUpdateBudget, deleteBudget } from '../controllers/budgetController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getBudgets);
router.post('/', createOrUpdateBudget);
router.delete('/:id', deleteBudget);

export default router;
