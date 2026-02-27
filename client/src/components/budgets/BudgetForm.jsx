// BudgetForm.jsx — modal for creating or editing a budget for a category
import { useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const PERIODS = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

// Auto-calculate the end date from a start date and period string
const getEndDate = (startDate, period) => {
    if (!startDate) return '';
    const d = new Date(startDate);
    if (period === 'weekly') d.setDate(d.getDate() + 6);
    else if (period === 'monthly') d.setMonth(d.getMonth() + 1, 0); // last day of the month
    else if (period === 'yearly') d.setFullYear(d.getFullYear() + 1, 0, 0);
    return d.toISOString().slice(0, 10);
};

// Get the first day of the current month as default start date
const defaultStart = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const BudgetForm = ({ show, onHide, onSubmit, budget, categories }) => {
    const isEditing = Boolean(budget);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            amount: '',
            categoryId: '',
            period: 'monthly',
            startDate: defaultStart(),
        },
    });

    const watchedPeriod = watch('period');
    const watchedStart = watch('startDate');

    // Populate the form when editing an existing budget
    useEffect(() => {
        if (budget) {
            reset({
                amount: budget.amount,
                categoryId: budget.categoryId,
                period: budget.period || 'monthly',
                startDate: budget.startDate?.slice(0, 10) || defaultStart(),
            });
        } else {
            reset({
                amount: '',
                categoryId: '',
                period: 'monthly',
                startDate: defaultStart(),
            });
        }
    }, [budget, reset, show]);

    const computedEndDate = getEndDate(watchedStart, watchedPeriod);

    const handleFormSubmit = async (data) => {
        await onSubmit({
            ...data,
            amount: parseFloat(data.amount),
            endDate: computedEndDate,
        });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" size="md">
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="fs-5 fw-semibold">
                    {isEditing ? 'Edit Budget' : 'Create Budget'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                <Modal.Body className="pt-3">
                    <Row className="g-3">
                        {/* Category selection */}
                        <Col xs={12}>
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

                        {/* Budget amount */}
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">
                                    Budget Amount (KES) <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    placeholder="e.g. 10000"
                                    isInvalid={!!errors.amount}
                                    {...register('amount', {
                                        required: 'Budget amount is required.',
                                        min: { value: 1, message: 'Amount must be at least KES 1.' },
                                    })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.amount?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Period selector */}
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">Period</Form.Label>
                                <Form.Select {...register('period')}>
                                    {PERIODS.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Start date */}
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    {...register('startDate', { required: 'Start date is required.' })}
                                />
                            </Form.Group>
                        </Col>

                        {/* Auto-computed end date (read-only) */}
                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium">End Date (auto)</Form.Label>
                                <Form.Control type="date" value={computedEndDate} readOnly disabled />
                                <Form.Text muted>Calculated from start date and period</Form.Text>
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
                        style={{ minWidth: '110px' }}
                    >
                        {isSubmitting && <Spinner size="sm" animation="border" />}
                        {isEditing ? 'Save Changes' : 'Create Budget'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default BudgetForm;
