import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = () => {
            try {
                setLoading(true);

                // Try to get order from localStorage first
                const orderData = localStorage.getItem(`order_${id}`);

                if (orderData) {
                    setOrder(JSON.parse(orderData));
                    setError(null);
                } else {
                    // If not found by specific ID, try the general selectedOrder key
                    const selectedOrderData = localStorage.getItem('selectedOrder');

                    if (selectedOrderData) {
                        const parsedOrder = JSON.parse(selectedOrderData);
                        if (parsedOrder.id === parseInt(id)) {
                            setOrder(parsedOrder);
                            setError(null);
                        } else {
                            setError('Order not found or has been removed.');
                        }
                    } else {
                        setError('Order details not found. Please go back to the orders list.');
                    }
                }
            } catch (e) {
                console.error('Error retrieving order details:', e);
                setError('Failed to load order details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            return format(new Date(dateString), 'PPpp');
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateString;
        }
    };

    const getStatusBadge = (status) => {
        let variant;
        switch (status) {
            case 'PENDING':
                variant = 'warning';
                break;
            case 'CONFIRMED':
                variant = 'info';
                break;
            case 'PREPARING':
                variant = 'primary';
                break;
            case 'SHIPPED':
                variant = 'success';
                break;
            case 'DELIVERED':
                variant = 'dark';
                break;
            case 'CANCELLED':
                variant = 'danger';
                break;
            default:
                variant = 'secondary';
        }
        return <Badge bg={variant}>{status}</Badge>;
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
                    <Button variant="primary" onClick={() => navigate('/orders')}>
                        Back to Orders
                    </Button>
                </div>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container className="py-5">
                <Alert variant="warning">Order information could not be retrieved.</Alert>
                <div className="text-center mt-3">
                    <Button variant="primary" onClick={() => navigate('/orders')}>
                        Back to Orders
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Order Details</h2>
                <Button variant="outline-secondary" as={Link} to="/orders">
                    Back to Orders
                </Button>
            </div>

            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Order #{order.id}</h5>
                        {getStatusBadge(order.status)}
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-4">
                        <Col md={6}>
                            <h6 className="text-muted">Order Information</h6>
                            <p><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
                            <p><strong>Status:</strong> {getStatusBadge(order.status)}</p>
                            <p><strong>Total:</strong> ${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</p>
                        </Col>
                        <Col md={6}>
                            <h6 className="text-muted">Shipping Information</h6>
                            <p><strong>Address:</strong> {order.shippingAddress || 'Not available'}</p>
                            {order.contactNumber && <p><strong>Contact:</strong> {order.contactNumber}</p>}
                            {order.trackingNumber && (
                                <p>
                                    <strong>Tracking Number:</strong>{' '}
                                    <Badge bg="info">{order.trackingNumber}</Badge>
                                </p>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">Order Items</h5>
                </Card.Header>
                <Table responsive className="mb-0">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th className="text-end">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems && order.orderItems.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="d-flex align-items-center">
                                        {item.product?.imageUrl && (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="me-2"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                        )}
                                        <div>
                                            <div className="fw-bold">{item.product?.name || 'Unknown Product'}</div>
                                            {item.product?.requiresPrescription && (
                                                <Badge bg="warning" text="dark" className="me-1">
                                                    Prescription
                                                </Badge>
                                            )}
                                            <small className="text-muted d-block">
                                                {item.product?.category || 'Uncategorized'}
                                            </small>
                                        </div>
                                    </div>
                                </td>
                                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                                <td>{item.quantity}</td>
                                <td className="text-end">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-group-divider">
                        <tr>
                            <td colSpan="3" className="text-end fw-bold">
                                Total:
                            </td>
                            <td className="text-end fw-bold">
                                ${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
                            </td>
                        </tr>
                    </tfoot>
                </Table>
            </Card>

            <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" as={Link} to="/orders">
                    Back to Orders
                </Button>
                {(order.status === 'SHIPPED' || order.status === 'PROCESSING') && (
                    <Button as={Link} to={`/orders/${order.id}/track`} variant="outline-success">
                        Track Order
                    </Button>
                )}
            </div>
        </Container>
    );
};

export default OrderDetail; 