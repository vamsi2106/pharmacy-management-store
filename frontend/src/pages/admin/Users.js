import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Card, Form, Row, Col, Modal } from 'react-bootstrap';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // In a real app, this would be an API call
                // const data = await userService.getAllUsers();

                // For now, using mock data
                const mockUsers = [
                    {
                        id: 1,
                        name: 'John Doe',
                        email: 'john.doe@example.com',
                        role: 'CUSTOMER',
                        status: 'ACTIVE',
                        createdAt: '2023-01-15',
                        lastLogin: '2023-04-10',
                        address: '123 Main St, City, State 12345'
                    },
                    {
                        id: 2,
                        name: 'Jane Smith',
                        email: 'jane.smith@example.com',
                        role: 'CUSTOMER',
                        status: 'ACTIVE',
                        createdAt: '2023-02-20',
                        lastLogin: '2023-04-05',
                        address: '456 Elm St, City, State 12345'
                    },
                    {
                        id: 3,
                        name: 'Admin User',
                        email: 'admin@example.com',
                        role: 'ADMIN',
                        status: 'ACTIVE',
                        createdAt: '2022-12-01',
                        lastLogin: '2023-04-12',
                        address: 'Admin Office, City, State 12345'
                    },
                    {
                        id: 4,
                        name: 'Pharmacist User',
                        email: 'pharmacist@example.com',
                        role: 'PHARMACIST',
                        status: 'ACTIVE',
                        createdAt: '2023-01-10',
                        lastLogin: '2023-04-11',
                        address: 'Pharmacy Dept, City, State 12345'
                    },
                    {
                        id: 5,
                        name: 'Blocked User',
                        email: 'blocked@example.com',
                        role: 'CUSTOMER',
                        status: 'BLOCKED',
                        createdAt: '2023-03-05',
                        lastLogin: '2023-03-15',
                        address: '789 Oak St, City, State 12345'
                    }
                ];

                setTimeout(() => {
                    setUsers(mockUsers);
                    setLoading(false);
                }, 500);

            } catch (err) {
                setError('Failed to load users. Please try again later.');
                console.error('Error fetching users:', err);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleUpdateRole = (userId, newRole) => {
        // In a real app, this would be an API call
        setUsers(users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
        ));
    };

    const handleUpdateStatus = (userId, newStatus) => {
        // In a real app, this would be an API call
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: newStatus } : user
        ));
    };

    const handleViewDetails = (user) => {
        setCurrentUser(user);
        setShowDetailsModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole ? user.role === filterRole : true;

        return matchesSearch && matchesRole;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN':
                return <Badge bg="danger">Admin</Badge>;
            case 'PHARMACIST':
                return <Badge bg="info">Pharmacist</Badge>;
            case 'DOCTOR':
                return <Badge bg="primary">Doctor</Badge>;
            case 'CUSTOMER':
                return <Badge bg="success">Customer</Badge>;
            default:
                return <Badge bg="secondary">{role}</Badge>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge bg="success">Active</Badge>;
            case 'BLOCKED':
                return <Badge bg="danger">Blocked</Badge>;
            case 'PENDING':
                return <Badge bg="warning" text="dark">Pending</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">User Management</h1>

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-0">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-0">
                                <Form.Select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="PHARMACIST">Pharmacist</option>
                                    <option value="DOCTOR">Doctor</option>
                                    <option value="CUSTOMER">Customer</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{getRoleBadge(user.role)}</td>
                                        <td>{getStatusBadge(user.status)}</td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleViewDetails(user)}
                                            >
                                                View
                                            </Button>

                                            <Form.Select
                                                size="sm"
                                                className="d-inline-block w-auto me-2"
                                                value={user.status}
                                                onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="BLOCKED">Blocked</option>
                                                <option value="PENDING">Pending</option>
                                            </Form.Select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* User Details Modal */}
            <Modal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentUser && (
                        <div>
                            <p><strong>ID:</strong> {currentUser.id}</p>
                            <p><strong>Name:</strong> {currentUser.name}</p>
                            <p><strong>Email:</strong> {currentUser.email}</p>
                            <p><strong>Role:</strong> {currentUser.role}</p>
                            <p><strong>Status:</strong> {currentUser.status}</p>
                            <p><strong>Created:</strong> {formatDate(currentUser.createdAt)}</p>
                            <p><strong>Last Login:</strong> {formatDate(currentUser.lastLogin)}</p>
                            <p><strong>Address:</strong> {currentUser.address}</p>

                            <hr />

                            <Form.Group className="mb-3">
                                <Form.Label>Role</Form.Label>
                                <Form.Select
                                    value={currentUser.role}
                                    onChange={(e) => {
                                        setCurrentUser({ ...currentUser, role: e.target.value });
                                        handleUpdateRole(currentUser.id, e.target.value);
                                    }}
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="PHARMACIST">Pharmacist</option>
                                    <option value="DOCTOR">Doctor</option>
                                    <option value="CUSTOMER">Customer</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={currentUser.status}
                                    onChange={(e) => {
                                        setCurrentUser({ ...currentUser, status: e.target.value });
                                        handleUpdateStatus(currentUser.id, e.target.value);
                                    }}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="BLOCKED">Blocked</option>
                                    <option value="PENDING">Pending</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => setShowDetailsModal(false)}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Users; 