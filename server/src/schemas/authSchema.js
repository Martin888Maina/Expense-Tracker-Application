const { z } = require('zod');

// Validation schema for user registration
const registerSchema = z.object({
    name: z
        .string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),

    email: z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Validation schema for user login — intentionally simpler than registration
const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password cannot be empty'),
});

// Validation schema for changing password
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'New password must contain at least one number'),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
