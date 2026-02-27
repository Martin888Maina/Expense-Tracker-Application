// useDashboard.js — custom hook that loads all data needed by the Dashboard page
import { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import expenseService from '../services/expenseService';

const useDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [categoryData, setCategoryData] = useState([]);
    const [trendsData, setTrendsData] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fire all requests in parallel to keep load time down
            const [summaryRes, categoryRes, trendsRes, recentRes] = await Promise.all([
                reportService.getSummary(),
                reportService.getByCategory(),
                reportService.getTrends(),
                // Fetch just the last 5 expenses for the recent transactions list
                expenseService.getExpenses(1, 5, {}),
            ]);

            setSummary(summaryRes.data.data);
            setCategoryData(categoryRes.data.data || []);
            setTrendsData(trendsRes.data.data || []);
            setRecentExpenses(recentRes.data.data || []);
        } catch (err) {
            setError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return {
        summary,
        categoryData,
        trendsData,
        recentExpenses,
        loading,
        error,
        refresh: fetchAll,
    };
};

export default useDashboard;
