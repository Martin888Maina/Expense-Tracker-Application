import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch('password');

    const onSubmit = async (values) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/register', {
                name: values.name,
                email: values.email,
                password: values.password,
            });
            login(data.data.user, data.data.token);
            toast.success('Account created! Welcome aboard.');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo mb-1">
                    <i className="bi bi-piggy-bank-fill" />
                    <span>ExpenseTracker</span>
                </div>
                <p className="text-center mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Create your free account
                </p>

                {error && <Alert variant="danger" className="py-2">{error}</Alert>}

                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Full Name */}
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="John Doe"
                            {...register('name', {
                                required: 'Full name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                            })}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                    </Form.Group>

                    {/* Email */}
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="you@example.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                            })}
                            isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                    </Form.Group>

                    {/* Password */}
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                    pattern: { value: /(?=.*[A-Z])(?=.*[0-9])/, message: 'Must include 1 uppercase letter and 1 number' },
                                })}
                                isInvalid={!!errors.password}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword((p) => !p)}
                                tabIndex={-1}
                                style={{ borderColor: 'var(--border-color)' }}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                            </Button>
                            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    {/* Confirm Password */}
                    <Form.Group className="mb-4">
                        <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Repeat your password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (val) => val === password || 'Passwords do not match',
                            })}
                            isInvalid={!!errors.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Button
                        type="submit"
                        className="w-100"
                        style={{ background: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600 }}
                        disabled={loading}
                    >
                        {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </Form>

                <p className="text-center mt-3 mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
