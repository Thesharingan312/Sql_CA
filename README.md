# MoneyShield API

A RESTful API backend for the MoneyShield financial management application. This API provides endpoints for managing users, transactions, and budgets.

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
  - [Users](#users)
  - [Profiles](#profiles)
  - [Transactions](#transactions)
  - [Budgets](#budgets)
  - [Savings](#savings)
- [Error Handling](#error-handling)
- [Connection Management](#connection-management)
- [Security Considerations](#security-considerations)

## Overview

MoneyShield API is a Node.js Express server application that connects to a MySQL database to manage financial data. It implements complete CRUD operations (Create, Read, Update, Delete) for users, transactions, and budgets, providing a comprehensive backend solution for a personal finance management application.

## Requirements

- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd moneyshield-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the database connection in the code (see "Database Setup" section).

4. Start the server:
   ```bash
   npm start
   ```

## Database Setup

Create a MySQL database named `moneyshield` and configure the connection in the code. Default configuration:

```javascript
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '*******************',  // Change this to your MySQL password
  database: 'moneyshield'
});
```

**Important:** For production environments, store sensitive information like database passwords in environment variables.

### Required Tables

The application expects the following tables in the database:

1. `users` - Store user information
   - `id` (Primary Key)
   - `first_name` VARCHAR(100)
   - `last_name` VARCHAR(100)
   - `email` VARCHAR(150)
   - `password_hash` VARCHAR(100)
   - `profile_id` INT (Foreign Key to profiles.id)

2. `profiles` - Store profile types
   - `id` (Primary Key)
   - `name` VARCHAR(50)

3. `transactions` - Store financial transactions
   - `id` (Primary Key)
   - `user_id` INT (Foreign Key)
   - `type` ENUM(...)
   - `amount` DECIMAL(10,2)
   - `category` VARCHAR(100)
   - `description` TEXT (optional)
   - `created_at` TIMESTAMP

4. `budgets` - Store budget information
   - `id` (Primary Key)
   - `user_id` INT (Foreign Key)
   - `year` INT
   - `month` INT
   - `total_amount` DECIMAL(10,2)
   - `notes` TEXT (optional)
   - `created_at` TIMESTAMP

5. `savings` - Store savings information
   - `id` (Primary Key)
   - `user_id` INT (Foreign Key)
   - `budget_id` INT (Foreign Key, optional)
   - `transaction_id` INT (Foreign Key, optional)
   - `name` VARCHAR(100)
   - `type` ENUM(...)
   - `amount` DECIMAL(10,2)
   - `notes` TEXT (optional)
   - `created_at` TIMESTAMP

## API Documentation

### Users

#### GET /users
- Description: Get all users
- Response: Array of user objects
- Status codes:
  - 200: Success
  - 500: Server error

#### GET /users/:id
- Description: Get a specific user by ID
- Parameters:
  - `id`: User ID
- Response: User object
- Status codes:
  - 200: Success
  - 404: User not found
  - 500: Server error

#### POST /users
- Description: Create a new user
- Request body:
  - `first_name` (required)
  - `last_name` (optional)
  - `email` (required)
  - `password_hash` (required)
  - `profile_id` (required)
- Response: Created user object with ID
- Status codes:
  - 200: Success
  - 400: Missing required fields
  - 500: Server error

#### PUT /users/:id
- Description: Update an existing user
- Parameters:
  - `id`: User ID
- Request body: Any fields to update
- Response: Success message
- Status codes:
  - 200: Success
  - 400: No fields to update
  - 500: Server error

#### DELETE /users/:id
- Description: Delete a user
- Parameters:
  - `id`: User ID
- Response: Success message
- Status codes:
  - 200: Success
  - 500: Server error

### Transactions

#### GET /transactions
- Description: Get all transactions
- Query parameters:
  - `user_id` (optional): Filter by user
- Response: Array of transaction objects
- Status codes:
  - 200: Success
  - 500: Server error

#### GET /transactions/:id
- Description: Get a specific transaction by ID
- Parameters:
  - `id`: Transaction ID
- Response: Transaction object
- Status codes:
  - 200: Success
  - 404: Transaction not found
  - 500: Server error

#### POST /transactions
- Description: Create a new transaction
- Request body:
  - `user_id` (required)
  - `amount` (required)
  - `type` (required)
  - `category_id` (required)
  - `description` (optional)
  - `date` (required)
- Response: Created transaction object with ID
- Status codes:
  - 200: Success
  - 400: Missing required fields
  - 500: Server error

#### PUT /transactions/:id
- Description: Update an existing transaction
- Parameters:
  - `id`: Transaction ID
- Request body: Any fields to update
- Response: Success message
- Status codes:
  - 200: Success
  - 400: No fields to update
  - 500: Server error

#### DELETE /transactions/:id
- Description: Delete a transaction
- Parameters:
  - `id`: Transaction ID
- Response: Success message
- Status codes:
  - 200: Success
  - 500: Server error

### Budgets

#### GET /budgets
- Description: Get all budgets
- Query parameters:
  - `user_id` (optional): Filter by user
- Response: Array of budget objects
- Status codes:
  - 200: Success
  - 500: Server error

#### GET /budgets/:id
- Description: Get a specific budget by ID
- Parameters:
  - `id`: Budget ID
- Response: Budget object
- Status codes:
  - 200: Success
  - 404: Budget not found
  - 500: Server error

#### GET /budgets/sum
- Description: Sum total saving amount
- Query parameters:
  - `user_id` (optional): Filter by user
  - `month` (optional): Filter by month (format: YYYY-MM)
- Response: Object with total_saving property
- Status codes:
  - 200: Success
  - 500: Server error

#### POST /budgets
- Description: Create a new budget
- Request body:
  - `user_id` (required)
  - `category_id` (required)
  - `amount` (required)
  - `saving_amount` (required)
  - `date` (required)
  - `note` (optional)
- Response: Created budget object with ID
- Status codes:
  - 200: Success
  - 400: Missing required fields
  - 500: Server error

#### PUT /budgets/:id
- Description: Update an existing budget
- Parameters:
  - `id`: Budget ID
- Request body: Any fields to update
- Response: Success message
- Status codes:
  - 200: Success
  - 400: No fields to update
  - 500: Server error

#### DELETE /budgets/:id
- Description: Delete a budget
- Parameters:
  - `id`: Budget ID
- Response: Success message
- Status codes:
  - 200: Success
  - 500: Server error

## Error Handling

The API handles various errors:
- Database connection errors (with automatic reconnection)
- Missing required fields in requests
- Server-side errors during query execution
- Not found errors for specific resources

## Connection Management

The API implements robust database connection management:
- Automatic connection on server startup
- Error detection for common connection issues (PROTOCOL_CONNECTION_LOST, ECONNREFUSED, ETIMEDOUT)
- Automatic reconnection with a 5-second delay if the connection is lost
- Proper error logging for connection issues

This ensures that the application can recover from temporary database connectivity issues without requiring manual intervention.

## Security Considerations

### Current Implementation
- Parameterized SQL queries to prevent SQL injection
- Basic validation of required fields
- Error handling that doesn't expose sensitive information

### Recommended Improvements
- Store database credentials in environment variables instead of hardcoding
- Implement authentication using JWT or similar token-based system
- Add rate limiting to prevent abuse
- Add HTTPS support for production environments
- Implement proper password hashing (although the API currently accepts pre-hashed passwords)

## Development

### Adding New Endpoints
To add new endpoints, follow the established pattern:
1. Create route handlers for the standard CRUD operations
2. Implement proper validation for inputs
3. Use parameterized queries for database operations
4. Add appropriate Swagger documentation
5. Handle all potential errors

### Coding Style
- Use consistent naming conventions
- Add bilingual comments (English and Spanish)
- Group related endpoints together
- Format SQL queries for readability

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Check that MySQL server is running
   - Verify the host and port settings
   - Ensure the database user has proper permissions

2. **Authentication error**
   - Verify the username and password for MySQL
   - Check that the user has access to the specified database

3. **Table doesn't exist**
   - Ensure the database schema has been properly set up
   - Verify table names match exactly what's referenced in the code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created for MoneyShield © 2025