# ⚡ FuelControl

**Enterprise Fleet Fuel Management System**

A full-stack web application for managing fleet vehicle fuel distribution with real-time quota enforcement, role-based access control, and an AI-powered analytics copilot.

---

## Features

- 🔐 **JWT Authentication** — Admin and Operator roles with secure login
- 🚗 **Fleet Management** — Register, edit, block, and delete vehicles
- ⛽ **Fuel Transaction Logging** — Submit and track fuel requests in real time
- 🛡️ **Quota Enforcement** — Daily fuel limits per vehicle, automatically enforced
- ⏱️ **Cooldown Intervals** — Configurable waiting periods between refills
- 🚫 **Anti-Duplicate Detection** — Blocks duplicate transactions within 10 seconds
- 📊 **Consumption Charts** — Visual breakdown of fuel usage per vehicle
- 🤖 **AI Copilot** — Context-aware fleet analytics and insights
- ⌨️ **Command Palette** — `Ctrl+K` to search vehicles and trigger actions instantly

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React, Vite, Tailwind CSS, Chart.js |
| Backend   | Node.js, Express.js                 |
| Database  | PostgreSQL                          |
| Auth      | JWT (jsonwebtoken), bcrypt          |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+

### 1. Clone the repository

```bash
git clone https://github.com/MekuanintT/fuelcontrol.git
cd fuelcontrol
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file based on the example:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=Mekuanint@12
DB_NAME=fuel_system
JWT_SECRET=Mekuanint@12
PORT=5000
```

### 3. Database setup

Create the PostgreSQL database:

```sql
CREATE DATABASE fuel_system;
```

Then create the required tables:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'OPERATOR',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  fuel_quota NUMERIC(10,2) DEFAULT 100.00,
  waiting_hours INTEGER DEFAULT 24,
  status VARCHAR(10) DEFAULT 'ACTIVE'
);

CREATE TABLE fuel_transactions (
  id SERIAL PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL,
  fuel_amount NUMERIC(10,2) NOT NULL,
  fuel_time TIMESTAMP DEFAULT NOW(),
  approved BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT
);
```

Create an admin user (generate a bcrypt hash first):

```bash
node -e "require('bcrypt').hash('yourpassword', 10).then(h => console.log(h))"
```

```sql
INSERT INTO users (username, password, role)
VALUES ('admin', 'PASTE_HASH_HERE', 'ADMIN');
```

### 4. Start the backend

```bash
node server.js
# Server running on http://localhost:5000
```

### 5. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
# App running on http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint            | Auth     | Description                          |
|--------|---------------------|----------|--------------------------------------|
| POST   | `/api/auth`         | None     | Login                                |
| GET    | `/api/vehicles`     | Required | List all vehicles                    |
| POST   | `/api/vehicles`     | Admin    | Register a vehicle                   |
| PUT    | `/api/vehicles/:id` | Admin    | Update a vehicle                     |
| PATCH  | `/api/vehicles/:id` | Admin    | Toggle vehicle status                |
| DELETE | `/api/vehicles/:id` | Admin    | Delete a vehicle                     |
| GET    | `/api/fuel`         | Required | List fuel transactions               |
| POST   | `/api/fuel`         | Required | Submit a fuel request                |
| DELETE | `/api/fuel/:id`     | Admin    | Delete a transaction                 |
| GET    | `/api/reports`      | Required | Daily / weekly / per-vehicle reports |

---

## Project Structure

```
fuelcontrol/
├── backend/
│   ├── config/
│   │   └── db.js                  # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fuelController.js
│   │   ├── reportController.js
│   │   └── vehicleController.js
│   ├── middleware/
│   │   └── auth.js                # JWT authentication middleware
│   ├── models/
│   │   ├── fuelModel.js
│   │   ├── reportModel.js
│   │   ├── userModel.js
│   │   └── vehicleModel.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── fuel.js
│   │   ├── reports.js
│   │   └── vehicles.js
│   ├── .env.example
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── AICopilotDrawer.jsx
        │   ├── CommandPalette.jsx
        │   └── ThemeToggle.jsx
        ├── lib/
        │   └── ThemeContext.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── FuelRecords.jsx
        │   ├── LandingPage.jsx
        │   └── LoginPage.jsx
        └── App.jsx
```

---

## License

MIT © 2026 [MekuanintT](https://github.com/MekuanintT)
