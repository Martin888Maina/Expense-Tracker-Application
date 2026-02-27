// BudgetsPage.jsx — full budget management page with cards, summary bar, and form
import { useState } from 'react';
import { Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import useBudgets from '../hooks/useBudgets';
import useCategories from '../hooks/useCategories';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetForm from '../components/budgets/BudgetForm';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';

const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

const BudgetsPage = () => {
    const { budgets, loading, error, addBudget, editBudget, removeBudget } = useBudgets();
    const { categories } = useCategories();

    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleOpenAdd = () => {
        setEditTarget(null);
        setShowForm(true);
    };

    const handleOpenEdit = (budget) => {
        setEditTarget(budget);
        setShowForm(true);
    };

    const handleDeleteClick = (budget) => {
        setDeleteTarget(budget);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await removeBudget(deleteTarget.id);
            setShowConfirm(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleFormSubmit = async (data) => {
        if (editTarget) {
            await editBudget(editTarget.id, data);
        } else {
            await addBudget(data);
        }
    };

    // Calculate summary totals across all active budgets
    const totalBudgeted = budgets.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent || 0), 0);
    const totalRemaining = totalBudgeted - totalSpent;

    return (
        <div>
            {/* Page header */}
            <div className="page-header d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="page-title mb-0">Budgets</h1>
                    <p className="page-subtitle mb-0">Set and monitor your spending limits</p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAdd}
                    className="d-flex align-items-center gap-1"
                >
                    <i className="bi bi-plus-lg" />
                    New Budget
                </Button>
            </div>

            {/* Error state */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2" />
                    {error}
                </Alert>
            )}

            {/* Summary bar — visible only when there are budgets */}
            {budgets.length > 0 && (
                <div
                    className="card mb-4"
                    style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
                >
                    <div className="card-body p-3">
                        <Row className="g-2 text-center">
                            <Col xs={4}>
                                <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                                    Total Budgeted
                                </p>
                                <p
                                    className="fw-bold mb-0"
                                    style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}
                                >
                                    {formatKES(totalBudgeted)}
                                </p>
                            </Col>
                            <Col xs={4}>
                                <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                                    Total Spent
                                </p>
                                <p
                                    className="fw-bold mb-0"
                                    style={{ fontVariantNumeric: 'tabular-nums', color: '#DC2626' }}
                                >
                                    {formatKES(totalSpent)}
                                </p>
                            </Col>
                            <Col xs={4}>
                                <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                                    Remaining
                                </p>
                                <p
                                    className="fw-bold mb-0"
                                    style={{
                                        fontVariantNumeric: 'tabular-nums',
                                        color: totalRemaining >= 0 ? '#16A34A' : '#DC2626',
                                    }}
                                >
                                    {formatKES(Math.abs(totalRemaining))}
                                    {totalRemaining < 0 ? ' over' : ''}
                                </p>
                            </Col>
                        </Row>
                    </div>
                </div>
            )}

            {/* Budget cards grid */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 small" style={{ color: 'var(--text-secondary)' }}>
                        Loading budgets...
                    </p>
                </div>
            ) : budgets.length === 0 ? (
                <EmptyState
                    icon="bi-wallet2"
                    title="No budgets set"
                    message="Create your first budget to start tracking your spending limits."
                    actionLabel="Create Budget"
                    onAction={handleOpenAdd}
                />
            ) : (
                <Row className="g-3">
                    {budgets.map((budget) => (
                        <Col key={budget.id} xs={12} sm={6} xl={4}>
                            <BudgetCard
                                budget={budget}
                                onEdit={handleOpenEdit}
                                onDelete={handleDeleteClick}
                            />
                        </Col>
                    ))}
                </Row>
            )}

            {/* Create / Edit modal */}
            <BudgetForm
                show={showForm}
                onHide={() => setShowForm(false)}
                onSubmit={handleFormSubmit}
                budget={editTarget}
                categories={categories}
            />

            {/* Delete confirmation modal */}
            <ConfirmModal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Budget"
                message={
                    deleteTarget
                        ? `Delete the budget for "${deleteTarget.category?.name || 'this category'}"? This action cannot be undone.`
                        : ''
                }
                loading={deleteLoading}
            />
        </div>
    );
};

export default BudgetsPage;
