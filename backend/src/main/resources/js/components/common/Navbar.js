/**
 * Navbar component for the Pharmacy Management System
 */
const Navbar = () => {
    const { useState, useEffect } = React;
    const { Link, useNavigate } = ReactRouterDOM;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication status when component mounts
        const checkAuth = () => {
            const isAuth = AuthService.isAuthenticated();
            setIsAuthenticated(isAuth);
            if (isAuth) {
                setUser(AuthService.getCurrentUser());
            }
        };

        checkAuth();

        // Listen for storage events (for when user logs in/out in another tab)
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div className="container">
                <Link className="navbar-brand" to="/">Pharmacy Management</Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarNav" aria-controls="navbarNav"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Products</Link>
                        </li>
                        {isAuthenticated && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/prescriptions">Prescriptions</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/orders">My Orders</Link>
                                </li>
                                {user && (user.role === 'ADMIN' || user.role === 'PHARMACIST') && (
                                    <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle" href="#" id="adminDropdown"
                                            role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Admin
                                        </a>
                                        <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                                            <li><Link className="dropdown-item" to="/admin/products">Manage Products</Link></li>
                                            <li><Link className="dropdown-item" to="/admin/orders">Manage Orders</Link></li>
                                            <li><Link className="dropdown-item" to="/admin/prescriptions">Verify Prescriptions</Link></li>
                                            {user.role === 'ADMIN' && (
                                                <li><Link className="dropdown-item" to="/admin/users">Manage Users</Link></li>
                                            )}
                                        </ul>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/cart">
                                <i className="bi bi-cart"></i> Cart
                            </Link>
                        </li>

                        {isAuthenticated ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="userDropdown"
                                    role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {user ? user.name : 'Account'}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                    <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Register</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}; 