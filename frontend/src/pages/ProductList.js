import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Breadcrumb } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // For filters
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [prescriptionFilter, setPrescriptionFilter] = useState('all');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { category } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Categories for filter
    const categories = [
        'Painkillers',
        'Antibiotics',
        'Vitamins',
        'Cold and Flu',
        'Allergy'
    ];

    // Fetch products only once on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get all products in a single API call
                const data = await productService.getAllProducts();
                setProducts(data);

                // Set initial filtered products
                applyFilters(data);
            } catch (err) {
                setError('Failed to fetch products. Please try again later.');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Handle URL params for search and category separately from data fetching
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchQuery = queryParams.get('search');

        if (searchQuery) {
            setSearchTerm(searchQuery);
        }

        if (category) {
            setSelectedCategory(category);
        }

        // Apply filters any time the URL parameters change
        if (products.length > 0) {
            applyFilters(products);
        }
    }, [location.search, category, products.length]);

    // Apply filters without fetching new data
    const applyFilters = (productsToFilter) => {
        let result = [...productsToFilter];

        // Filter by search term
        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by category
        if (selectedCategory) {
            result = result.filter(product =>
                product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Filter by price range
        if (priceRange.min) {
            result = result.filter(product =>
                parseFloat(product.price) >= parseFloat(priceRange.min)
            );
        }

        if (priceRange.max) {
            result = result.filter(product =>
                parseFloat(product.price) <= parseFloat(priceRange.max)
            );
        }

        // Filter by prescription requirement
        if (prescriptionFilter !== 'all') {
            const requiresPrescription = prescriptionFilter === 'prescription';
            result = result.filter(product =>
                product.requiresPrescription === requiresPrescription
            );
        }

        // Filter by availability
        if (availabilityFilter !== 'all') {
            const inStock = availabilityFilter === 'inStock';
            result = result.filter(product =>
                inStock ? product.stock > 0 : product.stock <= 0
            );
        }

        setFilteredProducts(result);
    };

    // Handle category change
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);

        // Apply filter immediately without navigation
        applyFilters(products);
    };

    // Handle price range change
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        const newPriceRange = {
            ...priceRange,
            [name]: value
        };
        setPriceRange(newPriceRange);

        // Trigger filter after state update
        setTimeout(() => applyFilters(products), 0);
    };

    // Handle prescription filter change
    const handlePrescriptionFilterChange = (e) => {
        setPrescriptionFilter(e.target.value);
        // Trigger filter after state update
        setTimeout(() => applyFilters(products), 0);
    };

    // Handle availability filter change
    const handleAvailabilityFilterChange = (e) => {
        setAvailabilityFilter(e.target.value);
        // Trigger filter after state update
        setTimeout(() => applyFilters(products), 0);
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
        setPrescriptionFilter('all');
        setAvailabilityFilter('all');
        setSearchTerm('');

        // Reset to all products
        setFilteredProducts(products);
    };

    return (
        <Container>
            <Breadcrumb className="mt-3">
                <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                <Breadcrumb.Item active>Products</Breadcrumb.Item>
                {category && (
                    <Breadcrumb.Item active>{category}</Breadcrumb.Item>
                )}
            </Breadcrumb>

            <h1 className="my-4">
                {category ? `${category} Products` : 'All Products'}
                {searchTerm && ` - Search results for "${searchTerm}"`}
            </h1>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="mb-0">
                    <strong>{filteredProducts.length}</strong> products found
                </p>
                {(selectedCategory || priceRange.min || priceRange.max || prescriptionFilter !== 'all' || availabilityFilter !== 'all' || searchTerm) && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={clearFilters}
                        className="d-flex align-items-center"
                    >
                        <i className="bi bi-x-circle me-1"></i> Clear All Filters
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="danger">{error}</Alert>
            )}

            <Row>
                {/* Filters */}
                <Col md={3}>
                    <Card className="mb-4">
                        <Card.Header>Filters</Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat, index) => (
                                            <option key={index} value={cat.toLowerCase()}>
                                                {cat}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Price Range</Form.Label>
                                    <div className="d-flex">
                                        <Form.Control
                                            type="number"
                                            placeholder="Min"
                                            name="min"
                                            value={priceRange.min}
                                            onChange={handlePriceChange}
                                            className="me-2"
                                        />
                                        <Form.Control
                                            type="number"
                                            placeholder="Max"
                                            name="max"
                                            value={priceRange.max}
                                            onChange={handlePriceChange}
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Prescription Requirement</Form.Label>
                                    <Form.Select
                                        value={prescriptionFilter}
                                        onChange={handlePrescriptionFilterChange}
                                        className="mb-2"
                                    >
                                        <option value="all">All Products</option>
                                        <option value="nonPrescription">Non-Prescription Only</option>
                                        <option value="prescription">Prescription Required</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Availability</Form.Label>
                                    <Form.Select
                                        value={availabilityFilter}
                                        onChange={handleAvailabilityFilterChange}
                                        className="mb-3"
                                    >
                                        <option value="all">All Products</option>
                                        <option value="inStock">In Stock</option>
                                        <option value="outOfStock">Out of Stock</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-grid">
                                    <Button
                                        variant="secondary"
                                        className="d-flex align-items-center justify-content-center"
                                        onClick={clearFilters}
                                    >
                                        <i className="bi bi-arrow-counterclockwise me-2"></i> Reset Filters
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Products */}
                <Col md={9}>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <>
                            <p>{filteredProducts.length} products found</p>
                            <Row>
                                {filteredProducts.map(product => (
                                    <Col key={product.id} md={6} lg={4} className="mb-4">
                                        <ProductCard product={product} />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    ) : (
                        <Alert variant="info">
                            No products found. Try adjusting your filters or search term.
                        </Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ProductList; 