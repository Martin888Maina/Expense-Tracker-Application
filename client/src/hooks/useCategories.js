// useCategories.js — custom hook for fetching and caching the user's category list
import { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';

const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryService.getCategories();
            setCategories(response.data.data || []);
        } catch (err) {
            setError('Failed to load categories.');
        } finally {
            setLoading(false);
        }
    };

    // Load categories once when the hook is first used
    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, loading, error, refetch: fetchCategories };
};

export default useCategories;
