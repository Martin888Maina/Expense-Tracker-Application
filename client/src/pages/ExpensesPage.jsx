// ExpensesPage.jsx — full expense management page: list, filters, add/edit/delete
import { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import useExpenses from '../hooks/useExpenses';
import useCategories from '../hooks/useCategories';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ConfirmModal from '../components/common/ConfirmModal';

const ExpensesPage = () => {
    const {
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
    } = useExpenses();

    const { categories } = useCategories();

    // Controls visibility of the add/edit modal
    const [showForm, setShowForm] = useState(false);

    // The expense currently being edited (null when adding a new one)
    const [editTarget, setEditTarget] = useState(null);

    // Controls visibility of the delete confirmation modal
    const [showConfirm, setShowConfirm] = useState(false);

    // The expense marked for deletion — used to populate the confirm modal message
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Track whether a bulk delete is pending so the confirm modal wording changes
    const [pendingBulkIds, setPendingBulkIds] = useState(null);

    const [deleteLoading, setDeleteLoading] = useState(false);

    // Open the form modal in "add" mode
    const handleOpenAdd = () => {
        setEditTarget(null);
        setShowForm(true);
    };

    // Open the form modal in "edit" mode pre-loaded with the selected expense
    const handleOpenEdit = (expense) => {
        setEditTarget(expense);
        setShowForm(true);
    };

    // Show confirmation before deleting a single expense
    const handleDeleteClick = (expense) => {
        setDeleteTarget(expense);
        setPendingBulkIds(null);
        setShowConfirm(true);
    };

    // Show confirmation before bulk-deleting a list of expense IDs
    const handleBulkDeleteClick = (ids) => {
        setDeleteTarget(null);
        setPendingBulkIds(ids);
        setShowConfirm(true);
    };

    // Execute the confirmed deletion
    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        try {
            if (pendingBulkIds) {
                await bulkRemove(pendingBulkIds);
            } else if (deleteTarget) {
                await removeExpense(deleteTarget.id);
            }
            setShowConfirm(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Submit handler passed to ExpenseForm — delegates to add or edit based on editTarget
    const handleFormSubmit = async (data) => {
        if (editTarget) {
            await editExpense(editTarget.id, data);
        } else {
            await addExpense(data);
        }
    };

    // Build a human-readable message for the confirm modal
    const confirmMessage = pendingBulkIds
        ? `You are about to permanently delete ${pendingBulkIds.length} selected expense(s). This action cannot be undone.`
        : deleteTarget
            ? `Delete "${deleteTarget.description}" (${new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
            }).format(deleteTarget.amount)}) from ${new Date(deleteTarget.date).toLocaleDateString(
                'en-KE',
                { day: '2-digit', month: 'short', year: 'numeric' }
            )}? This cannot be undone.`
            : '';

    return (
        <div>
            {/* Page header */}
            <div className="page-header d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="page-title mb-0">Expenses</h1>
                    <p className="page-subtitle mb-0">Track and manage your spending</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    {/* CSV export button */}
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={exportCSV}
                        title="Export filtered expenses as CSV"
                        className="d-none d-sm-inline-flex align-items-center gap-1"
                    >
                        <i className="bi bi-download" />
                        Export CSV
                    </Button>

                    {/* Primary add-expense button */}
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleOpenAdd}
                        className="d-flex align-items-center gap-1"
                    >
                        <i className="bi bi-plus-lg" />
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Error alert — shown if the API request fails */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2" />
                    {error}
                </Alert>
            )}

            {/* Filter controls */}
            <ExpenseFilters
                filters={filters}
                onFilter={applyFilters}
                onClear={clearFilters}
                categories={categories}
            />

            {/* Expense table card */}
            <div
                className="card"
                style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
            >
                <div className="card-body p-3 p-md-4">
                    <ExpenseList
                        expenses={expenses}
                        pagination={pagination}
                        loading={loading}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteClick}
                        onBulkDelete={handleBulkDeleteClick}
                        onPageChange={goToPage}
                        onAddExpense={handleOpenAdd}
                    />
                </div>
            </div>

            {/* Add / Edit modal */}
            <ExpenseForm
                show={showForm}
                onHide={() => setShowForm(false)}
                onSubmit={handleFormSubmit}
                expense={editTarget}
                categories={categories}
            />

            {/* Delete confirmation modal */}
            <ConfirmModal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                onConfirm={handleConfirmDelete}
                title={pendingBulkIds ? 'Delete Selected Expenses' : 'Delete Expense'}
                message={confirmMessage}
                loading={deleteLoading}
            />
        </div>
    );
};

export default ExpensesPage;
