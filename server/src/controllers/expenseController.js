// Expense controller — full implementation is in Commit 2.
// Stubs are defined here so that the server can start without errors during Commit 1.

const getExpenses = (req, res) => res.json({ success: true, data: [], meta: {} });
const createExpense = (req, res) => res.status(201).json({ success: true, data: {} });
const getExpense = (req, res) => res.json({ success: true, data: {} });
const updateExpense = (req, res) => res.json({ success: true, data: {} });
const deleteExpense = (req, res) => res.json({ success: true, data: { message: 'Deleted' } });
const bulkDeleteExpenses = (req, res) => res.json({ success: true, data: { message: 'Deleted' } });
const exportExpensesCSV = (req, res) => res.json({ success: true, data: {} });

module.exports = { getExpenses, createExpense, getExpense, updateExpense, deleteExpense, bulkDeleteExpenses, exportExpensesCSV };
