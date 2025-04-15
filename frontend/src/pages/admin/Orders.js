import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { format } from 'date-fns';
import orderService from '../../services/orderService';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAllOrders();
            setOrders(data);
            setFilteredOrders(data);
            setError(null);
        } catch (err) {
            setError('Failed to load orders. Please try again later.');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter orders when status filter changes
    useEffect(() => {
        if (statusFilter) {
            setFilteredOrders(orders.filter(order => order.status === statusFilter));
        } else {
            setFilteredOrders(orders);
        }
    }, [statusFilter, orders]);

    const handleViewDetails = (order) => {
        setCurrentOrder(order);
        setNewStatus(order.status);
        setShowDetailsModal(true);
    };

    const handleUpdateStatus = async () => {
        try {
            await orderService.updateOrderStatus(currentOrder.id, newStatus);

            // Update orders in state
            const updatedOrders = orders.map(order =>
                order.id === currentOrder.id
                    ? { ...order, status: newStatus }
                    : order
            );

            setOrders(updatedOrders);
            setShowDetailsModal(false);
            alert(`Order #${currentOrder.id} status updated to ${newStatus}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update order status');
            console.error('Error updating order status:', err);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'CONFIRMED':
                return <Badge bg="info">Confirmed</Badge>;
            case 'PREPARING':
                return <Badge bg="primary">Preparing</Badge>;
            case 'SHIPPED':
                return <Badge bg="success">Shipped</Badge>;
            case 'DELIVERED':
                return <Badge bg="dark">Delivered</Badge>;
            case 'CANCELLED':
                return <Badge bg="danger">Cancelled</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMM dd, yyyy, h:mm a');
    };

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Order Management</h1>

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Filter by Status</Form.Label>
                                <Form.Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Orders</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PREPARING">Preparing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="d-flex align-items-end">
                            <Button
                                variant="outline-primary"
                                className="w-100"
                                onClick={fetchOrders}
                            >
                                Refresh Orders
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table striped hover>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center">No orders found</td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>#{order.id}</td>
                                                <td>{order.user?.name || 'Unknown User'}</td>
                                                <td>{formatDate(order.orderDate)}</td>
                                                <td>${parseFloat(order.totalPrice).toFixed(2)}</td>
                                                <td>{getStatusBadge(order.status)}</td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        View / Update
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Order Details Modal */}
            <Modal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Order Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentOrder && (
                        <div>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <p><strong>Order ID:</strong> #{currentOrder.id}</p>
                                    <p><strong>Customer:</strong> {currentOrder.user?.name || 'Unknown User'}</p>
                                    <p><strong>Date:</strong> {formatDate(currentOrder.orderDate)}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Total:</strong> ${parseFloat(currentOrder.totalPrice).toFixed(2)}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(currentOrder.status)}</p>
                                    <p><strong>Shipping Address:</strong> {currentOrder.shippingAddress}</p>
                                </Col>
                            </Row>

                            <h5>Order Items</h5>
                            <Table striped size="sm" className="mb-4">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrder.orderItems?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.product?.name || `Product #${item.product?.id}`}</td>
                                            <td>${parseFloat(item.price).toFixed(2)}</td>
                                            <td>{item.quantity}</td>
                                            <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                        <td><strong>${parseFloat(currentOrder.totalPrice).toFixed(2)}</strong></td>
                                    </tr>
                                </tfoot>
                            </Table>

                            <h5>Update Status</h5>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="PREPARING">Preparing</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </Form.Select>
                                </Form.Group>
                            </Form>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateStatus}
                        disabled={currentOrder && currentOrder.status === newStatus}
                    >
                        Update Status
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Orders; 