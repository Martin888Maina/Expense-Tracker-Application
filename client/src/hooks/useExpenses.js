// useExpenses.js — custom hook for managing expense list state and actions
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import expenseService from '../services/expenseService';

// Default filter state — all fields blank means no filtering applied
const DEFAULT_FILTERS = {
    search: '',
    categoryId: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
};

const useExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 1,
    });
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch expenses whenever page or filters change
    const fetchExpenses = useCallback(async (page = 1, activeFilters = filters) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expenseService.getExpenses(page, pagination.limit, activeFilters);
            const { data, meta } = response.data;
            setExpenses(data);
            setPagination((prev) => ({
                ...prev,
                page: meta.page,
                total: meta.total,
                totalPages: meta.totalPages,
            }));
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to load expenses.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit]);

    useEffect(() => {
        fetchExpenses(1, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Navigate to a specific page in the paginated list
    const goToPage = (page) => {
        fetchExpenses(page, filters);
    };

    // Apply a new set of filters and reset back to page 1
    const applyFilters = (newFilters) => {
        setFilters(newFilters);
    };

    // Clear all active filters and reload the full list
    const clearFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    // Create a new expense and prepend it to the current list
    const addExpense = async (data) => {
        try {
            const response = await expenseService.createExpense(data);
            toast.success('Expense added successfully.');
            // Refresh the list so pagination totals stay accurate
            await fetchExpenses(1, filters);
            return response.data.data;
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to add expense.';
            toast.error(message);
            throw err;
        }
    };

    // Update an existing expense and refresh the current page
    const editExpense = async (id, data) => {
        try {
            const response = await expenseService.updateExpense(id, data);
            toast.success('Expense updated successfully.');
            await fetchExpenses(pagination.page, filters);
            return response.data.data;
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to update expense.';
            toast.error(message);
            throw err;
        }
    };

    // Delete a single expense by ID
    const removeExpense = async (id) => {
        try {
            await expenseService.deleteExpense(id);
            toast.success('Expense deleted.');
            // If we just deleted the last item on this page, step back one page
            const newPage = expenses.length === 1 && pagination.page > 1
                ? pagination.page - 1
                : pagination.page;
            await fetchExpenses(newPage, filters);
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to delete expense.';
            toast.error(message);
            throw err;
        }
    };

    // Delete multiple expenses at once
    const bulkRemove = async (ids) => {
        try {
            await expenseService.bulkDeleteExpenses(ids);
            toast.success(`${ids.length} expense(s) deleted.`);
            await fetchExpenses(1, filters);
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to delete expenses.';
            toast.error(message);
            throw err;
        }
    };

    // Export filtered expense data as a CSV file
    const exportCSV = async () => {
        try {
            await expenseService.exportExpensesCSV(filters);
            toast.success('Export downloaded.');
        } catch (err) {
            toast.error('Failed to export expenses.');
        }
    };

    return {
        expenses,
        pagination,
        filters,
        loading,
        error,
        goToPage,
        applyFilters,
        clearFilters,
        addExpense,
        editExpense,
        removeExpense,
        bulkRemove,
        exportCSV,
        refresh: () => fetchExpenses(pagination.page, filters),
    };
};

export default useExpenses;
