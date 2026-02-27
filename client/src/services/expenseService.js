// expenseService.js — handles all API calls related to expense records
import api from './api';

// Build a query string from a filters object, skipping empty values
const buildParams = (filters = {}) => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            params[key] = value;
        }
    });
    return params;
};

// Fetch a paginated, filtered list of expenses
const getExpenses = (page = 1, limit = 15, filters = {}) => {
    return api.get('/expenses', {
        params: { page, limit, ...buildParams(filters) },
    });
};

// Fetch a single expense record by its ID
const getExpenseById = (id) => {
    return api.get(`/expenses/${id}`);
};

// Create a new expense entry
const createExpense = (data) => {
    return api.post('/expenses', data);
};

// Update an existing expense by ID
const updateExpense = (id, data) => {
    return api.put(`/expenses/${id}`, data);
};

// Delete a single expense by ID
const deleteExpense = (id) => {
    return api.delete(`/expenses/${id}`);
};

// Delete multiple expenses at once using an array of IDs
const bulkDeleteExpenses = (ids) => {
    return api.delete('/expenses/bulk', { data: { ids } });
};

// Export filtered expenses as a CSV file and trigger browser download
const exportExpensesCSV = async (filters = {}) => {
    const response = await api.get('/expenses/export/csv', {
        params: buildParams(filters),
        responseType: 'blob',
    });

    // Create a temporary anchor element to trigger the file download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `expense-tracker-expenses-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const expenseService = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    exportExpensesCSV,
};

export default expenseService;
