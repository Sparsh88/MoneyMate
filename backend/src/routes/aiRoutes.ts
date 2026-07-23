import { Router } from 'express';
import {
  getAiInsights,
  getAiPredictions,
  getAiBudgetSuggestions,
  getAiGoalRecommendations,
  askAiAdvisor,
} from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/insights', getAiInsights);
router.get('/predictions', getAiPredictions);
router.get('/budget-suggestions', getAiBudgetSuggestions);
router.get('/goal-recommendations', getAiGoalRecommendations);
router.post('/chat', askAiAdvisor);

export default router;
