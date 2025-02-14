# Invoice App Backend

This is the backend for the **Invoice App**, a full-stack application that allows users to create, update, delete, and manage invoices securely. Built with Node.js, Express, and MongoDB, this RESTful API serves as the server-side solution to store and process data.

The corresponding front-end repository is:

- **[Invoice App Frontend](https://github.com/margaux-works/myFlix-Angular)** _(built with Angular and Tailwind CSS)_

---

## Features

### **User Authentication**

- Secure user registration and login with **password hashing** using bcrypt.
- JWT-based authentication for secure access to API endpoints.

### **Invoice Management**

- CRUD operations: Create, Read, Update, and Delete invoices.
- Filter invoices by status (`draft`, `pending`, `paid`).
- Validate invoice details before saving.

### **Data Validation**

- Robust validation using Express Validator to ensure data integrity.

---

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express**: Web framework for creating the REST API
- **MongoDB**: NoSQL database for storing user and invoice data
- **Mongoose**: ODM for MongoDB
- **Passport.js**: Middleware for authentication (local strategy and JWT)
- **Bcrypt**: Password hashing
- **Express Validator**: Request validation middleware
- **Dotenv**: Manage environment variables

---

## Installation and Setup

### Prerequisites

Ensure you have the following installed on your system:

- Node.js
- MongoDB

### Steps

1. **Clone the repository**

```bash
   git clone https://github.com/yourusername/invoice-app-backend.git
   cd invoice-app-backend
```

2. **Install dependencies**

```bash
   npm install
```

3. **Set up environment variables**
   Create a .env file in the project root and add the following:

```bash
 MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4.  **Run the server**
    For development:

```bash
   npm run dev
```

For production:

```bash
   npm start
```

The server will start at http://localhost:5000 (default port).

## API Endpoints

| Method     | Endpoint                     | Description                  | Authentication |
| ---------- | ---------------------------- | ---------------------------- | -------------- |
| **POST**   | `/login`                     | Log in a user                | No             |
| **POST**   | `/users`                     | Register a new user          | No             |
| **PUT**    | `/users/:username`           | Update user data             | Yes            |
| **DELETE** | `/users/:username`           | Delete a user                | Yes            |
| **GET**    | `/invoices`                  | Get all invoices             | Yes            |
| **GET**    | `/invoices/:id`              | Get a specific invoice by ID | Yes            |
| **POST**   | `/invoices`                  | Create a new invoice         | Yes            |
| **PUT**    | `/invoices/:id`              | Update an invoice            | Yes            |
| **PATCH**  | `/invoices/:id/mark-as-paid` | Mark an invoice as "paid"    | Yes            |
| **DELETE** | `/invoices/:id`              | Delete an invoice            | Yes            |

## Future Enhancements

Improved error handling and logging
Input sanitization for additional security
Allow filtering invoices by date and client name

## License

This project is licensed under the MIT License.
