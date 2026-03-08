
# 🎫 Digital Coupon Marketplace API

A robust, production-ready backend system for a digital marketplace. This project manages coupon-based products and enforces strict business logic for two distinct sales channels: Direct Customers and External Resellers.

## 🚀 Features

- **Automated Pricing Logic**: Server-side calculation of `minimum_sell_price` based on cost and margin.
- **Atomic Transactions**: Uses MongoDB atomic operations to ensure a coupon can never be sold to two people at once (Race-Condition protection).
- **Data Hiding & Security**: Implements strict field masking to ensure resellers/customers never see internal cost prices or margins.
- **Reseller API**: Authenticated endpoints using Bearer Token validation.
- **Dockerized Architecture**: One-command setup for the entire stack (Node.js + MongoDB).

---

## 🏗️ Architecture

The project follows a clean **Controller-Repository** pattern to separate business logic from database operations, ensuring the code is modular and easy to test.

---

## 🚦 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [MongoDB Compass](https://www.mongodb.com/products/compass) (optional, for database visualization).

### Installation & Setup
1. **Clone the repository:**
```bash
   git clone https://github.com/idaninbar/NexusTask
   cd NexusProject
```

2. **Spin up the environment:**
```bash
docker-compose up --build
```


This command builds the Node.js image and pulls MongoDB. The API will be live at `http://localhost:3000`.

---

## 🔍 Database Visualization (MongoDB Compass)

Since Docker runs in an isolated network and many machines have a local MongoDB service already running, we have mapped the Docker DB to a unique port to avoid collisions.

**Connection Details:**

* **URI:** `mongodb://localhost:27018/`
* **Database Name:** `digital_coupon`
* **Collection:** `coupons`

> **Note:** The `digital_coupon` database will only appear in Compass **after** you have saved your first product (due to MongoDB's "lazy creation").

---

## 🧪 Comprehensive Testing

The project includes a high-coverage integration test suite (`test.js`) that verifies:

1. **Validation Rules**: Rejection of negative costs or missing fields.
2. **Pricing Math**: Confirms 
$$minimum\_sell\_price = cost\_price \times (1 + \frac{margin\_percentage}{100})$$


 is calculated correctly.
3. **Data Privacy**: Ensures sensitive fields are stripped from JSON responses.
4. **Concurrency**: Simulates 5 simultaneous "Buy" requests to prove only 1 succeeds.

**To run the tests:**

1. Ensure the docker containers are running.
2. Open a new terminal and run:
```bash
node test.js
```



---

## 📡 API Reference

### Admin API (Management)

* `POST /api/v1/admin/products` - Create a coupon.
* `PUT /api/v1/admin/products/:id` - Update price/margin (Triggers recalculation).
* `DELETE /api/v1/admin/products/:id` - Remove a product.

### Reseller API (Authenticated)

**Header:** `Authorization: Bearer secret-reseller-token`

* `GET /api/v1/products` - View available coupons (Abstracted view).
* `POST /api/v1/products/:id/purchase` - Purchase with custom `reseller_price`.

### Customer API (Public)

* `GET /api/v1/products` - View available coupons.
* `POST /api/v1/customer/products/:id/purchase` - Direct purchase at `minimum_sell_price`.

---

## 📂 Project Structure

```text
├── controllers/      # Request handling & Response formatting
├── models/           # Mongoose Schemas & Pricing Middleware
├── repositories/     # Atomic Database operations
├── routes/           # API Routing definitions
├── middleware/       # Authentication (Bearer Token)
├── test.js           # Full Integration Test Suite
├── Dockerfile        # Container configuration
└── docker-compose.yml # Service orchestration

```



