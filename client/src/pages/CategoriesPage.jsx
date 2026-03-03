// CategoriesPage.jsx — view, add, edit, and delete custom expense categories
import { useState } from 'react';
import {
    Row, Col, Button, Modal, Form, Alert, Badge, Spinner,
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useCategories from '../hooks/useCategories';
import categoryService from '../services/categoryService';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';

// Curated bootstrap icon choices for category creation
const ICON_OPTIONS = [
    'bi-cup-hot', 'bi-bus-front', 'bi-house', 'bi-lightning',
    'bi-film', 'bi-bag', 'bi-heart-pulse', 'bi-book',
    'bi-scissors', 'bi-piggy-bank', 'bi-phone', 'bi-three-dots',
    'bi-cart', 'bi-airplane', 'bi-music-note', 'bi-bicycle',
    'bi-gift', 'bi-building', 'bi-tools', 'bi-wifi',
];

// CategoryForm — modal for creating or editing a category
const CategoryForm = ({ show, onHide, onSaved, editTarget }) => {
    const isEditing = Boolean(editTarget);
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { name: editTarget?.name || '', icon: editTarget?.icon || 'bi-tag', color: editTarget?.color || '#2563EB' },
    });

    const watchedIcon = watch('icon', editTarget?.icon || 'bi-tag');
    const watchedColor = watch('color', editTarget?.color || '#2563EB');

    const onSubmit = async (data) => {
        try {
            if (isEditing) {
                await categoryService.updateCategory(editTarget.id, data);
                toast.success('Category updated.');
            } else {
                await categoryService.createCategory(data);
                toast.success('Category created.');
            }
            onSaved();
            onHide();
            reset();
        } catch (err) {
            const msg = err.response?.data?.error?.message || 'Failed to save category.';
            toast.error(msg);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="fs-5 fw-semibold">
                    {isEditing ? 'Edit Category' : 'New Category'}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Body className="pt-3">
                    {/* Category name */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-medium">
                            Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            placeholder="e.g., Groceries"
                            isInvalid={!!errors.name}
                            {...register('name', { required: 'Category name is required.', maxLength: { value: 50, message: 'Name is too long.' } })}
                        />
                        <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                    </Form.Group>

                    {/* Color picker */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-medium">Color</Form.Label>
                        <div className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="color"
                                style={{ width: '48px', height: '38px', padding: '2px', borderRadius: '8px', cursor: 'pointer' }}
                                {...register('color')}
                            />
                            <span className="small" style={{ color: 'var(--text-secondary)' }}>
                                Pick a color used in charts and icons
                            </span>
                        </div>
                    </Form.Group>

                    {/* Icon picker */}
                    <Form.Group>
                        <Form.Label className="small fw-medium">Icon</Form.Label>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                            {ICON_OPTIONS.map((iconClass) => (
                                <label key={iconClass} style={{ cursor: 'pointer' }}>
                                    <input type="radio" value={iconClass} className="d-none" {...register('icon')} />
                                    <div
                                        style={{
                                            width: '38px', height: '38px', borderRadius: '8px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: watchedIcon === iconClass
                                                ? `2px solid ${watchedColor || '#2563EB'}`
                                                : '1px solid #E2E8F0',
                                            background: watchedIcon === iconClass ? `${watchedColor || '#2563EB'}15` : 'transparent',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <i
                                            className={`bi ${iconClass}`}
                                            style={{
                                                color: watchedIcon === iconClass ? watchedColor || '#2563EB' : '#64748B',
                                                fontSize: '1.1rem',
                                            }}
                                        />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0">
                    <Button variant="light" onClick={onHide} disabled={isSubmitting}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        className="d-flex align-items-center gap-2"
                        style={{ minWidth: '110px' }}
                    >
                        {isSubmitting && <Spinner size="sm" animation="border" />}
                        {isEditing ? 'Save Changes' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const CategoriesPage = () => {
    const { categories, loading, error, refetch } = useCategories();
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const customCategories = categories.filter((c) => !c.isDefault);
    const defaultCategories = categories.filter((c) => c.isDefault);

    const handleOpenAdd = () => { setEditTarget(null); setShowForm(true); };
    const handleOpenEdit = (cat) => { setEditTarget(cat); setShowForm(true); };
    const handleDeleteClick = (cat) => { setDeleteTarget(cat); setShowConfirm(true); };

    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await categoryService.deleteCategory(deleteTarget.id);
            toast.success('Category deleted.');
            refetch();
            setShowConfirm(false);
        } catch (err) {
            const msg = err.response?.data?.error?.message || 'Failed to delete category.';
            toast.error(msg);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Single row for the category list
    const CategoryRow = ({ cat }) => (
        <div
            className="d-flex align-items-center justify-content-between py-2"
            style={{ borderBottom: '1px solid var(--border-color)' }}
        >
            <div className="d-flex align-items-center gap-3">
                <div
                    style={{
                        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                        background: cat.color ? `${cat.color}20` : '#F1F5F9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <i className={`bi ${cat.icon || 'bi-tag'}`} style={{ color: cat.color || '#64748B', fontSize: '1rem' }} />
                </div>
                <div>
                    <span className="fw-medium small">{cat.name}</span>
                    {cat.isDefault && (
                        <Badge bg="light" text="secondary" className="ms-2" style={{ fontSize: '0.7rem' }}>
                            Default
                        </Badge>
                    )}
                </div>
            </div>
            <div className="d-flex align-items-center gap-1">
                {/* Show color swatch */}
                {cat.color && (
                    <span
                        title={cat.color}
                        style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            background: cat.color, display: 'inline-block', marginRight: '8px',
                            border: '1px solid #E2E8F0',
                        }}
                    />
                )}
                {!cat.isDefault && (
                    <>
                        <Button variant="link" size="sm" className="p-1 text-secondary" onClick={() => handleOpenEdit(cat)}>
                            <i className="bi bi-pencil" />
                        </Button>
                        <Button variant="link" size="sm" className="p-1 text-danger" onClick={() => handleDeleteClick(cat)}>
                            <i className="bi bi-trash" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <div className="page-header d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="page-title mb-0">Categories</h1>
                    <p className="page-subtitle mb-0">Manage your expense categories</p>
                </div>
                <Button variant="primary" size="sm" onClick={handleOpenAdd} className="d-flex align-items-center gap-1">
                    <i className="bi bi-plus-lg" /> New Category
                </Button>
            </div>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : (
                <Row className="g-4">
                    {/* Custom categories */}
                    <Col xs={12} lg={6}>
                        <div className="card" style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div className="card-body p-3 p-md-4">
                                <h6 className="fw-semibold mb-3">
                                    My Categories{' '}
                                    <Badge bg="primary" pill>{customCategories.length}</Badge>
                                </h6>
                                {customCategories.length === 0 ? (
                                    <EmptyState
                                        icon="bi-tags"
                                        title="No custom categories yet"
                                        message="Create your own categories to organise expenses your way."
                                        actionLabel="Add Category"
                                        onAction={handleOpenAdd}
                                    />
                                ) : (
                                    customCategories.map((cat) => <CategoryRow key={cat.id} cat={cat} />)
                                )}
                            </div>
                        </div>
                    </Col>

                    {/* Default system categories */}
                    <Col xs={12} lg={6}>
                        <div className="card" style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div className="card-body p-3 p-md-4">
                                <h6 className="fw-semibold mb-3">
                                    Default Categories{' '}
                                    <Badge bg="secondary" pill>{defaultCategories.length}</Badge>
                                </h6>
                                <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                                    These are system-provided categories available to all users. They cannot be deleted.
                                </p>
                                {defaultCategories.map((cat) => <CategoryRow key={cat.id} cat={cat} />)}
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            <CategoryForm
                show={showForm}
                onHide={() => setShowForm(false)}
                onSaved={refetch}
                editTarget={editTarget}
            />

            <ConfirmModal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message={
                    deleteTarget
                        ? `Delete the category "${deleteTarget.name}"? This will fail if expenses are still linked to it.`
                        : ''
                }
                loading={deleteLoading}
            />
        </div>
    );
};

export default CategoriesPage;
