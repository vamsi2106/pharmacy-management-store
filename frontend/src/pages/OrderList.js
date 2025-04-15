import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import orderService from '../services/orderService';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                // In a real application, we would call the API
                // const response = await orderService.getOrders();

                // For this example, we'll use mock data
                const mockOrders = [
                    {
                        id: 1001,
                        orderDate: "2023-11-15T14:30:00",
                        total: 35.97,
                        status: "DELIVERED",
                        items: [
                            { productName: "Aspirin", quantity: 2, price: 5.99 },
                            { productName: "Vitamin C", quantity: 3, price: 8.99 }
                        ]
                    },
                    {
                        id: 1002,
                        orderDate: "2023-11-20T10:15:00",
                        total: 42.50,
                        status: "PROCESSING",
                        items: [
                            { productName: "Ibuprofen", quantity: 1, price: 7.50 },
                            { productName: "Face Mask", quantity: 5, price: 7.00 }
                        ]
                    },
                    {
                        id: 1003,
                        orderDate: "2023-11-25T16:45:00",
                        total: 89.95,
                        status: "SHIPPED",
                        items: [
                            { productName: "Blood Pressure Monitor", quantity: 1, price: 89.95 }
                        ]
                    }
                ];

                // Simulate API delay
                setTimeout(() => {
                    setOrders(mockOrders);
                    setLoading(false);
                }, 500);

            } catch (err) {
                setError('Failed to load orders. Please try again.');
                setLoading(false);
                console.error('Error fetching orders:', err);
            }
        };

        fetchOrders();
    }, []);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'PROCESSING':
                return 'info';
            case 'SHIPPED':
                return 'primary';
            case 'DELIVERED':
                return 'success';
            case 'CANCELLED':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading your orders...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button
                    variant="primary"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </Container>
        );
    }

    if (orders.length === 0) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <i className="bi bi-bag" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                    <h3 className="mt-3">No Orders Yet</h3>
                    <p className="text-muted">
                        You haven't placed any orders yet. Start shopping to place your first order!
                    </p>
                    <Button
                        as={Link}
                        to="/products"
                        variant="primary"
                    >
                        Browse Products
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="mb-4">My Orders</h1>

            <div className="table-responsive">
                <Table striped hover className="align-middle">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{formatDate(order.orderDate)}</td>
                                <td>${order.total.toFixed(2)}</td>
                                <td>
                                    <Badge bg={getStatusBadgeVariant(order.status)}>
                                        {order.status}
                                    </Badge>
                                </td>
                                <td>{order.items.length} items</td>
                                <td>
                                    <Button
                                        as={Link}
                                        to={`/orders/${order.id}`}
                                        variant="outline-primary"
                                        size="sm"
                                    >
                                        View Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default OrderList; 