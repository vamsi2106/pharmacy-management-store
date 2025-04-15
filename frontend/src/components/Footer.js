import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-dark text-light py-4">
            <Container>
                <Row>
                    <Col md={4} className="mb-4 mb-md-0">
                        <h5>Online Pharmacy</h5>
                        <p className="mb-1">Your trusted partner for healthcare products</p>
                        <p className="mb-1"><i className="bi bi-geo-alt"></i> 123 Health Street, Medical City</p>
                        <p className="mb-1"><i className="bi bi-telephone"></i> +1 (555) 123-4567</p>
                        <p><i className="bi bi-envelope"></i> support@onlinepharmacy.com</p>
                    </Col>

                    <Col md={4} className="mb-4 mb-md-0">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li className="mb-1"><Link to="/products" className="text-decoration-none text-light">Products</Link></li>
                            <li className="mb-1"><Link to="/prescriptions" className="text-decoration-none text-light">Prescriptions</Link></li>
                            <li className="mb-1"><Link to="/orders" className="text-decoration-none text-light">My Orders</Link></li>
                            <li><Link to="/profile" className="text-decoration-none text-light">My Profile</Link></li>
                        </ul>
                    </Col>

                    <Col md={4}>
                        <h5>Connect With Us</h5>
                        <div className="d-flex gap-3 fs-4 mb-3">
                            <a href="#" className="text-light"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="text-light"><i className="bi bi-twitter"></i></a>
                            <a href="#" className="text-light"><i className="bi bi-instagram"></i></a>
                            <a href="#" className="text-light"><i className="bi bi-linkedin"></i></a>
                        </div>
                        <p className="small">Sign up for our newsletter to receive updates and special offers.</p>
                    </Col>
                </Row>

                <hr className="my-3 bg-secondary" />

                <div className="text-center">
                    <p className="mb-0 small">&copy; {year} Online Pharmacy. All rights reserved.</p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer; 