// useBudgets.js — custom hook for managing budget list state and CRUD actions
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import budgetService from '../services/budgetService';

const useBudgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBudgets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await budgetService.getBudgets();
            setBudgets(response.data.data || []);
        } catch (err) {
            setError('Failed to load budgets.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const addBudget = async (data) => {
        try {
            const response = await budgetService.createBudget(data);
            toast.success('Budget created successfully.');
            await fetchBudgets();
            return response.data.data;
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to create budget.';
            toast.error(message);
            throw err;
        }
    };

    const editBudget = async (id, data) => {
        try {
            const response = await budgetService.updateBudget(id, data);
            toast.success('Budget updated.');
            await fetchBudgets();
            return response.data.data;
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to update budget.';
            toast.error(message);
            throw err;
        }
    };

    const removeBudget = async (id) => {
        try {
            await budgetService.deleteBudget(id);
            toast.success('Budget deleted.');
            await fetchBudgets();
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to delete budget.';
            toast.error(message);
            throw err;
        }
    };

    return {
        budgets,
        loading,
        error,
        addBudget,
        editBudget,
        removeBudget,
        refresh: fetchBudgets,
    };
};

export default useBudgets;
