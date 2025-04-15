/**
 * Main App component for the Pharmacy Management System
 */
const App = () => {
    const { Routes, Route, Navigate, useLocation } = ReactRouterDOM;
    const { useState, useEffect } = React;

    // Initialize cart from localStorage
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('pharmacy_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
    }, [cart]);

    // Add to cart function
    const addToCart = (product, quantity = 1) => {
        setCart(prevCart => {
            // Check if product is already in cart
            const existingItemIndex = prevCart.findIndex(item => item.id === product.id);

            if (existingItemIndex >= 0) {
                // Update quantity if item already exists
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    quantity: updatedCart[existingItemIndex].quantity + quantity
                };
                return updatedCart;
            } else {
                // Add new item to cart
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    // Remove from cart function
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    // Update item quantity in cart
    const updateCartItemQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    // Clear cart function
    const clearCart = () => {
        setCart([]);
    };

    // Make cart functions available globally
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateCartItemQuantity = updateCartItemQuantity;
    window.clearCart = clearCart;

    // Protected route wrapper
    const ProtectedRoute = ({ children }) => {
        const location = useLocation();
        const isAuthenticated = AuthService.isAuthenticated();

        if (!isAuthenticated) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        return children;
    };

    // Admin route wrapper
    const AdminRoute = ({ children }) => {
        const location = useLocation();
        const isAuthenticated = AuthService.isAuthenticated();
        const user = AuthService.getCurrentUser();
        const isAdmin = user && (user.role === 'ADMIN' || user.role === 'PHARMACIST');

        if (!isAuthenticated || !isAdmin) {
            return <Navigate to="/" state={{ from: location }} replace />;
        }

        return children;
    };

    return (
        <>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ProductList />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} updateCartItemQuantity={updateCartItemQuantity} clearCart={clearCart} />} />

                {/* Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute><div>Profile Page</div></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                <Route path="/prescriptions" element={<ProtectedRoute><PrescriptionUpload /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/products" element={<AdminRoute><div>Manage Products</div></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><div>Manage Orders</div></AdminRoute>} />
                <Route path="/admin/prescriptions" element={<AdminRoute><div>Verify Prescriptions</div></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><div>Manage Users</div></AdminRoute>} />

                {/* 404 Route */}
                <Route path="*" element={<div className="container py-5 text-center"><h2>Page Not Found</h2></div>} />
            </Routes>

            <footer className="bg-light py-4 mt-auto">
                <div className="container text-center">
                    <p className="mb-0">&copy; 2023 Pharmacy Management System</p>
                </div>
            </footer>
        </>
    );
}; 