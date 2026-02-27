const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
    getBudgets,
    createBudget,
    getBudget,
    updateBudget,
    deleteBudget,
} = require('../controllers/budgetController');

router.use(authenticate);

router.get('/', getBudgets);
router.post('/', createBudget);
router.get('/:id', getBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
