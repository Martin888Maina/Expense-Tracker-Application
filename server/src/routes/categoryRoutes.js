const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    hideCategory,
} = require('../controllers/categoryController');

router.use(authenticate);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.patch('/:id/hide', hideCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
