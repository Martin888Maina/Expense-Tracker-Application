// ExpenseList.jsx — paginated table of expenses with sort, bulk select, edit, and delete
import { useState } from 'react';
import {
    Table,
    Button,
    Badge,
    Pagination,
    Form,
    Spinner,
} from 'react-bootstrap';
import EmptyState from '../common/EmptyState';

// Map payment method keys to Bootstrap badge colors
const PAYMENT_BADGE = {
    cash: 'secondary',
    mpesa: 'success',
    bank_transfer: 'info',
    card: 'primary',
};

// Map payment method keys to readable labels
const PAYMENT_LABEL = {
    cash: 'Cash',
    mpesa: 'M-Pesa',
    bank_transfer: 'Bank Transfer',
    card: 'Card',
};

// Format a date string into a short, readable format
const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Format a number as a Kenya Shilling amount
const formatAmount = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);

const ExpenseList = ({
    expenses,
    pagination,
    loading,
    onEdit,
    onDelete,
    onBulkDelete,
    onPageChange,
    onAddExpense,
}) => {
    const [selected, setSelected] = useState([]);

    // Toggle selection of a single row
    const toggleRow = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Toggle all rows on the current page
    const toggleAll = () => {
        if (selected.length === expenses.length) {
            setSelected([]);
        } else {
            setSelected(expenses.map((e) => e.id));
        }
    };

    const handleBulkDelete = () => {
        if (selected.length > 0) {
            onBulkDelete(selected);
            setSelected([]);
        }
    };

    // Build pagination page numbers, showing a window around the current page
    const buildPages = () => {
        const { page, totalPages } = pagination;
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = [];
        const delta = 2;
        const left = Math.max(2, page - delta);
        const right = Math.min(totalPages - 1, page + delta);
        pages.push(1);
        if (left > 2) pages.push('...');
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages - 1) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 small" style={{ color: 'var(--text-secondary)' }}>
                    Loading expenses...
                </p>
            </div>
        );
    }

    if (!loading && expenses.length === 0) {
        return (
            <EmptyState
                icon="bi-receipt"
                title="No expenses found"
                message="Try adjusting your filters, or add your first expense."
                actionLabel="Add Expense"
                onAction={onAddExpense}
            />
        );
    }

    return (
        <div>
            {/* Bulk action toolbar — only visible when rows are selected */}
            {selected.length > 0 && (
                <div
                    className="d-flex align-items-center justify-content-between p-2 mb-2 rounded"
                    style={{ background: 'var(--primary-light, #EFF6FF)', border: '1px solid #BFDBFE' }}
                >
                    <span className="small fw-medium" style={{ color: '#1D4ED8' }}>
                        {selected.length} expense{selected.length > 1 ? 's' : ''} selected
                    </span>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={handleBulkDelete}
                    >
                        <i className="bi bi-trash me-1" />
                        Delete Selected
                    </Button>
                </div>
            )}

            {/* Expenses table */}
            <div className="table-responsive">
                <Table hover className="mb-0" style={{ fontSize: '0.875rem' }}>
                    <thead style={{ background: 'var(--bg-secondary, #F8FAFC)' }}>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <Form.Check
                                    type="checkbox"
                                    checked={selected.length === expenses.length && expenses.length > 0}
                                    onChange={toggleAll}
                                    aria-label="Select all expenses on this page"
                                />
                            </th>
                            <th style={{ width: '110px' }}>Date</th>
                            <th>Description</th>
                            <th style={{ width: '150px' }}>Category</th>
                            <th style={{ width: '130px' }}>Payment</th>
                            <th style={{ width: '120px', textAlign: 'right' }}>Amount</th>
                            <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense) => {
                            const category = expense.category || {};
                            return (
                                <tr
                                    key={expense.id}
                                    style={selected.includes(expense.id) ? { background: '#F0F9FF' } : {}}
                                >
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={selected.includes(expense.id)}
                                            onChange={() => toggleRow(expense.id)}
                                            aria-label={`Select expense: ${expense.description}`}
                                        />
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                        {formatDate(expense.date)}
                                    </td>
                                    <td>
                                        <div className="fw-medium">{expense.description}</div>
                                        {expense.notes && (
                                            <div
                                                className="small text-truncate"
                                                style={{ color: 'var(--text-secondary)', maxWidth: '220px' }}
                                            >
                                                {expense.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="d-flex align-items-center gap-1">
                                            {/* Category color dot */}
                                            <span
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: category.color || '#999',
                                                    display: 'inline-block',
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {category.name || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge
                                            bg={PAYMENT_BADGE[expense.paymentMethod] || 'secondary'}
                                            className="fw-normal"
                                        >
                                            {PAYMENT_LABEL[expense.paymentMethod] || expense.paymentMethod}
                                        </Badge>
                                    </td>
                                    <td
                                        style={{
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            fontVariantNumeric: 'tabular-nums',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {formatAmount(expense.amount)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="p-1 text-secondary"
                                            title="Edit expense"
                                            onClick={() => onEdit(expense)}
                                        >
                                            <i className="bi bi-pencil" />
                                        </Button>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="p-1 text-danger"
                                            title="Delete expense"
                                            onClick={() => onDelete(expense)}
                                        >
                                            <i className="bi bi-trash" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

            {/* Pagination footer */}
            {pagination.totalPages > 1 && (
                <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
                    <small style={{ color: 'var(--text-secondary)' }}>
                        Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </small>
                    <Pagination size="sm" className="mb-0">
                        <Pagination.Prev
                            disabled={pagination.page === 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                        />
                        {buildPages().map((p, i) =>
                            p === '...' ? (
                                <Pagination.Ellipsis key={`ellipsis-${i}`} disabled />
                            ) : (
                                <Pagination.Item
                                    key={p}
                                    active={p === pagination.page}
                                    onClick={() => onPageChange(p)}
                                >
                                    {p}
                                </Pagination.Item>
                            )
                        )}
                        <Pagination.Next
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => onPageChange(pagination.page + 1)}
                        />
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
