import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Badge, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { format } from 'date-fns';
import orderService from '../services/orderService';
import api from '../utils/apiInterceptor';
import { ORDER_ENDPOINTS } from '../config/apiConfig';

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingCachedData, setUsingCachedData] = useState(false);

    // Get cached orders
    const getCachedOrders = () => {
        try {
            const allOrdersString = localStorage.getItem('allOrders');
            if (!allOrdersString) return null;

            return JSON.parse(allOrdersString);
        } catch (e) {
            console.error('Error retrieving cached orders:', e);
            return null;
        }
    };

    // Cache all orders
    const cacheOrders = (ordersData) => {
        try {
            localStorage.setItem('allOrders', JSON.stringify(ordersData));

            // Also cache individual orders for the order detail page
            const cachedOrdersString = localStorage.getItem('cachedOrders');
            let cachedOrders = cachedOrdersString ? JSON.parse(cachedOrdersString) : {};

            // Add each order to the individual cache
            ordersData.forEach(order => {
                cachedOrders[order.id] = order;
            });

            localStorage.setItem('cachedOrders', JSON.stringify(cachedOrders));
        } catch (e) {
            console.error('Error caching orders:', e);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setUsingCachedData(false);
            console.log('Fetching user orders...');

            // Check for cached data first
            const cachedOrders = getCachedOrders();

            // Direct API call
            try {
                const response = await api.get('/api/orders/my-orders');
                console.log('Direct API response:', response.data);

                if (response && response.data) {
                    const ordersData = response.data || [];
                    setOrders(ordersData);
                    setError(null);

                    // Cache the data for future use
                    if (ordersData.length > 0) {
                        cacheOrders(ordersData);
                    }
                } else if (cachedOrders) {
                    // If API returns empty but we have cached data
                    console.log('Using cached orders data');
                    setOrders(cachedOrders);
                    setUsingCachedData(true);
                    setError(null);
                } else {
                    setOrders([]);
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching orders:', err);

                // If we have cached data, use it instead of showing an error
                if (cachedOrders) {
                    console.log('API call failed. Using cached orders.');
                    setOrders(cachedOrders);
                    setUsingCachedData(true);
                    setError(null);
                } else {
                    setError(`Failed to load orders: ${err.message || 'Unknown error'}`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleRefresh = () => {
        fetchOrders();
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PROCESSING': return 'info';
            case 'SHIPPED': return 'primary';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            return format(new Date(dateString), 'PP');
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateString;
        }
    };

    // Function to store order details for viewing
    const storeOrderForDetails = (order) => {
        try {
            // Simply store the complete order JSON in localStorage with a simple key
            localStorage.setItem('selectedOrder', JSON.stringify(order));
            console.log(`Stored order:`, order);

            // Also store specifically by ID for direct access
            localStorage.setItem(`order_${order.id}`, JSON.stringify(order));
        } catch (e) {
            console.error('Error storing order details:', e);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <div className="text-center mt-3">
                    <Button variant="primary" onClick={handleRefresh}>
                        Try Again
                    </Button>
                </div>
            </Container>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Container className="py-5">
                <Card className="text-center p-5 shadow-sm">
                    <Card.Body>
                        <h4>No Orders Found</h4>
                        <p className="text-muted">You haven't placed any orders yet.</p>
                        <Button as={Link} to="/products" variant="primary">
                            Browse Products
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Orders</h2>
                <Button variant="outline-primary" onClick={handleRefresh}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </Button>
            </div>

            {usingCachedData && (
                <Alert variant="info" className="mb-4">
                    <strong>Note:</strong> Showing cached data. Some information may not be up to date.
                </Alert>
            )}

            <Card className="shadow-sm">
                <Table responsive hover className="mb-0">
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
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="fw-bold text-decoration-none"
                                        onClick={() => storeOrderForDetails(order)}
                                    >
                                        #{order.id}
                                    </Link>
                                </td>
                                <td>{formatDate(order.orderDate)}</td>
                                <td>${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</td>
                                <td>
                                    <Badge bg={getStatusVariant(order.status)}>
                                        {order.status}
                                    </Badge>
                                </td>
                                <td>{order.orderItems ? order.orderItems.length : 0} item(s)</td>
                                <td>
                                    <Button
                                        as={Link}
                                        to={`/orders/${order.id}`}
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => storeOrderForDetails(order)}
                                    >
                                        Details
                                    </Button>
                                    {(order.status === 'SHIPPED' || order.status === 'PROCESSING') && (
                                        <Button
                                            as={Link}
                                            to={`/orders/${order.id}/track`}
                                            variant="outline-success"
                                            size="sm"
                                        >
                                            Track
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
};

export default OrdersList; 