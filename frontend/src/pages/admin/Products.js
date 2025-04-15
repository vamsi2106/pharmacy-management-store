import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Table, Badge, Modal } from 'react-bootstrap';
import productService from '../../services/productService';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form states for add/edit product
    const [productForm, setProductForm] = useState({
        id: null,
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        requiresPrescription: false
    });

    const categories = ['Painkillers', 'Antibiotics', 'Vitamins', 'Cold and Flu', 'Allergy'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            setProducts(data);
            setFilteredProducts(data);
            setError(null);
        } catch (err) {
            setError('Failed to load products. Please try again later.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter products when search term or category changes
    useEffect(() => {
        let result = [...products];

        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory) {
            result = result.filter(product =>
                product.category.toLowerCase() === filterCategory.toLowerCase()
            );
        }

        setFilteredProducts(result);
    }, [searchTerm, filterCategory, products]);

    const handleAddProduct = () => {
        setProductForm({
            id: null,
            name: '',
            category: '',
            description: '',
            price: '',
            stock: '',
            imageUrl: '',
            requiresPrescription: false
        });
        setShowAddModal(true);
    };

    const handleEditProduct = (product) => {
        setProductForm({
            id: product.id,
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl || '',
            requiresPrescription: product.requiresPrescription
        });
        setShowEditModal(true);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.deleteProduct(id);
                setProducts(products.filter(product => product.id !== id));
                alert('Product deleted successfully');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete product');
                console.error('Error deleting product:', err);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductForm({
            ...productForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const validateForm = () => {
        if (!productForm.name || !productForm.category || !productForm.price || !productForm.stock) {
            alert('Please fill all required fields');
            return false;
        }

        if (isNaN(parseFloat(productForm.price)) || parseFloat(productForm.price) <= 0) {
            alert('Price must be a positive number');
            return false;
        }

        if (isNaN(parseInt(productForm.stock)) || parseInt(productForm.stock) < 0) {
            alert('Stock must be a non-negative integer');
            return false;
        }

        return true;
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const productData = {
                ...productForm,
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock)
            };

            let savedProduct;

            if (productForm.id) {
                // Update existing product
                savedProduct = await productService.updateProduct(productForm.id, productData);

                // Update products list
                setProducts(products.map(p =>
                    p.id === productForm.id ? savedProduct : p
                ));

                setShowEditModal(false);
            } else {
                // Create new product
                savedProduct = await productService.createProduct(productData);

                // Add to products list
                setProducts([...products, savedProduct]);

                setShowAddModal(false);
            }

            alert(productForm.id ? 'Product updated successfully' : 'Product created successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save product');
            console.error('Error saving product:', err);
        }
    };

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Product Management</h1>

            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Products</h5>
                        <Button variant="primary" onClick={handleAddProduct}>
                            <i className="bi bi-plus-lg me-1"></i> Add New Product
                        </Button>
                    </div>

                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-0">
                                <Form.Control
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-0">
                                <Form.Select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
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
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Requires Prescription</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">No products found</td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>{product.id}</td>
                                                <td>{product.name}</td>
                                                <td>{product.category}</td>
                                                <td>${parseFloat(product.price).toFixed(2)}</td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    {product.requiresPrescription ? (
                                                        <Badge bg="warning" text="dark">Yes</Badge>
                                                    ) : (
                                                        <Badge bg="info">No</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleEditProduct(product)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                    >
                                                        Delete
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

            {/* Add Product Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveProduct}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={productForm.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                name="category"
                                value={productForm.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={productForm.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        name="price"
                                        value={productForm.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        name="stock"
                                        value={productForm.stock}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="imageUrl"
                                value={productForm.imageUrl}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Requires Prescription"
                                name="requiresPrescription"
                                checked={productForm.requiresPrescription}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveProduct}>
                        Save Product
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Product Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveProduct}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={productForm.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                name="category"
                                value={productForm.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={productForm.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        name="price"
                                        value={productForm.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        name="stock"
                                        value={productForm.stock}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="imageUrl"
                                value={productForm.imageUrl}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Requires Prescription"
                                name="requiresPrescription"
                                checked={productForm.requiresPrescription}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveProduct}>
                        Update Product
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Products; 