const { Op, fn, col, literal } = require('sequelize');
const { Expense, Category, sequelize } = require('../models');
const { getCurrentMonthRange, getPreviousMonthRange } = require('../utils/dateUtils');

// Monthly summary — total spent, today's total, average daily spend, top category
const getSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query.startDate
            ? { startDate: req.query.startDate, endDate: req.query.endDate }
            : getCurrentMonthRange();

        const prevRange = getPreviousMonthRange();

        // Total spent in the selected date range
        const currentTotal = await Expense.findOne({
            where: { userId: req.user.id, date: { [Op.between]: [startDate, endDate] } },
            attributes: [[fn('SUM', col('amount')), 'total']],
            raw: true,
        });

        // Total spent in the previous month for percentage comparison
        const prevTotal = await Expense.findOne({
            where: { userId: req.user.id, date: { [Op.between]: [prevRange.startDate, prevRange.endDate] } },
            attributes: [[fn('SUM', col('amount')), 'total']],
            raw: true,
        });

        // Today's spending total
        const today = new Date().toISOString().split('T')[0];
        const todayTotal = await Expense.findOne({
            where: { userId: req.user.id, date: today },
            attributes: [[fn('SUM', col('amount')), 'total']],
            raw: true,
        });

        // Top spending category for the selected range
        const topCategory = await Expense.findAll({
            where: { userId: req.user.id, date: { [Op.between]: [startDate, endDate] } },
            attributes: ['categoryId', [fn('SUM', col('amount')), 'total']],
            include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
            group: ['categoryId', 'category.id'],
            order: [[literal('"total"'), 'DESC']],
            limit: 1,
            raw: false,
        });

        const current = parseFloat(currentTotal?.total || 0);
        const previous = parseFloat(prevTotal?.total || 0);
        const percentChange = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

        // Calculate the number of days in the selected range for daily average
        const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1);

        res.json({
            success: true,
            data: {
                totalSpent: current,
                previousMonthTotal: previous,
                percentChange,
                todayTotal: parseFloat(todayTotal?.total || 0),
                averageDailySpend: parseFloat((current / days).toFixed(2)),
                topCategory: topCategory.length > 0 ? { ...topCategory[0].category?.toJSON(), total: parseFloat(topCategory[0].get('total')) } : null,
                period: { startDate, endDate },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Breakdown of total spending per category for a given date range
const getByCategory = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query.startDate
            ? req.query
            : getCurrentMonthRange();

        const results = await Expense.findAll({
            where: { userId: req.user.id, date: { [Op.between]: [startDate, endDate] } },
            attributes: ['categoryId', [fn('SUM', col('amount')), 'total'], [fn('COUNT', col('Expense.id')), 'count']],
            include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
            group: ['categoryId', 'category.id'],
            order: [[literal('"total"'), 'DESC']],
            raw: false,
        });

        const grandTotal = results.reduce((sum, r) => sum + parseFloat(r.get('total') || 0), 0);

        const data = results.map((r) => ({
            categoryId: r.categoryId,
            category: r.category,
            total: parseFloat(r.get('total')),
            count: parseInt(r.get('count')),
            percentage: grandTotal > 0 ? Math.round((parseFloat(r.get('total')) / grandTotal) * 100) : 0,
        }));

        res.json({ success: true, data, meta: { grandTotal, period: { startDate, endDate } } });
    } catch (error) {
        next(error);
    }
};

// Daily or weekly spending trend over a selected period — used for the line chart
const getTrends = async (req, res, next) => {
    try {
        const { startDate, endDate, period = 'daily' } = req.query.startDate
            ? req.query
            : { ...getCurrentMonthRange(), period: 'daily' };

        // Use PostgreSQL's date_trunc to group by day or week
        const truncUnit = period === 'weekly' ? 'week' : 'day';

        const results = await Expense.findAll({
            where: { userId: req.user.id, date: { [Op.between]: [startDate, endDate] } },
            attributes: [
                [fn('date_trunc', truncUnit, col('date')), 'period'],
                [fn('SUM', col('amount')), 'total'],
                [fn('COUNT', col('Expense.id')), 'count'],
            ],
            group: [literal(`date_trunc('${truncUnit}', "date")`)],
            order: [[literal(`date_trunc('${truncUnit}', "date")`), 'ASC']],
            raw: true,
        });

        res.json({
            success: true,
            data: results.map((r) => ({
                period: r.period,
                total: parseFloat(r.total),
                count: parseInt(r.count),
            })),
        });
    } catch (error) {
        next(error);
    }
};

// Month-over-month comparison — current vs previous month per category
const getComparison = async (req, res, next) => {
    try {
        const currentRange = getCurrentMonthRange();
        const prevRange = getPreviousMonthRange();

        const [currentData, prevData] = await Promise.all([
            Expense.findAll({
                where: { userId: req.user.id, date: { [Op.between]: [currentRange.startDate, currentRange.endDate] } },
                attributes: ['categoryId', [fn('SUM', col('amount')), 'total']],
                include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
                group: ['categoryId', 'category.id'],
                raw: false,
            }),
            Expense.findAll({
                where: { userId: req.user.id, date: { [Op.between]: [prevRange.startDate, prevRange.endDate] } },
                attributes: ['categoryId', [fn('SUM', col('amount')), 'total']],
                include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
                group: ['categoryId', 'category.id'],
                raw: false,
            }),
        ]);

        // Build a lookup map for previous month data to make comparison easy
        const prevMap = {};
        prevData.forEach((r) => { prevMap[r.categoryId] = parseFloat(r.get('total')); });

        const comparison = currentData.map((r) => {
            const current = parseFloat(r.get('total'));
            const previous = prevMap[r.categoryId] || 0;
            const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 100;

            return {
                category: r.category,
                currentMonth: current,
                previousMonth: previous,
                change,
                trend: current > previous ? 'up' : current < previous ? 'down' : 'same',
            };
        });

        res.json({
            success: true,
            data: comparison,
            meta: { currentPeriod: currentRange, previousPeriod: prevRange },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getSummary, getByCategory, getTrends, getComparison };
