// ExpenseForm.jsx — modal form for adding or editing a single expense
import { useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';

// Payment method options used in Kenya
const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'card', label: 'Card' },
];

// Format a Date object to the YYYY-MM-DD string expected by HTML date inputs
const toDateInputValue = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
};

const ExpenseForm = ({ show, onHide, onSubmit, expense, categories }) => {
    const isEditing = Boolean(expense);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            amount: '',
            description: '',
            categoryId: '',
            date: toDateInputValue(new Date()),
            paymentMethod: 'cash',
            notes: '',
        },
    });

    // When editing, populate the form with the selected expense's values
    useEffect(() => {
        if (expense) {
            reset({
                amount: expense.amount,
                description: expense.description,
                categoryId: expense.categoryId,
                date: toDateInputValue(expense.date),
                paymentMethod: expense.paymentMethod || 'cash',
                notes: expense.notes || '',
            });
        } else {
            reset({
                amount: '',
                description: '',
                categoryId: '',
                date: toDateInputValue(new Date()),
                paymentMethod: 'cash',
                notes: '',
            });
        }
    }, [expense, reset, show]);

    const handleFormSubmit = async (data) => {
        // Convert the string amount to a number before sending to the API
        await onSubmit({
            ...data,
            amount: parseFloat(data.amount),
        });
        onHide();
    };

    // Today's date in YYYY-MM-DD format — used to prevent selecting future dates
    const today = toDateInputValue(new Date());

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" size="md">
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="fs-5 fw-semibold">
                    {isEditing ? 'Edit Expense' : 'Add New Expense'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                <Modal.Body className="pt-3">
                    <Row className="g-3">
                        {/* Amount input */}
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">
                                    Amount (KES) <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    isInvalid={!!errors.amount}
                                    {...register('amount', {
                                        required: 'Amount is required.',
                                        min: { value: 0.01, message: 'Amount must be greater than zero.' },
                                    })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.amount?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Date picker — cannot select a future date */}
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">
                                    Date <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    max={today}
                                    isInvalid={!!errors.date}
                                    {...register('date', { required: 'Date is required.' })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.date?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Description field */}
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">
                                    Description <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., Grocery shopping at Naivas"
                                    maxLength={200}
                                    isInvalid={!!errors.description}
                                    {...register('description', {
                                        required: 'Description is required.',
                                        maxLength: { value: 200, message: 'Description is too long.' },
                                    })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.description?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Category dropdown */}
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">
                                    Category <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    isInvalid={!!errors.categoryId}
                                    {...register('categoryId', { required: 'Please select a category.' })}
                                >
                                    <option value="">-- Select category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.categoryId?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Payment method dropdown */}
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">Payment Method</Form.Label>
                                <Form.Select {...register('paymentMethod')}>
                                    {PAYMENT_METHODS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Optional notes textarea */}
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">Notes (optional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Any additional details..."
                                    maxLength={500}
                                    {...register('notes')}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0">
                    <Button variant="light" onClick={onHide} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        className="d-flex align-items-center gap-2"
                        style={{ minWidth: '100px' }}
                    >
                        {isSubmitting && <Spinner size="sm" animation="border" />}
                        {isEditing ? 'Save Changes' : 'Add Expense'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ExpenseForm;
