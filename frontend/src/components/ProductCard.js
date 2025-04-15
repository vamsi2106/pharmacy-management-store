import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from 'react-bootstrap';

const ProductCard = ({ product }) => {
    return (
        <Card className="h-100 product-card">
            <Card.Img
                variant="top"
                src={product.imageUrl || "https://via.placeholder.com/300"}
                alt={product.name}
                className="product-image p-3"
            />
            <Card.Body className="d-flex flex-column">
                <div className="mb-2">
                    <small className="text-muted product-category">{product.category}</small>
                </div>

                <Card.Title>{product.name}</Card.Title>

                <Card.Text className="flex-grow-1">
                    {product.description?.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description}
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="product-price fw-bold">${product.price}</span>

                    <div>
                        {product.requiresPrescription && (
                            <Badge bg="warning" text="dark" className="me-1">
                                Prescription
                            </Badge>
                        )}

                        {product.stock <= 0 ? (
                            <Badge bg="danger">Out of Stock</Badge>
                        ) : (
                            <Badge bg="success">In Stock</Badge>
                        )}
                    </div>
                </div>

                <div className="d-flex justify-content-between">
                    <Link to={`/products/${product.id}`} className="btn btn-outline-primary">
                        View Details
                    </Link>

                    <Button
                        variant="primary"
                        disabled={product.stock <= 0 || product.requiresPrescription}
                    >
                        Add to Cart
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard; 