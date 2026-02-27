// reportService.js — handles API calls to report and analytics endpoints
import api from './api';

// Fetch the monthly summary: total spent, today's total, top category, daily average
const getSummary = (params = {}) => {
    return api.get('/reports/summary', { params });
};

// Fetch spending breakdown grouped by category
const getByCategory = (params = {}) => {
    return api.get('/reports/by-category', { params });
};

// Fetch daily or weekly spending trend data for line charts
const getTrends = (params = {}) => {
    return api.get('/reports/trends', { params });
};

// Fetch month-over-month comparison data per category
const getComparison = (params = {}) => {
    return api.get('/reports/comparison', { params });
};

const reportService = {
    getSummary,
    getByCategory,
    getTrends,
    getComparison,
};

export default reportService;
