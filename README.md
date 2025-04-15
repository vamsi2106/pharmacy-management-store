# Online Pharmacy Management System

A comprehensive web application for managing an online pharmacy, allowing users to browse products, add items to cart, checkout, manage prescriptions, and administrators to manage inventory and orders.

## Project Structure

The project consists of two main components:

- `backend/`: Spring Boot Java backend
- `frontend/`: React.js frontend

## Technologies Used

### Backend
- Java 11+
- Spring Boot 2.x
- Spring Security with JWT
- JPA/Hibernate
- H2 Database (for development)
- Maven/Gradle for dependency management

### Frontend
- React.js
- Redux for state management
- React Router for navigation
- Axios for API communication
- Material-UI/Bootstrap for styling

## Installation & Setup

### Prerequisites
- Java 11+ (JDK)
- Node.js (v14+) and npm
- Maven 3.x or Gradle

### Maven Installation
Maven is required to build and run the backend. Follow these steps to install Maven:

#### System Requirements for Maven
- Java Development Kit (JDK) 8 or higher
- Approximately 10MB disk space for Maven + ~500MB for the local repository

#### Windows Installation
1. Download the [Maven binary zip archive](https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip)
2. Extract the zip file to a directory (e.g., `C:\Program Files\apache-maven-3.9.9`)
3. Set up environment variables:
   - Create `MAVEN_HOME`: `C:\Program Files\apache-maven-3.9.9`
   - Add to `Path`: `%MAVEN_HOME%\bin`
4. Verify installation by opening a new command prompt and typing:
   ```
   mvn -version
   ```

#### Linux/macOS Installation
1. Download the [Maven binary tar.gz archive](https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz)
2. Extract it to a suitable location:
   ```
   tar -xzvf apache-maven-3.9.9-bin.tar.gz -C /opt
   ```
3. Add Maven to your PATH by adding these lines to ~/.bashrc or ~/.zshrc:
   ```
   export MAVEN_HOME=/opt/apache-maven-3.9.9
   export PATH=$PATH:$MAVEN_HOME/bin
   ```
4. Apply the changes:
   ```
   source ~/.bashrc  # or source ~/.zshrc
   ```
5. Verify installation:
   ```
   mvn -version
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Build the project using Maven:
   ```
   mvn clean install
   ```
   or using the Maven wrapper:
   ```
   ./mvnw clean install
   ```
   or using Gradle:
   ```
   ./gradlew clean build
   ```

3. Create necessary directories (ignored by Git):
   ```
   mkdir -p uploads
   mkdir -p data
   mkdir -p logs
   ```

4. Run the Spring Boot application:
   ```
   mvn spring-boot:run
   ```
   or using the Maven wrapper:
   ```
   ./mvnw spring-boot:run
   ```
   or using Gradle:
   ```
   ./gradlew bootRun
   ```

5. The backend server will start running on http://localhost:8080

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create environment files if needed:
   - Create .env.local or .env files with required API endpoints

4. Start the development server:
   ```
   npm start
   ```

5. The frontend application will be available at http://localhost:3000

## Database

The application uses H2 as an in-memory database for development.

- H2 Console URL: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:pharmacydb (may vary, check application.properties)
- Username: sa
- Password: password (may vary, check application.properties)

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Product Browsing**: Browse products by category, search, and view details
- **Shopping Cart**: Add/remove items, view cart, and proceed to checkout
- **Prescription Management**: Upload and manage prescriptions
- **Order Processing**: Place orders, track status, and view order history
- **Admin Dashboard**: Manage inventory, orders, and users

## GitHub Workflow

### Setting Up Git Repository (First Time)
1. Initialize a Git repository in the project root:
   ```
   git init
   ```

2. Add all files to the repository:
   ```
   git add .
   ```

3. Commit the initial code:
   ```
   git commit -m "Initial commit"
   ```

4. Link to a remote GitHub repository:
   ```
   git remote add origin https://github.com/yourusername/pharmacy-management.git
   ```

5. Push to GitHub:
   ```
   git push -u origin master
   ```

### Cloning the Repository (New System)
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pharmacy-management.git
   ```

2. Navigate to the project directory:
   ```
   cd pharmacy-management
   ```

3. Follow the Maven installation and backend/frontend setup instructions above.

### Regular Workflow
1. Pull latest changes:
   ```
   git pull origin master
   ```

2. Make changes to the code

3. Add changes:
   ```
   git add .
   ```

4. Commit changes:
   ```
   git commit -m "Description of changes"
   ```

5. Push to GitHub:
   ```
   git push origin master
   ```

## Troubleshooting

- Ensure Java and Node.js are properly installed and meet the version requirements
- Verify that the backend server is running before starting the frontend
- Check application.properties for correct database configuration
- Clear browser cache if facing frontend issues
- For backend errors, check app.log file for details 