# Online Pharmacy Management System

A Spring Boot application for managing an online pharmacy platform. This system allows customers to browse medications, upload prescriptions, and place orders, while pharmacists can manage inventory and process orders.

## Features

### Customer Features
- Browse medications by category
- Search for medications by name
- Upload prescriptions for verification
- Place orders and make secure payments
- Track order status and history

### Pharmacist/Admin Features
- Manage product inventory (add, update, delete medications)
- Verify uploaded prescriptions
- Process orders and update delivery status
- User management

## Technology Stack

- **Backend**: Java 17, Spring Boot 3.2
- **Database**: MySQL (Production), H2 (Development)
- **ORM**: Hibernate/JPA
- **Security**: Spring Security
- **Build Tool**: Maven

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pharmacy-management.git
cd pharmacy-management
```

2. Build the application
```bash
mvn clean install
```

3. Run the application
```bash
mvn spring-boot:run
```

The application will be available at `http://localhost:8080`

### API Endpoints

#### User Management
- `POST /api/users/register` - Register a new user
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/{id}` - Get user by ID (Admin or Self)
- `PUT /api/users/{id}` - Update user (Admin or Self)
- `DELETE /api/users/{id}` - Delete user (Admin only)

#### Product Management
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category
- `GET /api/products/search?name={name}` - Search products by name
- `POST /api/products` - Create product (Admin or Pharmacist)
- `PUT /api/products/{id}` - Update product (Admin or Pharmacist)
- `DELETE /api/products/{id}` - Delete product (Admin or Pharmacist)

#### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (Admin or Pharmacist)
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}/status` - Update order status (Admin or Pharmacist)

#### Prescription Management
- `POST /api/prescriptions` - Upload prescription
- `GET /api/prescriptions` - Get all prescriptions (Admin or Pharmacist)
- `PUT /api/prescriptions/{id}/status` - Update prescription status (Admin or Pharmacist)

## Database Schema

The system uses the following key entities:
- User: Stores user information (id, name, email, password, contact, address, role)
- Product: Stores medication details (id, name, description, category, price, stock, requiresPrescription)
- Order: Stores order information (id, userId, orderDate, status, totalPrice)
- OrderItem: Links orders and products (id, orderId, productId, quantity, price)
- Prescription: Stores uploaded prescriptions (id, userId, uploadDate, status)
- Payment: Manages payment details (id, orderId, amount, status, paymentMethod)

## Security

The application implements role-based access control with Spring Security:
- Public endpoints: product browsing, user registration
- Customer endpoints: order placement, prescription upload, profile management
- Pharmacist endpoints: inventory management, prescription verification, order processing
- Admin endpoints: user management, system administration

## License

This project is licensed under the MIT License - see the LICENSE file for details. 