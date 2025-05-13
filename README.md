# MoneyShield API

RESTful modular API for managing users, transactions, and personal finance.

**Interactive API documentation available at `/api-docs` via Swagger UI.**


## 🚀 Features

- Modular architecture (controllers, services, DAOs)
- MySQL database connection via connection pool
- Environment-based configuration
- Easy to extend with new entities
- Interactive, auto-generated API documentation (Swagger/OpenAPI)
- Transactions module fully implemented with CRUD and Swagger doc

## 📦 Installation
```
git clone https://yourrepo.git
cd moneyshield
npm install
```

## ⚙️ Configuration

Create a `.env` file in the project root with your database and server settings:

```
DB_HOST=localhost
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_NAME=moneyshield
PORT=3000
```


## 🏃‍♂️ Usage

Start the server:

```
npm start
```

The server will run at [http://localhost:3000](http://localhost:3000).

## 📖 API Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

Use this interface to explore, test, and understand all available endpoints in real time.

## 🧾 API Endpoints
**Users**
-`GET /users` - List all users
-`GET /users/{id}` - Get user by ID
-`POST /users` - Create a new user
- `PUT /users/{id}` - Update a user fully
- `PATCH /users/{id}` - Update a user partially
- `DELETE /users/{id}` - Delete a user

**Transactions**
- `GET /transactions` - List all transactions (optionally filtered by user)
- `GET /transactions/{id}` - Get transaction by ID
- `POST /transactions` - Create a new transaction
- `PUT /transactions/{id}` - Update a transaction fully
- `PATCH /transactions/{id}` - Update a transaction partially
- `DELETE /transactions/{id}` - Delete a transaction


## 🗂️ Project Structure

```
src/
    db/DBHelper.js
    users/
        user.controller.js
        user.service.js
        user.dao.js
    transactions/
        transaction.controller.js
        transaction.service.js
        transaction.dao.js
    index.mjs
.env
package.json
README.md
```


## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](LICENSE)
This project is licensed under the MIT License - see the LICENSE file for details.
---

## 📚 Español

**MoneyShield API** es una API modular para la gestión de usuarios, transacciones y finanzas personales.  
Sigue las instrucciones anteriores para instalar, configurar y ejecutar el proyecto.

---

Created for MoneyShield © 2025
Current date: Thursday, May 08, 2025, 5:20 PM CEST