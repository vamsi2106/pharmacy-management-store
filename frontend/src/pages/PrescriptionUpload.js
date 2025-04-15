import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { AuthContext } from '../utils/AuthContext';
import prescriptionService from '../services/prescriptionService';

const PrescriptionUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [productId, setProductId] = useState(null);

    // Extract productId from URL query params if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const productIdParam = params.get('productId');
        if (productIdParam) {
            setProductId(parseInt(productIdParam, 10));
        }
    }, [location]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            setFile(selectedFile);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload a JPG, PNG, or PDF file.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File is too large. Maximum size is 10MB.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setProgress(10);

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            // Add product ID if available
            if (productId) {
                formData.append('productId', productId);
            }

            // Upload prescription
            const response = await prescriptionService.uploadPrescription(formData, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
            });

            // Store the prescription ID in localStorage for use during checkout
            localStorage.setItem('prescriptionId', response.id);

            setProgress(100);
            setSuccess(true);

            // Redirect to cart or back to product detail after a brief delay
            setTimeout(() => {
                if (productId) {
                    navigate(`/products/${productId}`);
                } else {
                    navigate('/cart');
                }
            }, 2000);

        } catch (err) {
            console.error('Error uploading prescription:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to upload prescription. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(droppedFile);
        }
    };

    return (
        <Container className="py-4">
            <h1 className="mb-4">Upload Prescription</h1>

            {error && (
                <Alert variant="danger">{error}</Alert>
            )}

            {success && (
                <Alert variant="success">
                    Prescription uploaded successfully! You will be redirected to your cart.
                </Alert>
            )}

            <Row>
                <Col lg={8}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <div
                                    className="prescription-uploader mb-4"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('prescription-file').click()}
                                >
                                    {preview ? (
                                        <div className="text-center">
                                            <img
                                                src={preview}
                                                alt="Prescription Preview"
                                                style={{ maxHeight: '300px', maxWidth: '100%' }}
                                                className="mb-3"
                                            />
                                            <p className="mb-0">
                                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <i className="bi bi-cloud-arrow-up" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
                                            <h4 className="mt-3">Drop your prescription here</h4>
                                            <p className="text-muted">
                                                or click to browse files (JPG, PNG, PDF)
                                            </p>
                                        </div>
                                    )}

                                    <Form.Control
                                        id="prescription-file"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        disabled={loading}
                                    />
                                </div>

                                {loading && (
                                    <ProgressBar
                                        animated
                                        now={progress}
                                        label={`${progress}%`}
                                        className="mb-4"
                                    />
                                )}

                                <Form.Group className="mb-4">
                                    <Form.Label>Description (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add any notes about your prescription"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={loading || success}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={!file || loading || success}
                                    >
                                        {loading ? 'Uploading...' : 'Upload Prescription'}
                                    </Button>
                                    <Button
                                        as={Link}
                                        to={productId ? `/products/${productId}` : '/cart'}
                                        variant="outline-secondary"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="mb-4">
                        <Card.Header>Prescription Guidelines</Card.Header>
                        <Card.Body>
                            <h5>Acceptable Formats</h5>
                            <ul>
                                <li>JPG or PNG images</li>
                                <li>PDF documents</li>
                                <li>Maximum file size: 10MB</li>
                            </ul>

                            <h5>Requirements</h5>
                            <ul>
                                <li>Clear, legible handwriting or print</li>
                                <li>Doctor's signature must be visible</li>
                                <li>Must include patient's name and date</li>
                                <li>Must not be expired</li>
                            </ul>

                            <h5>Processing Time</h5>
                            <p>
                                Your prescription will be verified by our pharmacists
                                before your order is processed. This typically takes 1-2 business days.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Need Help?</Card.Header>
                        <Card.Body>
                            <p>
                                If you're having trouble uploading your prescription,
                                please contact our customer support team for assistance.
                            </p>
                            <div className="d-grid">
                                <Button variant="outline-primary">
                                    Contact Support
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PrescriptionUpload; 