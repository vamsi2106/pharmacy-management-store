import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Table } from 'react-bootstrap';
import { AuthContext } from '../utils/AuthContext';
import cartService from '../services/cartService';
import productService from '../services/productService';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        fetchCartItems();
    }, [currentUser]);

    const fetchCartItems = async () => {
        try {
            setLoading(true);

            if (!currentUser) {
                setCartItems([]);
                setTotal(0);
                setLoading(false);
                return;
            }

            // Get cart from API
            console.log('Fetching cart data from API...');
            const response = await cartService.getCart();
            console.log('Cart data received:', response);
            setCartItems(response.items || []);
            setTotal(response.total || 0);
        } catch (err) {
            setError('Failed to load cart items. Please try again.');
            console.error('Error loading cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (productId, quantity) => {
        try {
            // Update cart item via API
            await cartService.updateCartItem(productId, quantity);

            // Refresh cart
            const response = await cartService.getCart();
            setCartItems(response.items || []);
            setTotal(response.total || 0);
        } catch (err) {
            setError('Failed to update cart. Please try again.');
            console.error('Error updating cart:', err);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            // Remove cart item via API
            await cartService.removeFromCart(productId);

            // Refresh cart
            const response = await cartService.getCart();
            setCartItems(response.items || []);
            setTotal(response.total || 0);
        } catch (err) {
            setError('Failed to remove item from cart. Please try again.');
            console.error('Error removing item from cart:', err);
        }
    };

    const handleClearCart = async () => {
        try {
            // Clear cart via API
            await cartService.clearCart();

            // Reset cart state
            setCartItems([]);
            setTotal(0);
        } catch (err) {
            setError('Failed to clear cart. Please try again.');
            console.error('Error clearing cart:', err);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            return;
        }

        // Check if there are prescription items
        const hasPrescriptionItems = cartItems.some(
            item => item.product.requiresPrescription
        );

        if (hasPrescriptionItems) {
            // Redirect to prescription upload if needed
            navigate('/prescriptions/upload');
        } else {
            // Go to checkout
            navigate('/checkout');
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Your Shopping Cart</h1>
                <Button variant="outline-secondary" onClick={fetchCartItems}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </Button>
            </div>

            {error && (
                <Alert variant="danger">{error}</Alert>
            )}

            {cartItems.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <div className="mb-4">
                            <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                        </div>
                        <h3>Your cart is empty</h3>
                        <p className="text-muted">Looks like you haven't added any products to your cart yet.</p>
                        <Button as={Link} to="/products" variant="primary" className="mt-3">
                            Continue Shopping
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    <Row>
                        <Col lg={8}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Subtotal</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr key={item.product.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={item.product.imageUrl || "https://via.placeholder.com/50"}
                                                                alt={item.product.name}
                                                                style={{ width: '50px', marginRight: '10px' }}
                                                            />
                                                            <div>
                                                                <div>{item.product.name}</div>
                                                                <small className="text-muted">{item.product.category}</small>
                                                                {item.product.requiresPrescription && (
                                                                    <div>
                                                                        <span className="badge bg-warning text-dark">
                                                                            Requires Prescription
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${item.product.price}</td>
                                                    <td style={{ width: '120px' }}>
                                                        <Form.Control
                                                            as="select"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.product.id, Number(e.target.value))}
                                                            disabled={item.product.stock <= 0}
                                                        >
                                                            {[...Array(Math.min(10, item.product.stock)).keys()].map(i => (
                                                                <option key={i + 1} value={i + 1}>
                                                                    {i + 1}
                                                                </option>
                                                            ))}
                                                        </Form.Control>
                                                    </td>
                                                    <td>${item.subtotal.toFixed(2)}</td>
                                                    <td>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item.product.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>

                            <div className="d-flex justify-content-between mb-4">
                                <Button as={Link} to="/products" variant="outline-primary">
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Continue Shopping
                                </Button>
                                <Button variant="outline-danger" onClick={handleClearCart}>
                                    <i className="bi bi-trash me-2"></i>
                                    Clear Cart
                                </Button>
                            </div>
                        </Col>

                        <Col lg={4}>
                            <Card className="mb-4">
                                <Card.Header className="bg-primary text-white">
                                    <h5 className="mb-0">Order Summary</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span>Subtotal</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span>Shipping</span>
                                        <span>${(5).toFixed(2)}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <strong>Total</strong>
                                        <strong>${(total + 5).toFixed(2)}</strong>
                                    </div>

                                    <div className="d-grid">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleCheckout}
                                            disabled={cartItems.length === 0}
                                        >
                                            Proceed to Checkout
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Body>
                                    <h5>Have a Prescription?</h5>
                                    <p>If any of your medications require a prescription, you'll need to upload it before checkout.</p>
                                    <div className="d-grid">
                                        <Button
                                            as={Link}
                                            to="/prescriptions/upload"
                                            variant="outline-primary"
                                        >
                                            Upload Prescription
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default Cart; 