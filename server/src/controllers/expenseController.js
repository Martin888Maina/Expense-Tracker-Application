const { Op } = require('sequelize');
const { Expense, Category } = require('../models');
const { expenseSchema, expenseUpdateSchema } = require('../schemas/expenseSchema');

// Retrieve a paginated, filtered, and sorted list of expenses for the logged-in user
const getExpenses = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 15,
            sortBy = 'date',
            sortOrder = 'DESC',
            categoryId,
            paymentMethod,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            search,
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build up the WHERE clause dynamically based on whichever filters are active
        const where = { userId: req.user.id };

        if (categoryId) where.categoryId = categoryId;
        if (paymentMethod) where.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = startDate;
            if (endDate) where.date[Op.lte] = endDate;
        }
        if (minAmount || maxAmount) {
            where.amount = {};
            if (minAmount) where.amount[Op.gte] = parseFloat(minAmount);
            if (maxAmount) where.amount[Op.lte] = parseFloat(maxAmount);
        }
        if (search) {
            where[Op.or] = [
                { description: { [Op.iLike]: `%${search}%` } },
                { notes: { [Op.iLike]: `%${search}%` } },
            ];
        }

        // Only allow sorting by safe column names to avoid SQL injection via query params
        const allowedSortFields = ['date', 'amount', 'description', 'createdAt'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'date';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const { count, rows: expenses } = await Expense.findAndCountAll({
            where,
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
            order: [[safeSortBy, safeSortOrder]],
            limit: parseInt(limit),
            offset,
        });

        res.json({
            success: true,
            data: expenses,
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Create a new expense record
const createExpense = async (req, res, next) => {
    try {
        // Parse and validate the request body with Zod before touching the database
        const parsed = expenseSchema.parse({
            ...req.body,
            amount: parseFloat(req.body.amount),
        });

        // Confirm the category exists and belongs to either the system or this user
        const category = await Category.findOne({
            where: {
                id: parsed.categoryId,
                [Op.or]: [{ userId: req.user.id }, { userId: null }],
            },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: { message: 'Category not found.' },
            });
        }

        const expense = await Expense.create({ ...parsed, userId: req.user.id });

        // Return the full expense with its category details attached
        const full = await Expense.findByPk(expense.id, {
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
        });

        res.status(201).json({ success: true, data: full });
    } catch (error) {
        next(error);
    }
};

// Return a single expense by its ID
const getExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
        });

        if (!expense) {
            return res.status(404).json({ success: false, error: { message: 'Expense not found.' } });
        }

        res.json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
};

// Update an existing expense
const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!expense) {
            return res.status(404).json({ success: false, error: { message: 'Expense not found.' } });
        }

        const parsed = expenseUpdateSchema.parse({
            ...req.body,
            amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : undefined,
        });

        // If the category is being changed, verify the new category is accessible
        if (parsed.categoryId && parsed.categoryId !== expense.categoryId) {
            const category = await Category.findOne({
                where: { id: parsed.categoryId, [Op.or]: [{ userId: req.user.id }, { userId: null }] },
            });
            if (!category) {
                return res.status(404).json({ success: false, error: { message: 'Category not found.' } });
            }
        }

        await expense.update(parsed);

        const updated = await Expense.findByPk(expense.id, {
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// Delete a single expense
const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!expense) {
            return res.status(404).json({ success: false, error: { message: 'Expense not found.' } });
        }

        await expense.destroy();
        res.json({ success: true, data: { message: 'Expense deleted successfully.' } });
    } catch (error) {
        next(error);
    }
};

// Delete multiple expenses in a single request
const bulkDeleteExpenses = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: { message: 'Please provide an array of expense IDs to delete.' } });
        }

        // The userId check ensures users can only delete their own expenses
        const deleted = await Expense.destroy({
            where: { id: { [Op.in]: ids }, userId: req.user.id },
        });

        res.json({ success: true, data: { message: `${deleted} expense(s) deleted successfully.`, count: deleted } });
    } catch (error) {
        next(error);
    }
};

// Export filtered expenses as a plain CSV file
const exportExpensesCSV = async (req, res, next) => {
    try {
        const { startDate, endDate, categoryId, paymentMethod } = req.query;

        const where = { userId: req.user.id };
        if (categoryId) where.categoryId = categoryId;
        if (paymentMethod) where.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = startDate;
            if (endDate) where.date[Op.lte] = endDate;
        }

        const expenses = await Expense.findAll({
            where,
            include: [{ model: Category, as: 'category', attributes: ['name'] }],
            order: [['date', 'DESC']],
        });

        // Build a CSV string manually — no extra dependency needed for this simple export
        const headers = ['Date', 'Description', 'Category', 'Amount (KES)', 'Payment Method', 'Notes'];
        const rows = expenses.map((e) => [
            e.date,
            `"${e.description.replace(/"/g, '""')}"`,
            e.category ? e.category.name : 'Unknown',
            parseFloat(e.amount).toFixed(2),
            e.paymentMethod,
            e.notes ? `"${e.notes.replace(/"/g, '""')}"` : '',
        ]);

        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        const today = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="expense-tracker-expenses-${today}.csv"`);
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

module.exports = { getExpenses, createExpense, getExpense, updateExpense, deleteExpense, bulkDeleteExpenses, exportExpensesCSV };
