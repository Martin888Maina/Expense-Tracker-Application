// Category controller — full implementation is in Commit 2.
const getCategories = (req, res) => res.json({ success: true, data: [] });
const createCategory = (req, res) => res.status(201).json({ success: true, data: {} });
const updateCategory = (req, res) => res.json({ success: true, data: {} });
const deleteCategory = (req, res) => res.json({ success: true, data: { message: 'Deleted' } });

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
