import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Form, FormControl, NavDropdown } from 'react-bootstrap';
import { AuthContext } from '../utils/AuthContext';

const NavBar = () => {
    const { currentUser, logout, isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();

    console.log('NavBar values:', { currentUser });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar bg="primary" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">Online Pharmacy</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/products">Products</Nav.Link>

                        {currentUser && (currentUser.role === 'CUSTOMER' || currentUser.role === "USER" || currentUser.role === null) && (
                            <>
                                <Nav.Link as={Link} to="/prescriptions">My Prescriptions</Nav.Link>
                                <Nav.Link as={Link} to="/orders">My Orders</Nav.Link>
                            </>
                        )}

                        {currentUser && isAdmin() && (
                            <NavDropdown title="Admin" id="admin-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/admin">Dashboard</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/products">Products</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/orders">Orders</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/prescriptions">Prescriptions</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/users">Users</NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>

                    <Form className="d-flex mx-auto" onSubmit={(e) => {
                        e.preventDefault();
                        const searchQuery = e.target.elements.search.value;
                        navigate(`/products?search=${searchQuery}`);
                    }}>
                        <FormControl
                            type="search"
                            placeholder="Search products"
                            className="me-2"
                            aria-label="Search"
                            name="search"
                        />
                        <Button variant="outline-light" type="submit">Search</Button>
                    </Form>

                    <Nav>
                        {currentUser ? (
                            <>
                                {(currentUser.role === "USER" || currentUser.role === "CUSTOMER" || currentUser.role === null) && (
                                    <Nav.Link as={Link} to="/cart">
                                        <i className="bi bi-cart"></i> Cart
                                    </Nav.Link>
                                )}
                                <NavDropdown title={currentUser.name} id="user-nav-dropdown">
                                    <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar; 