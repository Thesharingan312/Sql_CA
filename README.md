# MoneyShield API

A RESTful API backend for the MoneyShield financial management application. This API provides endpoints for managing users, profiles, transaction types, categories, transactions, and budgets.

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
  - [Users](#users)
  - [Profiles](#profiles)
  - [Transaction Types](#transaction-types)
  - [Categories](#categories)
  - [Transactions](#transactions)
  - [Budgets](#budgets)
  - [Savings](#savings)
- [Error Handling](#error-handling)
- [Connection Management](#connection-management)
- [Security Considerations](#security-considerations)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

MoneyShield API is a Node.js Express server application that connects to a MySQL database to manage financial data. It implements complete CRUD operations (Create, Read, Update, Delete) for core entities like users, **profiles**, **transaction types**, and **transactions**, providing a comprehensive backend solution for a personal finance management application. Future modules like **categories**, budgets, and savings will further enhance its capabilities.

## Requirements

- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd moneyshield-api
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure environment variables for database connection (see "Database Setup" section).**

4.  Start the server:
    ```bash
    npm start
    ```
    The API will be available at `http://localhost:3000`. Swagger documentation will be accessible at `http://localhost:3000/api-docs`.

## Database Setup

1.  **Create a `.env` file** in the root directory of the project.
2.  Add your MySQL database credentials to the `.env` file:
    ```dotenv
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=moneyshield
    ```
    **Replace `your_password` with your actual MySQL root password or the password of your database user.**

3.  **Create the `moneyshield` database** in your MySQL server.
    ```sql
    CREATE DATABASE IF NOT EXISTS moneyshield;
    USE moneyshield;
    ```
4.  **Run the SQL schema script** to create the necessary tables. (Assuming you have a `schema.sql` or similar file in a `database` directory):
    ```bash
    # Example: If you have a schema.sql file
    mysql -u your_user -p moneyshield < database/schema.sql
    ```
    _If you don't have a `schema.sql` file, you will need to create the tables manually based on the database diagram._

## API Documentation

The API documentation is generated using Swagger/OpenAPI and is available at `http://localhost:3000/api-docs` once the server is running.

### Users

Manages user accounts, including creation, retrieval, updates, and deletion. Users are linked to profiles.

### Profiles

Handles user profiles, which define roles or access levels within the application. Provides CRUD operations for profile management.

### Transaction Types

Manages predefined types for financial transactions (e.g., 'Income', 'Expense', 'Transfer'). Essential for categorizing transactions.

### Categories (Coming Soon)

Will manage spending and income categories (e.g., 'Groceries', 'Utilities', 'Salary'). These will be assignable to transactions.

### Transactions

Manages individual financial transactions, linking them to users, transaction types, and categories.

### Budgets (Future)

Will provide functionality for setting and tracking financial budgets for users.

### Savings (Future)

Will handle savings goals and progress tracking for users.

## Error Handling

The API implements a consistent error handling mechanism. Service layer errors are custom `Error` objects with an `error.status` property (e.g., 400, 404, 409, 500) which are propagated to the controller layer, allowing for appropriate HTTP response codes and messages.

## Connection Management

Database connections are managed efficiently using a MySQL connection pool (`mysql2/promise`), ensuring optimal performance and resource utilization. Connection details are loaded from environment variables via a `DBHelper.mjs` utility.

## Security Considerations

-   **API Keys/Authentication:** Currently, authentication is not implemented. For production environments, implement authentication using JWT or similar token-based system.
-   **Rate Limiting:** Add rate limiting to prevent abuse.
-   **HTTPS:** Add HTTPS support for production environments.
-   **Password Hashing:** Implement proper password hashing (although the API currently accepts pre-hashed passwords, this should be handled securely on user creation/update).

## Development

### Adding New Endpoints

To add new endpoints, follow the established pattern:
1.  Create route handlers for the standard CRUD operations
2.  Implement proper validation for inputs (using optional chaining for conciseness where appropriate)
3.  Use parameterized queries for database operations
4.  **Add accurate and correctly indented Swagger documentation (following YAML JSDoc structure with 2-space indentation for nested keys).**
5.  Handle all potential errors with custom `Error` objects including an `error.status` property.

### Coding Style

-   Use consistent naming conventions
-   Add bilingual comments (English and Spanish)
-   Group related endpoints together
-   Format SQL queries for readability
-   **Prefer optional chaining (`?.`) for concise property access and nullish checks.**

## Troubleshooting

### Common Issues

1.  **Connection refused**
    -   Check that MySQL server is running
    -   Verify the host and port settings in your `.env` file
    -   Ensure the database user has proper permissions

2.  **Authentication error**
    -   Verify the username and password for MySQL in your `.env` file
    -   Check that the user has access to the specified database

3.  **Table doesn't exist**
    -   Ensure the database schema has been properly set up (run `schema.sql` if applicable)
    -   Verify table names match exactly what's referenced in the code

## Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Make your changes
4.  Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created for MoneyShield © 2025