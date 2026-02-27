const { Op } = require('sequelize');
const { Category, Expense } = require('../models');

// Return all categories available to this user — both system defaults and their own custom ones
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            where: {
                isHidden: false,
                [Op.or]: [
                    { userId: null },        // system-wide default categories
                    { userId: req.user.id }, // categories created by this user
                ],
            },
            order: [
                ['isDefault', 'DESC'], // show defaults first
                ['name', 'ASC'],
            ],
        });

        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

// Create a new custom category for the logged-in user
const createCategory = async (req, res, next) => {
    try {
        const { name, icon, color } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: { message: 'Category name is required.' } });
        }

        // Each user must have unique category names — prevents accidental duplicates
        const existing = await Category.findOne({ where: { name: name.trim(), userId: req.user.id } });
        if (existing) {
            return res.status(409).json({ success: false, error: { message: 'You already have a category with this name.' } });
        }

        const category = await Category.create({
            name: name.trim(),
            icon: icon || 'bi-tag',
            color: color || '#6B7280',
            userId: req.user.id,
            isDefault: false,
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

// Update a category — only the user's own custom categories can be edited
const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!category) {
            return res.status(404).json({ success: false, error: { message: 'Category not found or you do not have permission to edit it.' } });
        }

        const { name, icon, color, isHidden } = req.body;
        await category.update({
            name: name !== undefined ? name.trim() : category.name,
            icon: icon !== undefined ? icon : category.icon,
            color: color !== undefined ? color : category.color,
            isHidden: isHidden !== undefined ? isHidden : category.isHidden,
        });

        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

// Delete a custom category — only if no expenses are linked to it
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!category) {
            return res.status(404).json({ success: false, error: { message: 'Category not found or you do not have permission to delete it.' } });
        }

        // Protect data integrity — reassign expenses before deleting a category
        const expenseCount = await Expense.count({ where: { categoryId: req.params.id, userId: req.user.id } });
        if (expenseCount > 0) {
            return res.status(400).json({
                success: false,
                error: { message: `This category has ${expenseCount} expense(s) linked to it. Please reassign them before deleting.` },
            });
        }

        await category.destroy();
        res.json({ success: true, data: { message: 'Category deleted successfully.' } });
    } catch (error) {
        next(error);
    }
};

// Allow a user to hide a default category without deleting it
const hideCategory = async (req, res, next) => {
    try {
        // Default categories have userId: null so we look them up differently
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, error: { message: 'Category not found.' } });
        }

        await category.update({ isHidden: true });
        res.json({ success: true, data: { message: 'Category hidden.' } });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, hideCategory };
