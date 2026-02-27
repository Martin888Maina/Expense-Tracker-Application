const { z } = require('zod');

// Validation schema for creating or updating an expense
const expenseSchema = z.object({
    amount: z
        .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
        .positive('Amount must be greater than zero'),

    description: z
        .string({ required_error: 'Description is required' })
        .min(1, 'Description cannot be empty')
        .max(200, 'Description cannot exceed 200 characters'),

    date: z
        .string({ required_error: 'Date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

    categoryId: z
        .string({ required_error: 'Category is required' })
        .uuid('Category ID must be a valid UUID'),

    paymentMethod: z
        .enum(['cash', 'mpesa', 'bank_transfer', 'card'])
        .optional()
        .default('cash'),

    notes: z
        .string()
        .max(500, 'Notes cannot exceed 500 characters')
        .optional()
        .nullable(),
});

// For updates, all fields are optional — only provided fields will be changed
const expenseUpdateSchema = expenseSchema.partial();

module.exports = { expenseSchema, expenseUpdateSchema };
