// Helper utilities for calculating date ranges used in reports and budget queries
const { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths, format, parseISO } = require('date-fns');

// Return the start and end dates for the current month
const getCurrentMonthRange = () => {
    const now = new Date();
    return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    };
};

// Return the start and end dates for the previous month
const getPreviousMonthRange = () => {
    const prevMonth = subMonths(new Date(), 1);
    return {
        startDate: format(startOfMonth(prevMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(prevMonth), 'yyyy-MM-dd'),
    };
};

// Given a period string, calculate the corresponding date range for a budget
const getDateRangeForPeriod = (period, referenceDate = new Date()) => {
    switch (period) {
        case 'weekly':
            return {
                startDate: format(startOfWeek(referenceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                endDate: format(endOfWeek(referenceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            };
        case 'yearly':
            return {
                startDate: format(startOfYear(referenceDate), 'yyyy-MM-dd'),
                endDate: format(endOfYear(referenceDate), 'yyyy-MM-dd'),
            };
        case 'monthly':
        default:
            return {
                startDate: format(startOfMonth(referenceDate), 'yyyy-MM-dd'),
                endDate: format(endOfMonth(referenceDate), 'yyyy-MM-dd'),
            };
    }
};

module.exports = { getCurrentMonthRange, getPreviousMonthRange, getDateRangeForPeriod };
