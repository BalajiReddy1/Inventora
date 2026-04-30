# Inventora — Inventory Management System

A full-stack warehouse and inventory management system built with a **Node.js/Express** backend, a **React/Vite** frontend, and a **PostgreSQL** database managed through **Prisma ORM**. The project includes a CI/CD pipeline driven by **Jenkins**, automated deployment via **Ansible**, and end-to-end tests written with **Selenium + TestNG**.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running with Docker Compose](#running-with-docker-compose)
- [Environment Variables](#environment-variables)
- [Email Configuration](#email-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment](#deployment)
- [Testing](#testing)

---

## Overview

Inventora provides warehouse teams with tools to manage products, track real-time stock levels across multiple locations, process outbound delivery orders, and control user access through a role-based system. Every stock movement — receipts, deliveries, adjustments, and internal transfers — is recorded in an immutable ledger for full auditability.

**Key capabilities:**

- Multi-warehouse, multi-location stock tracking
- Delivery order lifecycle management (Draft → Waiting → Ready → Done)
- Stock adjustments with reason codes and ledger entries
- Internal stock transfers between locations
- Low-stock alerting based on configurable reorder levels
- JWT-based authentication with cookie storage and automatic token refresh
- OTP-based password reset delivered via email
- Role-based access control (Admin, Inventory Manager, Warehouse Staff)

---

## Architecture

```
┌─────────────────────┐        HTTP/REST         ┌──────────────────────────┐
│   React + Vite      │ ◄─────────────────────►  │   Express.js API         │
│   (port 5173 / 80)  │    JWT via HttpOnly      │   (port 5000)            │
│                     │    Cookies               │                          │
│  - React Router v7  │                          │  - Helmet (security)     │
│  - Radix UI         │                          │  - Rate limiting         │
│  - Tailwind CSS v4  │                          │  - CORS                  │
│  - React Hook Form  │                          │  - Morgan logging        │
│  - Zod validation   │                          │  - Prisma ORM            │
│  - Sonner toasts    │                          │  - Zod/Joi validation    │
└─────────────────────┘                          └──────────┬───────────────┘
                                                            │
                                                            │ Prisma Client
                                                            ▼
                                                 ┌──────────────────────────┐
                                                 │   PostgreSQL (Neon)      │
                                                 │   Serverless DB          │
                                                 └──────────────────────────┘
```

Both services are containerized with Docker and orchestrated via Docker Compose. Deployment to the target host is handled by an Ansible playbook triggered from a Jenkins pipeline.

---

## Tech Stack

### Backend

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL (Neon serverless) |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Validation | Joi, Zod |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, cookie-parser |
| Logging | Morgan |

### Frontend

| Component | Technology |
|-----------|-----------|
| Framework | React 19 |
| Build tool | Vite 7 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Component library | Radix UI |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| HTTP client | Axios |
| Notifications | Sonner |
| Theme | next-themes |

### Infrastructure & Testing

| Component | Technology |
|-----------|-----------|
| Containerization | Docker, Docker Compose |
| CI/CD | Jenkins (declarative pipeline) |
| Deployment automation | Ansible |
| E2E / UI testing | Selenium WebDriver 4, TestNG 7, Java 17 |
| Build tool (tests) | Maven |

---

## Project Structure

```
Inventora/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Full database schema
│   │   └── seed.js                # Seed data for development
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, login, OTP, password reset
│   │   │   ├── inventoryController.js  # Warehouse & location CRUD
│   │   │   └── stockController.js # Stock overview, adjust, transfer, receive
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication & role authorization
│   │   │   ├── errorHandler.js    # Global error & 404 handlers
│   │   │   └── validation.js      # Joi request validation middleware
│   │   ├── routes/
│   │   │   ├── auth.js            # /api/auth/*
│   │   │   ├── customers.js       # /api/customers/*
│   │   │   ├── delivery.js        # /api/deliveries/*
│   │   │   ├── email.js           # /api/email/*
│   │   │   ├── inventoryRoutes.js # /api/inventory/*
│   │   │   ├── locations.js       # /api/locations/*
│   │   │   └── products.js        # /api/products/*
│   │   ├── utils/
│   │   │   ├── emailService.js    # Nodemailer with HTML templates
│   │   │   ├── otpService.js      # OTP generation & database persistence
│   │   │   └── tokenService.js    # JWT sign, verify, extract
│   │   └── server.js              # Express app entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── EMAIL_SETUP.md
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx     # Root layout wrapper
│   │   │   │   ├── Navbar.jsx     # Top navigation bar
│   │   │   │   └── Sidebar.jsx    # Navigation sidebar
│   │   │   └── ui/                # Radix UI-based component library
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx    # Auth state, login/logout, token refresh
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── SignUpPage.jsx
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   └── OTPVerificationPage.jsx
│   │   │   ├── DashboardPage.jsx      # Metrics, warehouse overview, low stock
│   │   │   ├── DeliveryPage.jsx       # Delivery order list & creation
│   │   │   ├── DeliveryDetailPage.jsx # Per-delivery pick/pack/validate flow
│   │   │   ├── StockOverviewPage.jsx  # Stock levels across all locations
│   │   │   └── WarehousePage.jsx      # Warehouse & location management
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance with interceptors
│   │   │   └── inventoryService.js # Typed API calls per domain
│   │   ├── App.jsx                # Router setup & protected route guard
│   │   └── main.jsx               # React DOM entry point
│   ├── Dockerfile
│   └── package.json
│
├── selenium-tests/
│   ├── src/test/java/
│   │   └── InventoraTest.java     # Backend API + Selenium UI tests
│   └── pom.xml                    # Maven: Selenium 4, TestNG 7, WebDriverManager
│
├── Jenkinsfile                    # Declarative CI pipeline
├── Jenkinsfile.scripted           # Scripted CI pipeline (alternative)
├── deploy.yml                     # Ansible playbook for deployment
├── docker-compose.yml             # Multi-service container orchestration
└── inventory.ini                  # Ansible host inventory
```

---

## Database Schema

The schema is defined in `backend/prisma/schema.prisma` and targets PostgreSQL.

### Core Models

| Model | Purpose |
|-------|---------|
| `User` | Application users with role assignment |
| `OTPToken` | Time-limited OTP tokens for password reset |
| `Product` | Products with SKU, unit of measure, and reorder thresholds |
| `ProductCategory` | Hierarchical category tree (self-referencing) |
| `Warehouse` | Physical warehouse facilities |
| `Location` | Named storage locations within a warehouse |
| `StockLocation` | Current quantity and reserved quantity per product per location |
| `StockLedger` | Immutable movement log for every stock change |
| `Receipt` | Inbound goods receipt headers |
| `ReceiptLine` | Line items on a receipt |
| `Supplier` | Supplier master data |
| `DeliveryOrder` | Outbound delivery order headers |
| `DeliveryOrderLine` | Line items with picked/packed/delivered quantities |
| `Customer` | Customer master data |
| `InternalTransfer` | Stock movement between two internal locations |
| `InternalTransferLine` | Line items on an internal transfer |
| `StockAdjustment` | Manual stock correction records |
| `StockAdjustmentLine` | Per-line recorded vs. counted quantities and difference |

### Key Enumerations

| Enum | Values |
|------|--------|
| `UserRole` | `ADMIN`, `INVENTORY_MANAGER`, `WAREHOUSE_STAFF` |
| `LocationType` | `STORAGE`, `PRODUCTION`, `RECEIVING`, `SHIPPING`, `DAMAGED`, `QUARANTINE` |
| `DocumentStatus` | `DRAFT`, `WAITING`, `READY`, `DONE`, `CANCELED` |
| `DocumentType` | `RECEIPT`, `DELIVERY`, `ADJUSTMENT`, `TRANSFER` |
| `MovementType` | `IN`, `OUT` |
| `AdjustmentReason` | `PHYSICAL_COUNT`, `DAMAGE`, `THEFT`, `EXPIRY`, `CORRECTION`, `OTHER` |

---

## API Reference

All endpoints (except auth) require a valid JWT access token. The token is read first from the `accessToken` HttpOnly cookie, then from the `Authorization: Bearer <token>` header.

### Authentication — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create a new user account |
| POST | `/login` | No | Authenticate and receive JWT cookies |
| POST | `/refresh` | No | Issue new access/refresh token pair |
| POST | `/logout` | No | Clear authentication cookies |
| POST | `/forgot-password` | No | Send OTP to the registered email |
| POST | `/verify-otp` | No | Validate a one-time code |
| POST | `/reset-password` | No | Set a new password using a valid OTP |
| GET | `/profile` | Yes | Return the authenticated user's profile |

### Products — `/api/products`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List all active products with stock totals |
| GET | `/:id` | Yes | Get a single product with stock locations and recent ledger entries |
| POST | `/` | Yes | Create a new product |
| PUT | `/:id` | Yes | Update product details |
| DELETE | `/:id` | Yes | Delete a product |

### Inventory — `/api/inventory`

#### Warehouses

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/warehouses` | Yes | List all warehouses with aggregate stats |
| GET | `/warehouses/:id` | Yes | Get a specific warehouse |
| POST | `/warehouses` | Yes | Create a warehouse |
| PUT | `/warehouses/:id` | Yes | Update a warehouse |
| DELETE | `/warehouses/:id` | Yes | Delete a warehouse |

#### Locations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/locations` | Yes | List locations, optionally filtered by `?warehouseId=` |
| POST | `/locations` | Yes | Create a location |
| PUT | `/locations/:id` | Yes | Update a location |
| DELETE | `/locations/:id` | Yes | Delete a location |

#### Stock

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/stock` | Yes | Stock overview with optional filters (`warehouseId`, `locationId`, `productId`, `lowStock`) and statistics |
| GET | `/stock/product/:productId` | Yes | All locations holding a specific product |
| POST | `/stock/adjust` | Yes | Adjust stock (`INCREASE`, `DECREASE`, or `SET`) |
| POST | `/stock/transfer` | Yes | Transfer stock between two locations |
| POST | `/stock/receive` | Yes | Receive stock from a supplier |

### Deliveries — `/api/deliveries`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List all delivery orders |
| GET | `/:id` | Yes | Get a delivery with all line details |
| POST | `/` | Yes | Create a new delivery order (status: DRAFT) |
| PUT | `/:id` | Yes | Update delivery header fields |
| PATCH | `/:id/status` | Yes | Set status explicitly |
| POST | `/:id/pick` | Yes | Mark all lines as picked; move status to READY |
| POST | `/:id/pack` | Yes | Mark all lines as packed |
| POST | `/:id/validate` | Yes | Confirm delivery; deduct stock and write ledger entries; set status to DONE |
| DELETE | `/:id` | Yes | Delete a delivery (only if not DONE) |

### Customers — `/api/customers`

CRUD operations for customer records.

### Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns `200 OK` with server status and timestamp |

---

## Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/signup` | Registration | Public |
| `/forgot-password` | Forgot Password | Public |
| `/verify-otp` | OTP Verification | Public |
| `/dashboard` | Dashboard — metrics, warehouse overview, low-stock panel, quick actions | Protected |
| `/stock` | Stock Overview — product stock across all locations with filters | Protected |
| `/warehouses` | Warehouse & Location Management | Protected |
| `/delivery` | Delivery Orders — list, create, filter | Protected |
| `/delivery/:id` | Delivery Detail — pick / pack / validate workflow | Protected |

Unauthenticated requests to protected routes are automatically redirected to `/login`. After login, the `AuthContext` manages the user session and handles background token refresh.

---

## Authentication

The system uses a dual-token strategy:

- **Access token** — short-lived (15 minutes), stored in an HttpOnly cookie.
- **Refresh token** — long-lived (7 days), stored in an HttpOnly cookie.

On every API request, the auth middleware extracts the access token from the cookie (or `Authorization` header as a fallback) and verifies it. When the access token expires, the frontend automatically calls `POST /api/auth/refresh` to obtain new tokens without requiring the user to log in again.

Passwords are hashed with `bcryptjs` using 12 salt rounds. OTPs for password reset are persisted in the `OTPToken` table with a 10-minute expiry and are deleted upon successful use.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A PostgreSQL database (the project is configured for [Neon](https://neon.tech) but works with any PostgreSQL instance)
- Docker and Docker Compose (for containerized setup)
- Java 17 and Maven (to run Selenium tests)
- Chrome browser (for Selenium tests)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and other values (see Environment Variables section)

# Generate Prisma client
npm run db:generate

# Push schema to the database (development)
npm run db:push

# Optional: seed the database
npm run db:seed

# Start the development server
npm run dev
```

The API will be available at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The UI will be available at `http://localhost:5173`.

### Running with Docker Compose

```bash
# From the project root
docker-compose up --build
```

This starts:
- `inventora-backend` on port `5000`
- `inventora-frontend` on port `80`

> **Note:** You must supply the backend environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`) before running. The current `docker-compose.yml` sets `NODE_ENV=production` and `PORT=5000` only; all other variables must be injected into the container's environment or passed via an `.env` file mount.

---

## Environment Variables

Create `backend/.env` based on the following variables:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"

# JWT
JWT_SECRET=<your-access-token-secret>
JWT_REFRESH_SECRET=<your-refresh-token-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_SECURE=false          # Set to true in production (requires HTTPS)
COOKIE_SAME_SITE=lax

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=1000

# Email (choose one of the options below)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-char-app-password

# OR generic SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

---

## Email Configuration

The backend uses Nodemailer to send:

- **Welcome email** — sent after successful registration
- **OTP email** — sent during password reset
- **Password change notification** — sent after a successful password reset

For development, configure Gmail with a [Google App Password](https://support.google.com/accounts/answer/185833). For production, use a dedicated transactional email provider (SendGrid, Mailgun, AWS SES, etc.).

See [`backend/EMAIL_SETUP.md`](backend/EMAIL_SETUP.md) for detailed configuration steps and troubleshooting.

If no email credentials are configured, the server starts normally but email sending will fail silently (errors are caught and logged, not propagated to the client).

---

## CI/CD Pipeline

The `Jenkinsfile` defines a declarative Jenkins pipeline with the following stages:

| Stage | Actions |
|-------|---------|
| Checkout | Clones the repository from SCM |
| Install Dependencies | Runs `npm install` in both `backend/` and `frontend/` |
| Build Frontend | Runs `npm run build` in `frontend/` to produce the static bundle |
| Test Frontend | Runs `npm test` in `frontend/` |

A scripted pipeline variant is available in `Jenkinsfile.scripted`.

The pipeline requires a Jenkins NodeJS tool installation named `node`.

---

## Deployment

Deployment is automated using the Ansible playbook at `deploy.yml`, targeting the host group `webserver` defined in `inventory.ini`.

The playbook performs the following tasks in order:

1. Installs Docker on the target server (via `apt`)
2. Creates the project directory at `/var/www/inventora`
3. Clones the latest code from `https://github.com/BalajiReddy1/Inventora.git`
4. Runs `docker-compose down --remove-orphans` followed by `docker-compose up -d --build`

```bash
# Run the deployment playbook
ansible-playbook -i inventory.ini deploy.yml
```

The default `inventory.ini` targets `localhost` with a local connection, suitable for single-machine deployments or testing the playbook locally.

---

## Testing

### Selenium Tests (Java / TestNG / Maven)

The `selenium-tests/` module contains end-to-end tests that cover both the backend REST API and the frontend UI.

**Test cases:**

| Priority | Test | Type |
|----------|------|------|
| 1 | `testBackendHealthCheck` — `GET /health` returns `200` | API |
| 2 | `testLoginAPIInvalidCredentials` — `POST /api/auth/login` with wrong credentials returns `401` or `400` | API |
| 3 | `testLoginPageTitle` — Login page has correct document title | UI (Selenium) |
| 4 | `testDashboardRedirectsWithoutAuth` — Accessing `/dashboard` without a session redirects to `/login` | UI (Selenium) |

Tests 3 and 4 use Chrome in headless mode via WebDriverManager (no manual ChromeDriver installation required).

**Running the tests:**

```bash
# Ensure both backend (port 5000) and frontend (port 5173) are running

cd selenium-tests
mvn test
```

**Dependencies:**

- Selenium Java 4.18.1
- TestNG 7.9.0
- WebDriverManager 5.8.0 (auto-downloads compatible ChromeDriver)
- Java 17, Maven

---

## License

This project does not currently specify a license.
