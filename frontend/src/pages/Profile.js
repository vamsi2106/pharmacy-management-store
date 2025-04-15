import React, { useState, useContext, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../utils/AuthContext';
import api from '../utils/apiInterceptor';

const Profile = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        contactNumber: '',
        address: ''
    });

    useEffect(() => {
        if (currentUser) {
            // Initialize form with current user data
            setProfileData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                contactNumber: currentUser.contactNumber || '',
                address: currentUser.address || ''
            });
        }
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await api.put('/api/users/me', profileData);
            setSuccess(true);
            setProfileData(response.data);

            // Update any cached user data if needed
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData) {
                localStorage.setItem('user', JSON.stringify({
                    ...userData,
                    ...response.data
                }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            console.error('Error updating profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    You need to be logged in to view your profile.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4">User Profile</h1>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Profile updated successfully!</Alert>}

            <Row>
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body className="text-center">
                            <div className="mb-3">
                                <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                                    style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                                >
                                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </div>
                            <h5>{profileData.name}</h5>
                            <p className="text-muted">{profileData.email}</p>
                            <p className="mb-1">
                                <strong>Role:</strong> {currentUser.role || 'Customer'}
                            </p>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Account Actions</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button as="a" href="/orders" variant="outline-primary">
                                    View Orders
                                </Button>
                                <Button as="a" href="/prescriptions" variant="outline-primary">
                                    View Prescriptions
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    onClick={logout}
                                >
                                    Logout
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Edit Profile</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleInputChange}
                                        required
                                        disabled
                                    />
                                    <Form.Text className="text-muted">
                                        Email address cannot be changed.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="contactNumber"
                                        value={profileData.contactNumber}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="address"
                                        value={profileData.address}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />{' '}
                                            Updating...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile; 