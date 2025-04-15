import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../utils/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            // Remove confirmPassword from data sent to API
            const { confirmPassword, ...registrationData } = formData;
            await register(registrationData);
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to register account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow auth-form my-5">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4 form-heading">Create an Account</h2>

                            {errorMessage && (
                                <Alert variant="danger">{errorMessage}</Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formPassword">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                minLength={6}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formConfirmPassword">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="Confirm password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                minLength={6}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="formContactNumber">
                                    <Form.Label>Contact Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="contactNumber"
                                        placeholder="Enter your contact number"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formAddress">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="address"
                                        rows={3}
                                        placeholder="Enter your address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={loading}>
                                        {loading ? 'Registering...' : 'Register'}
                                    </Button>
                                </div>

                                <div className="text-center mt-3">
                                    <p>
                                        Already have an account? <Link to="/login">Login</Link>
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

export default Register; 