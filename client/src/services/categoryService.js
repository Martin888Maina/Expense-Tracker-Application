// categoryService.js — handles API calls for expense categories
import api from './api';

// Fetch all categories available to the current user (default + custom)
const getCategories = () => {
    return api.get('/categories');
};

// Create a new custom category
const createCategory = (data) => {
    return api.post('/categories', data);
};

// Update an existing custom category by ID
const updateCategory = (id, data) => {
    return api.put(`/categories/${id}`, data);
};

// Delete a custom category by ID — only works if no expenses are linked to it
const deleteCategory = (id) => {
    return api.delete(`/categories/${id}`);
};

// Hide a default category so it no longer appears in the user's lists
const hideCategory = (id) => {
    return api.patch(`/categories/${id}/hide`);
};

const categoryService = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    hideCategory,
};

export default categoryService;
