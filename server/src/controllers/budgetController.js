const { Op, fn, col, literal } = require('sequelize');
const { Budget, Category, Expense, sequelize } = require('../models');
const { budgetSchema, budgetUpdateSchema } = require('../schemas/budgetSchema');
const { getDateRangeForPeriod } = require('../utils/dateUtils');

// Return all budgets for the user, each enriched with how much has been spent so far
const getBudgets = async (req, res, next) => {
    try {
        const budgets = await Budget.findAll({
            where: { userId: req.user.id },
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
            order: [['createdAt', 'DESC']],
        });

        // For each budget, calculate how much of the limit has been used in the budget period
        const enriched = await Promise.all(
            budgets.map(async (budget) => {
                const result = await Expense.findOne({
                    where: {
                        userId: req.user.id,
                        categoryId: budget.categoryId,
                        date: { [Op.between]: [budget.startDate, budget.endDate] },
                    },
                    attributes: [[fn('SUM', col('amount')), 'totalSpent']],
                    raw: true,
                });

                const spent = parseFloat(result?.totalSpent || 0);
                const limit = parseFloat(budget.amount);
                const remaining = limit - spent;
                const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;

                // Determine a status badge to show on the budget card
                let status = 'on_track';
                if (percentUsed >= 100) status = 'over_budget';
                else if (percentUsed >= 90) status = 'caution';
                else if (percentUsed >= 75) status = 'warning';

                return { ...budget.toJSON(), spent, remaining, percentUsed, status };
            })
        );

        res.json({ success: true, data: enriched });
    } catch (error) {
        next(error);
    }
};

// Create a new budget — start and end dates are auto-calculated from the period
const createBudget = async (req, res, next) => {
    try {
        const parsed = budgetSchema.parse({
            ...req.body,
            amount: parseFloat(req.body.amount),
        });

        // If no dates were passed in, calculate them from the period
        if (!parsed.startDate || !parsed.endDate) {
            const range = getDateRangeForPeriod(parsed.period);
            parsed.startDate = range.startDate;
            parsed.endDate = range.endDate;
        }

        // Check the unique constraint manually to return a clear error message
        const existing = await Budget.findOne({
            where: { userId: req.user.id, categoryId: parsed.categoryId, period: parsed.period },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: { message: 'A budget for this category and period already exists. Please edit the existing one.' },
            });
        }

        const budget = await Budget.create({ ...parsed, userId: req.user.id });

        const full = await Budget.findByPk(budget.id, {
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
        });

        res.status(201).json({ success: true, data: full });
    } catch (error) {
        next(error);
    }
};

// Return a single budget with its spending details
const getBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
        });

        if (!budget) {
            return res.status(404).json({ success: false, error: { message: 'Budget not found.' } });
        }

        // Get spending total for this budget's period
        const result = await Expense.findOne({
            where: {
                userId: req.user.id,
                categoryId: budget.categoryId,
                date: { [Op.between]: [budget.startDate, budget.endDate] },
            },
            attributes: [[fn('SUM', col('amount')), 'totalSpent']],
            raw: true,
        });

        const spent = parseFloat(result?.totalSpent || 0);
        const limit = parseFloat(budget.amount);

        res.json({
            success: true,
            data: {
                ...budget.toJSON(),
                spent,
                remaining: limit - spent,
                percentUsed: limit > 0 ? Math.round((spent / limit) * 100) : 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update a budget's amount, period, or dates
const updateBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!budget) {
            return res.status(404).json({ success: false, error: { message: 'Budget not found.' } });
        }

        const parsed = budgetUpdateSchema.parse({
            ...req.body,
            amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : undefined,
        });

        await budget.update(parsed);

        res.json({ success: true, data: budget });
    } catch (error) {
        next(error);
    }
};

// Remove a budget entry
const deleteBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!budget) {
            return res.status(404).json({ success: false, error: { message: 'Budget not found.' } });
        }

        await budget.destroy();
        res.json({ success: true, data: { message: 'Budget deleted successfully.' } });
    } catch (error) {
        next(error);
    }
};

module.exports = { getBudgets, createBudget, getBudget, updateBudget, deleteBudget };
