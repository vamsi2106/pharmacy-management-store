import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        pendingPrescriptions: 0
    });

    useEffect(() => {
        // In a real app, fetch this data from the API
        // For now, using mock data
        setStats({
            totalOrders: 152,
            pendingOrders: 12,
            totalProducts: 78,
            totalCustomers: 243,
            pendingPrescriptions: 8
        });
    }, []);

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Admin Dashboard</h1>

            <Row>
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column align-items-center">
                            <div className="display-4 text-primary mb-3">{stats.totalOrders}</div>
                            <Card.Title>Total Orders</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column align-items-center">
                            <div className="display-4 text-warning mb-3">{stats.pendingOrders}</div>
                            <Card.Title>Pending Orders</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column align-items-center">
                            <div className="display-4 text-success mb-3">{stats.totalProducts}</div>
                            <Card.Title>Total Products</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column align-items-center">
                            <div className="display-4 text-info mb-3">{stats.totalCustomers}</div>
                            <Card.Title>Total Customers</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column align-items-center">
                            <div className="display-4 text-danger mb-3">{stats.pendingPrescriptions}</div>
                            <Card.Title>Pending Prescriptions</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Header>Recent Activity</Card.Header>
                        <Card.Body>
                            <p className="text-muted">No recent activity to display.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard; 