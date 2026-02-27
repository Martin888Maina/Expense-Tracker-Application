// Centralized error handler — this must be the last piece of middleware registered in app.js.
// It catches errors thrown by any route handler or passed via next(error).
const errorHandler = (err, req, res, next) => {
    // Log the full stack in development so we can debug quickly
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // If we set a custom status code on the error, use it; otherwise default to 500
    let statusCode = err.statusCode || 500;
    let message = err.message || 'An unexpected error occurred';

    // Handle Sequelize validation errors — turn them into user-friendly 400 responses
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        const details = err.errors
            ? err.errors.map((e) => ({ field: e.path, message: e.message }))
            : [];
        return res.status(400).json({
            success: false,
            error: { message: 'Validation failed', details },
        });
    }

    // Zod validation errors come with a specific shape
    if (err.name === 'ZodError') {
        statusCode = 400;
        const details = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            error: { message: 'Validation failed', details },
        });
    }

    // Never expose internal error details to the client in production
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        message = 'An unexpected error occurred. Please try again later.';
    }

    res.status(statusCode).json({
        success: false,
        error: { message },
    });
};

module.exports = errorHandler;
