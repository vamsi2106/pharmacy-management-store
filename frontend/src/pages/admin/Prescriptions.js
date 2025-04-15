import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Card, Form, Row, Col, Modal } from 'react-bootstrap';
import prescriptionService from '../../services/prescriptionService';
import { API_BASE_URL } from '../../config/apiConfig';

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentPrescription, setCurrentPrescription] = useState(null);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                setLoading(true);
                const data = await prescriptionService.getAllPrescriptions();
                setPrescriptions(data);
                setError(null);
            } catch (err) {
                setError('Failed to load prescriptions. Please try again later.');
                console.error('Error fetching prescriptions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, []);

    const handleVerifyPrescription = async (id) => {
        try {
            setLoading(true);
            await prescriptionService.verifyPrescription(id);

            // Update prescriptions list after verification
            const updatedPrescriptions = prescriptions.map(prescription =>
                prescription.id === id
                    ? { ...prescription, verified: true, rejected: false, verificationDate: new Date().toISOString() }
                    : prescription
            );

            setPrescriptions(updatedPrescriptions);

            // Show success message or toast
            alert('Prescription verified successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify prescription');
            console.error('Error verifying prescription:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectPrescription = async (id) => {
        try {
            setLoading(true);
            await prescriptionService.rejectPrescription(id);

            // Update prescriptions list after rejection
            const updatedPrescriptions = prescriptions.map(prescription =>
                prescription.id === id
                    ? { ...prescription, verified: false, rejected: true, verificationDate: new Date().toISOString() }
                    : prescription
            );

            setPrescriptions(updatedPrescriptions);

            // Show success message or toast
            alert('Prescription rejected successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject prescription');
            console.error('Error rejecting prescription:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (prescription) => {
        try {
            console.log("Opening prescription details:", prescription);
            // Make a copy of the prescription to avoid modifying the original
            const prescriptionCopy = { ...prescription };

            // Ensure user property has proper formatting
            if (prescriptionCopy.user && typeof prescriptionCopy.user === 'object') {
                prescriptionCopy.user = {
                    ...prescriptionCopy.user,
                    name: prescriptionCopy.user.name || 'Unknown User'
                };
            } else if (!prescriptionCopy.user) {
                prescriptionCopy.user = { name: 'Unknown User' };
            }

            // Ensure verifiedBy has proper formatting
            if (prescriptionCopy.verifiedBy && typeof prescriptionCopy.verifiedBy === 'object') {
                prescriptionCopy.verifiedBy = prescriptionCopy.verifiedBy.name || 'Unknown';
            }

            setCurrentPrescription(prescriptionCopy);
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

    const filteredPrescriptions = prescriptions.filter(prescription => {
        const matchesSearch =
            (prescription.user && prescription.user.name && prescription.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (prescription.fileName && prescription.fileName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filterStatus === '' ? true :
            (filterStatus === 'VERIFIED' && prescription.verified) ||
            (filterStatus === 'PENDING' && !prescription.verified && !prescription.rejected) ||
            (filterStatus === 'REJECTED' && prescription.rejected);

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (prescription) => {
        if (prescription.verified) {
            return <Badge bg="success">Verified</Badge>;
        } else if (prescription.rejected) {
            return <Badge bg="danger">Rejected</Badge>;
        } else {
            return <Badge bg="warning" text="dark">Pending</Badge>;
        }
    };

    const getImageDownloadUrl = (prescription) => {
        if (!prescription || !prescription.filePath) {
            return null;
        }
        // Use the direct download endpoint to get the original image file (not PDF)
        return `${API_BASE_URL}/prescriptions/${prescription.id}/image`;
    };

    // Update the AuthorizedImage component to better handle errors and use the PDF endpoint
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
                    // Use the PDF endpoint for consistency with download
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

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Prescription Management</h1>

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-0">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by user or filename..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-0">
                                <Form.Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="VERIFIED">Verified</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="REJECTED">Rejected</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Date Uploaded</th>
                                    <th>Filename</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPrescriptions.map((prescription) => (
                                    <tr key={prescription.id}>
                                        <td>{prescription.id}</td>
                                        <td>{prescription.user && typeof prescription.user === 'object' ? prescription.user.name : 'Unknown User'}</td>
                                        <td>{formatDate(prescription.uploadDate)}</td>
                                        <td>{prescription.fileName}</td>
                                        <td>{getStatusBadge(prescription)}</td>
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

                                            {!prescription.verified && !prescription.rejected && (
                                                <>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleVerifyPrescription(prescription.id)}
                                                    >
                                                        Verify
                                                    </Button>

                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleRejectPrescription(prescription.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

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
                                    <p><strong>ID:</strong> {currentPrescription.id}</p>
                                    <p><strong>User:</strong> {currentPrescription.user && typeof currentPrescription.user === 'object' ? currentPrescription.user.name : 'Unknown User'}</p>
                                    <p><strong>Upload Date:</strong> {formatDate(currentPrescription.uploadDate)}</p>
                                    <p><strong>Filename:</strong> {currentPrescription.fileName}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(currentPrescription)}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Description:</strong> {currentPrescription.description || 'N/A'}</p>
                                    {currentPrescription.verifiedBy && (
                                        <p>
                                            <strong>Verified By:</strong> {
                                                typeof currentPrescription.verifiedBy === 'object'
                                                    ? (currentPrescription.verifiedBy.name || 'Unknown')
                                                    : currentPrescription.verifiedBy
                                            }
                                        </p>
                                    )}
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
                    {currentPrescription && !currentPrescription.verified && !currentPrescription.rejected && (
                        <>
                            <Button
                                variant="success"
                                onClick={() => {
                                    handleVerifyPrescription(currentPrescription.id);
                                    setShowDetailsModal(false);
                                }}
                            >
                                Verify
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    handleRejectPrescription(currentPrescription.id);
                                    setShowDetailsModal(false);
                                }}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Prescriptions; 