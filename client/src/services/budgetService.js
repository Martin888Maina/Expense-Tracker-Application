// budgetService.js — handles API calls for budget records
import api from './api';

// Fetch all budgets for the current user, including live spending percentages
const getBudgets = () => {
    return api.get('/budgets');
};

// Fetch a single budget with its detailed spending breakdown
const getBudgetById = (id) => {
    return api.get(`/budgets/${id}`);
};

// Create a new budget for a category and period
const createBudget = (data) => {
    return api.post('/budgets', data);
};

// Update an existing budget by ID
const updateBudget = (id, data) => {
    return api.put(`/budgets/${id}`, data);
};

// Delete a budget by ID
const deleteBudget = (id) => {
    return api.delete(`/budgets/${id}`);
};

const budgetService = {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
};

export default budgetService;
