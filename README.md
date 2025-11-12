# KidneyCare - Backend

This is the backend for KidneyCare, a web application for kidney disease prediction and kidney cancer detection.

## Description

The backend is a Node.js and Express application that provides a RESTful API for the frontend. It handles user authentication, data storage, and communication with the machine learning models.

## Features

- **User Authentication:** Secure user registration, login, and password management using JWT.
- **Kidney Disease Prediction:** An endpoint to receive health data and return a prediction.
- **Kidney Cancer Detection:** An endpoint to handle CT scan image uploads, process them, and return a classification.
- **Database:** MongoDB for storing user data and detection history.
- **Security:** Implements various security measures like rate limiting, data sanitization, and helmet for protection against common vulnerabilities.
- **Email Service:** Sends emails for events like password reset.

## API Endpoints

### Authentication

- `POST /api/v1/users/signup` - Register a new user.
- `POST /api/v1/users/login` - Log in a user.
- `GET /api/v1/users/logout` - Log out a user.
- `POST /api/v1/users/forgotPassword` - Send a password reset token.
- `PATCH /api/v1/users/resetPassword/:token` - Reset the password.

### Detections

- `POST /api/v1/detections/predict-kidney-cancer` - Upload a CT scan for cancer detection.
- `POST /api/v1/detections/predict-kidney-disease` - Get a kidney disease prediction.
- `GET /api/v1/detections` - Get all detections for the logged-in user.

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB
- An account with an email service provider (e.g., SendGrid, Mailgun) for sending emails.

### Installation

1. Clone the repository.
2. Navigate to the `kidney-cancer-backend` directory:
   ```sh
   cd kidney-cancer-backend
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```
4. Create a `.env` file in the root of the `kidney-cancer-backend` directory and add the necessary environment variables.

## Environment Variables

Create a `.env` file in the root of the backend directory and add the following variables:

```
NODE_ENV=development
PORT=8001
DATABASE=<your_mongodb_connection_string>
DATABASE_PASSWORD=<your_mongodb_password>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_HOST=<your_email_host>
EMAIL_PORT=<your_email_port>
EMAIL_USERNAME=<your_email_username>
EMAIL_PASSWORD=<your_email_password>
EMAIL_FROM=<your_from_email>
```

## Available Scripts

### `npm start`

Runs the server in production mode.

### `npm run dev`

Runs the server in development mode with nodemon, which automatically restarts the server on file changes.

## Dependencies

- **express:** Web framework for Node.js.
- **mongoose:** MongoDB object modeling tool.
- **jsonwebtoken:** For generating and verifying JSON Web Tokens.
- **bcryptjs:** For hashing passwords.
- **nodemailer:** For sending emails.
- **multer:** Middleware for handling `multipart/form-data`, used for file uploads.
- **sharp:** For image processing.
- And many more for security, utility, and development.
