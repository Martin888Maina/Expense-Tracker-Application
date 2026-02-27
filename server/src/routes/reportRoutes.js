const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
    getSummary,
    getByCategory,
    getTrends,
    getComparison,
} = require('../controllers/reportController');

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/trends', getTrends);
router.get('/comparison', getComparison);

module.exports = router;
