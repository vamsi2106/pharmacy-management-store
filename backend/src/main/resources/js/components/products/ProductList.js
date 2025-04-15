/**
 * ProductList component for the Pharmacy Management System
 */
const ProductList = () => {
    const { useState, useEffect } = React;
    const { Link, useSearchParams } = ReactRouterDOM;

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = '/api/products';

                if (categoryParam) {
                    url = `/api/products/category/${categoryParam}`;
                } else if (searchQuery) {
                    url = `/api/products/search?name=${encodeURIComponent(searchQuery)}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching products');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                // This endpoint would need to be implemented on the backend
                const response = await fetch('/api/products/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                // Fallback to some default categories
                setCategories(['Pain Relief', 'Cold & Flu', 'Vitamins', 'First Aid', 'Skin Care']);
            }
        };

        fetchProducts();
        fetchCategories();
    }, [categoryParam, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        const form = e.target;
        const searchInput = form.elements.search.value;
        if (searchInput.trim()) {
            setSearchParams({ search: searchInput });
        } else {
            setSearchParams({});
        }
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row mb-4">
                <div className="col-md-6">
                    <h2>Products {categoryParam && `- ${categoryParam}`}</h2>
                </div>
                <div className="col-md-6">
                    <form onSubmit={handleSearch} className="d-flex">
                        <input
                            type="search"
                            name="search"
                            className="form-control me-2"
                            placeholder="Search products..."
                            defaultValue={searchQuery || ''}
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                </div>
            </div>

            {(categoryParam || searchQuery) && (
                <div className="mb-4">
                    <button onClick={clearFilters} className="btn btn-outline-secondary">
                        Clear Filters
                    </button>
                </div>
            )}

            <div className="row mb-4">
                <div className="col-12">
                    <div className="category-pills d-flex flex-wrap gap-2">
                        {categories.map((category, index) => (
                            <Link
                                key={index}
                                to={`/products?category=${encodeURIComponent(category)}`}
                                className={`badge rounded-pill ${categoryParam === category ? 'bg-primary' : 'bg-light text-dark'}`}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center my-5">
                    <p className="lead">No products found.</p>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {products.map(product => (
                        <div className="col" key={product.id}>
                            <div className="card h-100 product-card">
                                <img
                                    src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                                    className="card-img-top product-image"
                                    alt={product.name}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text product-category">{product.category}</p>
                                    <p className="card-text">{product.description}</p>
                                    <p className="card-text product-price">${product.price.toFixed(2)}</p>
                                    {product.requiresPrescription && (
                                        <span className="badge bg-warning text-dark mb-2">
                                            Requires Prescription
                                        </span>
                                    )}
                                </div>
                                <div className="card-footer bg-transparent border-top-0">
                                    <Link to={`/products/${product.id}`} className="btn btn-outline-primary me-2">
                                        View Details
                                    </Link>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => window.addToCart && window.addToCart(product)}
                                        disabled={product.stock <= 0}
                                    >
                                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 