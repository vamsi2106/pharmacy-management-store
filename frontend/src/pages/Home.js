import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([
        { name: 'Painkillers', image: 'https://via.placeholder.com/300', slug: 'painkillers' },
        { name: 'Antibiotics', image: 'https://via.placeholder.com/300', slug: 'antibiotics' },
        { name: 'Vitamins', image: 'https://via.placeholder.com/300', slug: 'vitamins' },
        { name: 'Cold & Flu', image: 'https://via.placeholder.com/300', slug: 'cold-and-flu' }
    ]);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const data = await productService.getAllProducts();
                // In a real app, you might have a featured flag or sort by popularity
                setFeaturedProducts(data.slice(0, 4));
            } catch (error) {
                console.error('Error fetching featured products:', error);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <Container>
            {/* Hero Section */}
            <Carousel className="my-4">
                <Carousel.Item>
                    <div className="d-flex align-items-center justify-content-between px-4" style={{ background: 'rgba(240, 240, 240, 0.8)', minHeight: '400px' }}>
                        <div className="w-50">
                            <img
                                className="d-block w-100"
                                src="https://img.freepik.com/free-vector/pharmacist_23-2148174563.jpg?ga=GA1.1.1907446516.1743840095&semt=ais_hybrid&w=740"
                                alt="Online Pharmacy"
                            />
                        </div>
                        <div className="w-50 p-4 text-dark">
                            <h2>Welcome to Online Pharmacy</h2>
                            <p className="my-3">Quality healthcare products delivered to your doorstep</p>
                            <Button as={Link} to="/products" variant="primary">Shop Now</Button>
                        </div>
                    </div>
                </Carousel.Item>
                <Carousel.Item>
                    <div className="d-flex align-items-center justify-content-between px-4" style={{ background: 'rgba(240, 240, 240, 0.8)', minHeight: '400px' }}>
                        <div className="w-50">
                            <img
                                className="d-block w-100"
                                src="https://img.freepik.com/free-vector/health-insurance-abstract-concept-vector-illustration-health-insurance-contract-medical-expenses-claim-application-form-agent-consultation-sign-document-emergency-coverage-abstract-metaphor_335657-1356.jpg?t=st=1744740519~exp=1744744119~hmac=c9fad4cd7717099b5e0707297b59371741f887d38a463d626a03bb67bbe2c638&w=826"
                                alt="Prescription Services"
                            />
                        </div>
                        <div className="w-50 p-4 text-dark">
                            <h2>Easy Prescription Management</h2>
                            <p className="my-3">Upload your prescriptions and get medications delivered</p>
                            <Button as={Link} to="/prescriptions/upload" variant="primary">Upload Prescription</Button>
                        </div>
                    </div>
                </Carousel.Item>
            </Carousel>

            {/* Featured Products */}
            <section className="my-5">
                <h2 className="mb-4">Featured Products</h2>
                <Row>
                    {featuredProducts.map(product => (
                        <Col key={product.id} md={6} lg={3} className="mb-4">
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
                <div className="text-center mt-3">
                    <Button as={Link} to="/products" variant="outline-primary">View All Products</Button>
                </div>
            </section>

            {/* Services */}
            <section className="my-5">
                <h2 className="mb-4">Our Services</h2>
                <Row>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 text-center">
                            <Card.Body>
                                <i className="bi bi-truck" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
                                <Card.Title className="mt-3">Home Delivery</Card.Title>
                                <Card.Text>
                                    Get your medications delivered right to your doorstep.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 text-center">
                            <Card.Body>
                                <i className="bi bi-file-earmark-medical" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
                                <Card.Title className="mt-3">Prescription Management</Card.Title>
                                <Card.Text>
                                    Upload and manage your prescriptions online.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 text-center">
                            <Card.Body>
                                <i className="bi bi-headset" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
                                <Card.Title className="mt-3">24/7 Support</Card.Title>
                                <Card.Text>
                                    Our pharmacy experts are available to help you anytime.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>
        </Container>
    );
};

export default Home; 