import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadReceipt,
  exportTransactionsCSV,
  exportTransactionsPDF,
  importTransactionsCSV,
} from '../controllers/transactionController';
import { protect } from '../middleware/auth';
import { uploadImage, uploadCSV } from '../middleware/upload';

const router = Router();

router.use(protect);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

// Receipt Image upload route
router.post('/upload-receipt', uploadImage.single('receipt'), uploadReceipt);

// Import & Export routes
router.get('/export/csv', exportTransactionsCSV);
router.get('/export/pdf', exportTransactionsPDF);
router.post('/import', uploadCSV.single('file'), importTransactionsCSV);

export default router;
