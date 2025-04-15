import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, ListGroup } from 'react-bootstrap';
import { AuthContext } from '../utils/AuthContext';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import cartService from '../services/cartService';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

    // Credit card details
    const [cardNumber, setCardNumber] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                // Get cart items from the cart service
                const cartData = await cartService.getCart();
                setCartItems(cartData.items);

                // Calculate total
                const subtotal = cartData.items.reduce(
                    (sum, item) => sum + (item.product.price * item.quantity),
                    0
                );
                const shipping = 5;
                setTotal(subtotal + shipping);

                // Set shipping address from user profile if available
                if (currentUser && currentUser.address) {
                    setShippingAddress(currentUser.address);
                }
            } catch (err) {
                console.error('Error fetching cart data:', err);
                setError('Failed to load cart data. Please try again.');
            }
        };

        fetchCartData();
    }, [currentUser]);

    const validateForm = () => {
        if (!shippingAddress.trim()) {
            setError('Please enter a shipping address');
            return false;
        }

        if (paymentMethod === 'CREDIT_CARD') {
            if (!cardNumber.trim() || !cardholderName.trim() || !expiryDate.trim() || !cvv.trim()) {
                setError('Please enter all credit card details');
                return false;
            }

            // Basic validation for card details
            if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
                setError('Please enter a valid 16-digit card number');
                return false;
            }

            if (!/^\d{3,4}$/.test(cvv)) {
                setError('Please enter a valid CVV');
                return false;
            }
        }

        return true;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 1. Create order
            const orderItems = cartItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }));

            // Get any prescription ID from localStorage if needed
            const prescriptionId = localStorage.getItem('prescriptionId');

            const orderRequest = {
                shippingAddress,
                items: orderItems
            };

            // Add prescription ID if available
            if (prescriptionId) {
                orderRequest.prescriptionId = parseInt(prescriptionId, 10);
            }

            // Create the order
            const orderResponse = await orderService.createOrder(orderRequest);
            console.log('Order created successfully:', orderResponse);

            // Save order ID first thing - very important!
            const createdOrderId = orderResponse.id;
            console.log('Created order ID:', createdOrderId);

            if (!createdOrderId) {
                throw new Error('Order created but no order ID was returned');
            }

            // Cache the order data for the order detail page
            try {
                const cachedOrdersString = localStorage.getItem('cachedOrders');
                const cachedOrders = cachedOrdersString ? JSON.parse(cachedOrdersString) : {};
                cachedOrders[createdOrderId] = orderResponse;
                localStorage.setItem('cachedOrders', JSON.stringify(cachedOrders));
                console.log('Order cached for later use');
            } catch (cacheError) {
                console.error('Error caching order:', cacheError);
            }

            setOrderId(createdOrderId);
            localStorage.setItem('lastOrderId', createdOrderId);

            // 2. Process payment
            const paymentRequest = {
                orderId: createdOrderId,
                amount: total,
                paymentMethod: paymentMethod,
                // Only include card details for relevant payment methods
                ...(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD' ? {
                    cardNumber: cardNumber.replace(/\s/g, ''),
                    cardHolderName: cardholderName,
                    expiryDate: expiryDate,
                    cvv: cvv
                } : {})
            };

            const paymentResponse = await paymentService.processPayment(paymentRequest);
            console.log('Payment processed successfully:', paymentResponse);

            // Clear cart and prescription ID after successful order
            await cartService.clearCart();
            localStorage.removeItem('prescriptionId');

            // Set order placed first before trying to navigate
            setOrderPlaced(true);

            // Show success message directly here without redirecting
            return; // Important! Don't continue to the navigation code below

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
            console.error('Error placing order:', err);
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <Container className="py-5">
                <Card className="text-center">
                    <Card.Body className="py-5">
                        <div className="mb-4">
                            <i className="bi bi-check-circle" style={{ fontSize: '4rem', color: '#198754' }}></i>
                        </div>
                        <h2>Order Placed Successfully!</h2>
                        <p className="text-muted">
                            Thank you for your order. Your order number is <strong>{orderId}</strong>.
                        </p>
                        <p>
                            You will receive an email confirmation shortly with your order details.
                        </p>
                        <div className="mt-4">
                            <Button
                                as={Link}
                                to={`/orders/${orderId}`}
                                variant="primary"
                                className="me-2"
                                onClick={() => { console.log('Navigating to order details, ID:', orderId) }}
                            >
                                View Order
                            </Button>
                            <Button as={Link} to="/orders" variant="outline-primary" className="me-2">
                                See All Orders
                            </Button>
                            <Button as={Link} to="/products" variant="outline-secondary">
                                Continue Shopping
                            </Button>
                        </div>
                        <div className="mt-3 text-muted small">
                            <p>Order ID: {orderId}</p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="mb-4">Checkout</h1>

            {error && (
                <Alert variant="danger">{error}</Alert>
            )}

            <Row>
                <Col lg={8}>
                    {/* Shipping Address */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Shipping Address</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter your complete shipping address"
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Payment Method */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Payment Method</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="CREDIT_CARD">Credit Card</option>
                                    <option value="DEBIT_CARD">Debit Card</option>
                                    <option value="PAYPAL">PayPal</option>
                                    <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                                </Form.Select>
                            </Form.Group>

                            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                                <div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Card Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Cardholder Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="John Doe"
                                            value={cardholderName}
                                            onChange={(e) => setCardholderName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Expiry Date</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    value={expiryDate}
                                                    onChange={(e) => setExpiryDate(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>CVV</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="123"
                                                    value={cvv}
                                                    onChange={(e) => setCvv(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {paymentMethod === 'PAYPAL' && (
                                <div className="text-center">
                                    <p>You will be redirected to PayPal to complete your payment after placing your order.</p>
                                </div>
                            )}

                            {paymentMethod === 'CASH_ON_DELIVERY' && (
                                <div className="text-center">
                                    <p>You will pay in cash when your order is delivered.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    {/* Order Summary */}
                    <Card className="mb-4">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">Order Summary</h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {cartItems.map((item) => (
                                    <ListGroup.Item key={item.product.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div>{item.product.name}</div>
                                            <small className="text-muted">
                                                ${item.product.price} x {item.quantity}
                                            </small>
                                        </div>
                                        <span>${item.subtotal.toFixed(2)}</span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <hr />

                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>${(total - 5).toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <span>Shipping</span>
                                <span>$5.00</span>
                            </div>

                            <div className="d-flex justify-content-between mt-3">
                                <strong>Total</strong>
                                <strong>${total.toFixed(2)}</strong>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Place Order Button */}
                    <div className="d-grid gap-2">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handlePlaceOrder}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </Button>
                        <Button
                            as={Link}
                            to="/cart"
                            variant="outline-secondary"
                            disabled={loading}
                        >
                            Back to Cart
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Checkout; 