import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import prescriptionService from '../services/prescriptionService';
import { API_BASE_URL } from '../config/apiConfig';

const PrescriptionList = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentPrescription, setCurrentPrescription] = useState(null);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                setLoading(true);
                const data = await prescriptionService.getUserPrescriptions();
                setPrescriptions(data);
                setError(null);
            } catch (err) {
                setError('Failed to load prescriptions. Please try again.');
                console.error('Error fetching prescriptions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, []);

    const handleDeletePrescription = async (id) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            try {
                await prescriptionService.deletePrescription(id);
                setPrescriptions(prescriptions.filter(p => p.id !== id));
            } catch (err) {
                setError('Failed to delete prescription. Please try again.');
                console.error('Error deleting prescription:', err);
            }
        }
    };

    const handleViewDetails = (prescription) => {
        try {
            console.log("Opening prescription details:", prescription);
            setCurrentPrescription(prescription);
            setShowDetailsModal(true);
        } catch (error) {
            console.error("Error opening prescription details:", error);
            setError("Failed to open prescription details: " + error.message);
        }
    };

    const handleDownload = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = `${API_BASE_URL}/prescriptions/${id}/download`;

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
            }

            // Get content type to determine extension
            const contentType = response.headers.get('content-type');
            let fileExtension = '.pdf';

            if (contentType) {
                if (contentType.includes('image/jpeg')) fileExtension = '.jpg';
                else if (contentType.includes('image/png')) fileExtension = '.png';
                else if (contentType.includes('image/gif')) fileExtension = '.gif';
                else if (contentType.includes('application/pdf')) fileExtension = '.pdf';
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prescription-${id}${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download prescription. Please try again.');
            console.error('Error downloading prescription:', err);
        }
    };

    // AuthorizedImage component for displaying prescription images with auth
    const AuthorizedImage = ({ prescription, alt, className, style }) => {
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [imageSrc, setImageSrc] = useState("");
        const [contentType, setContentType] = useState("");

        useEffect(() => {
            if (!prescription || !prescription.id) {
                setError("Invalid prescription data");
                setLoading(false);
                return;
            }

            let isMounted = true;
            const fetchImage = async () => {
                try {
                    if (!isMounted) return;

                    setLoading(true);
                    const token = localStorage.getItem('token');
                    const url = `${API_BASE_URL}/prescriptions/${prescription.id}/download`;

                    console.log("Fetching prescription from:", url);

                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!isMounted) return;

                    if (!response.ok) {
                        throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
                    }

                    // Get content type to determine how to display it
                    const contentTypeHeader = response.headers.get('content-type');
                    setContentType(contentTypeHeader);

                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    setImageSrc(objectUrl);
                    setLoading(false);
                } catch (err) {
                    if (!isMounted) return;

                    console.error('Error loading prescription file:', err);
                    setError(err.message || "Failed to load prescription");
                    setLoading(false);
                }
            };

            fetchImage();

            // Cleanup on unmount
            return () => {
                isMounted = false;
                if (imageSrc) {
                    URL.revokeObjectURL(imageSrc);
                }
            };
        }, [prescription]);

        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger">
                    {error}
                </div>
            );
        }

        // If content type is PDF, show PDF viewer
        if (contentType && contentType.includes('application/pdf')) {
            return (
                <div className="text-center">
                    <iframe
                        src={imageSrc}
                        title="PDF Viewer"
                        width="100%"
                        height="500px"
                        className="mb-3"
                    />
                </div>
            );
        }

        // For images and other viewable content
        return (
            <img
                src={imageSrc}
                alt={alt || "Prescription"}
                className={className || "img-fluid"}
                style={style || { maxHeight: '400px' }}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/400x300?text=Error+Loading+Image";
                }}
            />
        );
    };

    const getVerificationStatusBadge = (isVerified, isRejected) => {
        if (isVerified) {
            return <Badge bg="success">Verified</Badge>;
        } else if (isRejected) {
            return <Badge bg="danger">Rejected</Badge>;
        } else {
            return <Badge bg="warning" text="dark">Pending</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>My Prescriptions</h1>
                <Button as={Link} to="/prescriptions/upload" variant="primary">
                    Upload New Prescription
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {prescriptions.length === 0 ? (
                <Card className="text-center p-5">
                    <Card.Body>
                        <div className="mb-4">
                            <i className="bi bi-file-earmark-medical" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                        </div>
                        <h3>No Prescriptions Found</h3>
                        <p className="text-muted">You haven't uploaded any prescriptions yet.</p>
                        <Button as={Link} to="/prescriptions/upload" variant="primary" className="mt-3">
                            Upload Prescription
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Date Uploaded</th>
                                    <th>File Name</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map((prescription) => (
                                    <tr key={prescription.id}>
                                        <td>{formatDate(prescription.uploadDate)}</td>
                                        <td>{prescription.fileName}</td>
                                        <td>{getVerificationStatusBadge(prescription.verified, prescription.rejected)}</td>
                                        <td>{prescription.description || 'N/A'}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleViewDetails(prescription)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleDownload(prescription.id)}
                                            >
                                                Download
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeletePrescription(prescription.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Prescription Details Modal */}
            <Modal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Prescription Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentPrescription && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <p><strong>Upload Date:</strong> {formatDate(currentPrescription.uploadDate)}</p>
                                    <p><strong>Filename:</strong> {currentPrescription.fileName}</p>
                                    <p><strong>Status:</strong> {getVerificationStatusBadge(currentPrescription.verified, currentPrescription.rejected)}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Description:</strong> {currentPrescription.description || 'N/A'}</p>
                                    {currentPrescription.verificationDate && (
                                        <p><strong>Verification Date:</strong> {formatDate(currentPrescription.verificationDate)}</p>
                                    )}
                                </Col>
                            </Row>
                            <div className="text-center">
                                <AuthorizedImage
                                    prescription={currentPrescription}
                                    alt="Prescription Preview"
                                    className="img-fluid"
                                    style={{ maxHeight: '400px' }}
                                />
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-info"
                        onClick={() => handleDownload(currentPrescription.id)}
                        className="me-2"
                    >
                        Download
                    </Button>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default PrescriptionList; 