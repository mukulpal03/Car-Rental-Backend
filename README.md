# Car Rental Backend System

A robust, lightweight REST API backend for a Car Rental System built with **Express.js**, **TypeScript**, and **Prisma ORM** (targeting a **PostgreSQL** database). This API handles secure user registration and login via JWT authentication, as well as comprehensive management of car rental bookings (CRUD operations).

---

## Features

- **User Authentication**:
  - Secure signup and login with hashed passwords (`bcryptjs`).
  - Stateless authentication using JSON Web Tokens (JWT).
- **Booking Management**:
  - Create a new booking with rental calculations and validation.
  - Retrieve bookings for the authenticated user.
  - Query parameter support for:
    - Custom summary (total count and aggregate amount spent).
    - Detailed single-booking lookup.
  - Update booking details (e.g. status tracking: `BOOKED`, `COMPLETED`, `CANCELLED`).
  - Delete booking entries securely.
- **Robust Database Layer**:
  - Prisma Client with Neon PostgreSQL driver compatibility.
  - Typed database queries.

---

## Tech Stack

- **Runtime & Language**: Node.js & TypeScript
- **Web Framework**: Express.js (v5)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Development Tooling**: `ts-node` & `nodemon`

---

## Directory Structure

```text
├── prisma/
│   ├── schema.prisma      # Prisma schema (models: User, Booking, Status enum)
│   └── migrations/        # SQL migration files
├── src/
│   ├── app.ts             # Express application initialization & middleware setup
│   ├── index.ts           # Server entry point (starts listening on PORT)
│   ├── controllers/       # Controller functions for business logic
│   │   ├── auth.ts        # Signup & Login controllers
│   │   └── booking.ts     # CRUD booking controllers
│   ├── lib/
│   │   └── prisma.ts      # Prisma Client setup with pg adapter
│   ├── middleware/
│   │   └── auth.ts        # JWT verification middleware
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes (/auth)
│   │   └── booking.ts     # Booking routes (/bookings)
│   └── types.d.ts         # TypeScript custom definitions (e.g., req.user mapping)
├── .env.example           # Example environment variables template
├── package.json           # Dependencies and scripts configuration
└── tsconfig.json          # TypeScript compiler configuration
```

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **pnpm** (Package manager, v10+ recommended)
- **PostgreSQL** database instance (e.g. Neon, local PG server)

---

## Setup & Installation

Follow these steps to run the project locally:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd car-rental-system-backend
   ```

2. **Install Dependencies**:
   This project uses `pnpm` as its package manager.
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and copy the contents from `.env.example`. Populate the values correctly:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<dbname>?sslmode=require"
   JWT_SECRET="your-super-secure-jwt-secret-key"
   ```

4. **Initialize Prisma Database Schema**:
   Run the following commands to generate the Prisma client code and push/migrate your schema:
   ```bash
   pnpm prisma generate
   ```
   If running migrations on a live DB:
   ```bash
   pnpm prisma db push
   ```

5. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   The backend server should start up on the port specified in `.env` (default is `3000`).

---

## Database Models

Refer to the Prisma schema (`prisma/schema.prisma`) for full details:

### User
- `id` (Int, Primary Key, Auto-increment)
- `username` (String, Unique)
- `password` (String, hashed)
- `created_at` (DateTime, default `now()`)

### Booking
- `id` (Int, Primary Key, Auto-increment)
- `user_id` (Int, Foreign Key pointing to `User`)
- `car_name` (String)
- `days` (Int)
- `rent_per_day` (Int)
- `status` (Enum: `BOOKED`, `COMPLETED`, `CANCELLED`, default `BOOKED`)
- `created_at` (DateTime, default `now()`)

---

## API Reference

### 1. Authentication Endpoints

#### Sign Up User
- **URL**: `/auth/signup`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "exampleUser",
    "password": "strongPassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "User created successfully",
      "userId": 1
    }
  }
  ```

#### Log In User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "exampleUser",
    "password": "strongPassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

---

### 2. Booking Endpoints (Protected)
> All endpoints under `/bookings` require a valid JWT token sent in the request header:
> `Authorization: Bearer <your_jwt_token>`

#### Create a Booking
- **URL**: `/bookings`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "carName": "Toyota Camry",
    "days": 5,
    "rentPerDay": 60
  }
  ```
  *(Note: Days must be <= 365, Rent per day must be <= 2000)*
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Booking created successfully",
      "bookingId": 1,
      "totalCost": 300
    }
  }
  ```

#### Get User Bookings
- **URL**: `/bookings`
- **Method**: `GET`
- **Query Parameters (Optional)**:
  - `summary=true`: Retrieve high-level spending statistics instead of lists.
  - `bookingId=<id>`: Retrieve detail for a specific booking.
- **Success Response - All Bookings (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "bookings": [
        {
          "id": 1,
          "user_id": 1,
          "car_name": "Toyota Camry",
          "days": 5,
          "rent_per_day": 60,
          "status": "BOOKED",
          "created_at": "2026-07-16T08:00:00.000Z"
        }
      ]
    }
  }
  ```
- **Success Response - Summary View (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "userId": 1,
      "username": "exampleUser",
      "totalBookings": 1,
      "totalAmountSpent": 300
    }
  }
  ```
- **Success Response - Single Booking Detail (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "car_name": "Toyota Camry",
        "days": 5,
        "rent_per_day": 60,
        "status": "BOOKED",
        "totalCost": 300
      }
    ]
  }
  ```

#### Update a Booking
- **URL**: `/bookings/:bookingId`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "carName": "Toyota Camry (Upgraded)",
    "days": 6,
    "rentPerDay": 65,
    "status": "COMPLETED"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Booking updated successfully",
      "booking": {
        "id": 1,
        "user_id": 1,
        "car_name": "Toyota Camry (Upgraded)",
        "days": 6,
        "rent_per_day": 65,
        "status": "COMPLETED",
        "created_at": "2026-07-16T08:00:00.000Z"
      }
    }
  }
  ```

#### Delete a Booking
- **URL**: `/bookings/:bookingId`
- **Method**: `DELETE`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Booking deleted successfully"
    }
  }
  ```
