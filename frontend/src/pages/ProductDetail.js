import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Breadcrumb } from 'react-bootstrap';
import { AuthContext } from '../utils/AuthContext';
import productService from '../services/productService';
import cartService from '../services/cartService';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getProductById(id);
                setProduct(data);
            } catch (err) {
                setError('Error loading product details. Please try again.');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!currentUser) {
            navigate('/login', { state: { from: location } });
            return;
        }

        if (product.requiresPrescription) {
            handlePrescriptionUpload();
            return;
        }

        try {
            // Use cartService to add to cart through the API
            await cartService.addToCart(product.id, quantity);

            // Show success message
            setShowAlert(true);

            // Hide alert after 3 seconds
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add item to cart');
            console.error('Error adding item to cart:', err);
        }
    };

    const handlePrescriptionUpload = () => {
        navigate(`/prescriptions/upload?productId=${product.id}`);
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

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button as={Link} to="/products" variant="primary">
                    Back to Products
                </Button>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container className="py-5">
                <Alert variant="warning">Product not found</Alert>
                <Button as={Link} to="/products" variant="primary">
                    Back to Products
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/products' }}>Products</Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/products/category/${product.category}` }}>
                    {product.category}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
            </Breadcrumb>

            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    Product added to cart successfully!
                </Alert>
            )}

            <Row className="mt-4">
                <Col md={5}>
                    <Card>
                        <Card.Img
                            variant="top"
                            src={product.imageUrl || "https://via.placeholder.com/500"}
                            alt={product.name}
                            className="p-3"
                        />
                    </Card>
                </Col>

                <Col md={7}>
                    <h2>{product.name}</h2>

                    <div className="mb-3">
                        <span className="text-muted">{product.category}</span>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                        <h3 className="text-primary me-3">${product.price}</h3>
                        {product.stock > 0 ? (
                            <Badge bg="success">In Stock</Badge>
                        ) : (
                            <Badge bg="danger">Out of Stock</Badge>
                        )}

                        {product.requiresPrescription && (
                            <Badge bg="warning" text="dark" className="ms-2">
                                Requires Prescription
                            </Badge>
                        )}
                    </div>

                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Description</Card.Title>
                            <Card.Text>{product.description}</Card.Text>
                        </Card.Body>
                    </Card>

                    {product.stock > 0 && (
                        <Form className="mb-4">
                            <Form.Group as={Row} className="mb-3" controlId="quantity">
                                <Form.Label column sm={3}>Quantity:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        as="select"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    >
                                        {[...Array(Math.min(10, product.stock)).keys()].map(i => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>
                                <Col sm={5}>
                                    <small className="text-muted">{product.stock} available</small>
                                </Col>
                            </Form.Group>
                        </Form>
                    )}

                    <div className="d-grid gap-2">
                        {product.requiresPrescription ? (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handlePrescriptionUpload}
                            >
                                Upload Prescription
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                            >
                                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        )}

                        <Button
                            variant="outline-primary"
                            as={Link}
                            to="/products"
                        >
                            Continue Shopping
                        </Button>
                    </div>

                    {product.requiresPrescription && (
                        <Alert variant="info" className="mt-4">
                            <Alert.Heading>Prescription Required</Alert.Heading>
                            <p>
                                This medication requires a valid prescription from your doctor.
                                Please upload your prescription before placing an order.
                            </p>
                        </Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetail; 