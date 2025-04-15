import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PrescriptionUpload from './pages/PrescriptionUpload';
import PrescriptionList from './pages/PrescriptionList';
import OrdersList from './pages/OrdersList';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminPrescriptions from './pages/admin/Prescriptions';
import AdminUsers from './pages/admin/Users';
import { AuthProvider } from './utils/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import './App.css';

function App() {
    return (
        <div className="App d-flex flex-column min-vh-100">
            <AuthProvider>
                <NavBar />
                <div className="container mt-4 flex-grow-1">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/:id" element={<ProductDetail />} />

                        {/* Protected User Routes */}
                        <Route
                            path="/cart"
                            element={
                                <PrivateRoute>
                                    <Cart />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/checkout"
                            element={
                                <PrivateRoute>
                                    <Checkout />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/prescriptions"
                            element={
                                <PrivateRoute>
                                    <PrescriptionList />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/prescriptions/upload"
                            element={
                                <PrivateRoute>
                                    <PrescriptionUpload />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <PrivateRoute>
                                    <OrdersList />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/orders/:id"
                            element={
                                <PrivateRoute>
                                    <OrderDetail />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/products"
                            element={
                                <AdminRoute>
                                    <AdminProducts />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/orders"
                            element={
                                <AdminRoute>
                                    <AdminOrders />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/prescriptions"
                            element={
                                <AdminRoute>
                                    <AdminPrescriptions />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <AdminRoute>
                                    <AdminUsers />
                                </AdminRoute>
                            }
                        />

                        {/* Catch all - redirect to home */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
                <Footer />
            </AuthProvider>
        </div>
    );
}

export default App; 