# 💰 Expense Tracker - MERN Stack

A full-stack expense tracking application built with MongoDB, Express.js, React, and Node.js.

## Features

- 🔐 **JWT Authentication** - Secure login and registration
- 💵 **Transaction Management** - Add, edit, delete income and expenses
- 📊 **Analytics Dashboard** - Pie charts and line charts for spending insights
- 🏷️ **Category Filtering** - Filter transactions by category
- 🔍 **Search** - Search transactions by description
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js, JWT |
| Database | MongoDB with Mongoose |
| DevOps | Docker, docker-compose |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Docker)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start MongoDB
Make sure MongoDB is running on `localhost:27017`

### 3. Seed Database (Optional)
```bash
npm run seed
```
Creates test users:
- `user@test.com` / `password123`
- `admin@test.com` / `password123`

### 4. Start Development Servers
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
expense-tracker/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error handling
│   ├── server.js        # Express server
│   └── seed.js          # Database seeder
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   └── utils/       # API utility
│   └── ...config files
├── docker-compose.yml
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/transactions | Get all transactions |
| POST | /api/transactions | Create transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| GET | /api/analytics/summary | Get summary stats |
| GET | /api/analytics/by-category | Get category breakdown |
| GET | /api/analytics/trends | Get monthly trends |

## Docker Deployment

```bash
docker-compose up -d
```

Access at http://localhost:3000

## License

MIT
