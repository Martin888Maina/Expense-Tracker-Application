// Budget controller — full implementation is in Commit 2.
const getBudgets = (req, res) => res.json({ success: true, data: [] });
const createBudget = (req, res) => res.status(201).json({ success: true, data: {} });
const getBudget = (req, res) => res.json({ success: true, data: {} });
const updateBudget = (req, res) => res.json({ success: true, data: {} });
const deleteBudget = (req, res) => res.json({ success: true, data: { message: 'Deleted' } });

module.exports = { getBudgets, createBudget, getBudget, updateBudget, deleteBudget };
