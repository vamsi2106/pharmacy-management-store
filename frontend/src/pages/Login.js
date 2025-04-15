import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../utils/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Get the previous location (if any) to redirect after login
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate inputs
        if (!email.trim() || !password.trim()) {
            setErrorMessage('Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            const response = await login(email, password);
            console.log('Login successful, redirecting to:', from);

            // Add a slight delay to ensure localStorage is updated
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 100);
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(
                error.response?.data?.message ||
                error.message ||
                'Failed to login. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    <Card className="shadow auth-form my-5">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4 form-heading">Login</h2>

                            {errorMessage && (
                                <Alert variant="danger">{errorMessage}</Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={loading}>
                                        {loading ? 'Logging in...' : 'Login'}
                                    </Button>
                                </div>

                                <div className="text-center mt-3">
                                    <p>
                                        Don't have an account? <Link to="/register">Register</Link>
                                    </p>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login; 