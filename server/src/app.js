require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers — helmet sets sensible HTTP response headers
app.use(helmet());

// Allow cross-origin requests from our React frontend only
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // allow cookies to be sent with requests
}));

// Parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies from incoming requests (used for JWT httpOnly cookies)
app.use(cookieParser());

// Log HTTP requests in development — helpful when debugging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Apply a stricter rate limit on authentication routes to slow down brute-force attempts
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10,
    message: { success: false, error: { message: 'Too many requests. Please try again in a minute.' } },
});

// Mount route handlers
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);

// Simple health check endpoint so we can verify the API is running
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Expense Tracker API is running', timestamp: new Date().toISOString() });
});

// Handle requests to routes that don't exist
app.use('*', (req, res) => {
    res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

// Centralized error handler — must be registered last
app.use(errorHandler);

module.exports = app;
