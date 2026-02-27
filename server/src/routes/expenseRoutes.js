const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
    getExpenses,
    createExpense,
    getExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    exportExpensesCSV,
} = require('../controllers/expenseController');

// All expense routes require authentication
router.use(authenticate);

router.get('/export/csv', exportExpensesCSV);
router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/bulk', bulkDeleteExpenses);
router.delete('/:id', deleteExpense);

module.exports = router;
