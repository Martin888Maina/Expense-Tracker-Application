// ConfirmModal.jsx — reusable modal for confirming destructive actions like deletes
import { Modal, Button, Spinner } from 'react-bootstrap';

const ConfirmModal = ({
    show,
    onHide,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmLabel = 'Delete',
    loading = false,
}) => {
    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                    {message}
                </p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="light" onClick={onHide} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    disabled={loading}
                    className="d-flex align-items-center gap-2"
                >
                    {loading && <Spinner size="sm" animation="border" />}
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
