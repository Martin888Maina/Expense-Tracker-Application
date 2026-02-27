const { z } = require('zod');

// Validation schema for creating or updating a budget
const budgetSchema = z.object({
    categoryId: z
        .string({ required_error: 'Category is required' })
        .uuid('Category ID must be a valid UUID'),

    amount: z
        .number({ required_error: 'Budget amount is required', invalid_type_error: 'Amount must be a number' })
        .positive('Budget amount must be greater than zero'),

    period: z
        .enum(['weekly', 'monthly', 'yearly'])
        .default('monthly'),

    startDate: z
        .string({ required_error: 'Start date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),

    endDate: z
        .string({ required_error: 'End date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
});

const budgetUpdateSchema = budgetSchema.partial();

module.exports = { budgetSchema, budgetUpdateSchema };
