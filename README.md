# Expense Tracker Application

A personal expense tracking web application built with React and Node.js. It allows users to log daily expenses, set category budgets, and view spending analytics through charts and reports. The project was built as a portfolio piece demonstrating full-stack development with modern JavaScript technologies.

---

## Live Demo

> Deploy links will be added here once the application is hosted on Render (backend) and Vercel (frontend).

---

## Screenshots

> Screenshots will be added here after deployment. The application includes a dashboard with spending charts, an expense management table with filters, a budget tracker with progress bars, and a reports page with CSV export.

---

## Features

- User registration and login with JWT authentication
- Add, edit, and delete expenses with category, payment method, and notes
- Filter expenses by date range, category, payment method, and amount
- Set monthly, weekly, or yearly budgets per category with live progress tracking
- Dashboard with summary cards, a daily spending trend chart, and a category breakdown chart
- Reports page with spending analysis by category and CSV export
- Category management — use default categories or create your own with a custom icon and color
- Profile settings — update name, email, currency preference, and password
- Light and dark mode toggle
- Fully responsive layout for desktop and mobile

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React 18 with Vite                      |
| UI Framework | Bootstrap 5 and React-Bootstrap         |
| Charts       | Recharts                                |
| Backend      | Node.js with Express.js                 |
| Database     | PostgreSQL                              |
| ORM          | Sequelize                               |
| Auth         | JSON Web Tokens (JWT) and bcrypt        |
| Validation   | Zod (backend) and React Hook Form (frontend) |
| HTTP Client  | Axios                                   |
| Date Handling| date-fns                                |

---

## Prerequisites

Before running this project locally, make sure you have the following installed:

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm 9 or higher
- Git

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Martin888Maina/Expense-Tracker-Application.git
cd Expense-Tracker-Application
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Open the `.env` file and fill in your PostgreSQL connection details:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/expense_tracker
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Run database migrations and seed the default categories:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Start the development server:

```bash
npm run dev
```

The backend will be running at `http://localhost:5000`.

### 3. Set up the frontend

Open a new terminal window:

```bash
cd client
npm install
cp .env.example .env
```

The default `.env` content for the frontend is:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the React development server:

```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`.

---

## Environment Variables

### Backend (server/.env)

| Variable       | Description                                      | Example                          |
|----------------|--------------------------------------------------|----------------------------------|
| DATABASE_URL   | PostgreSQL connection string                     | postgresql://user:pass@localhost:5432/expense_tracker |
| JWT_SECRET     | Secret key used to sign JWT tokens               | a_long_random_secret_string      |
| JWT_EXPIRES_IN | How long tokens stay valid                       | 7d                               |
| PORT           | Port the Express server listens on               | 5000                             |
| NODE_ENV       | Application environment                          | development                      |
| CLIENT_URL     | Frontend origin for CORS                         | http://localhost:5173             |

### Frontend (client/.env)

| Variable      | Description                          | Example                        |
|---------------|--------------------------------------|--------------------------------|
| VITE_API_URL  | Base URL for all API requests        | http://localhost:5000/api      |

---

## Project Structure

```
Expense-Tracker-Application/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── components/         # Reusable UI components
│       │   ├── auth/           # ProtectedRoute
│       │   ├── budgets/        # BudgetCard, BudgetForm
│       │   ├── common/         # ConfirmModal, EmptyState
│       │   ├── dashboard/      # SummaryCards, SpendingCharts, RecentTransactions
│       │   ├── expenses/       # ExpenseForm, ExpenseList, ExpenseFilters
│       │   └── layout/         # Sidebar, Topbar, PageWrapper
│       ├── context/            # AuthContext, ThemeContext
│       ├── hooks/              # useExpenses, useBudgets, useCategories, useDashboard
│       ├── pages/              # Route-level page components
│       └── services/           # Axios API service modules
│
├── server/                     # Express backend
│   └── src/
│       ├── controllers/        # Route handler logic
│       ├── middleware/         # JWT auth, validation, error handling
│       ├── routes/             # Express route definitions
│       ├── schemas/            # Zod validation schemas
│       └── utils/              # Token helpers, date utilities
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## API Overview

The backend exposes RESTful endpoints under the `/api` prefix. All routes except `/api/auth/register` and `/api/auth/login` require a valid JWT in the `Authorization` header.

| Resource    | Base Path          | Operations                              |
|-------------|--------------------|-----------------------------------------|
| Auth        | /api/auth          | Register, Login, Logout, Profile, Password, Delete Account |
| Expenses    | /api/expenses      | List (filtered + paginated), Create, Read, Update, Delete, Bulk Delete, CSV Export |
| Budgets     | /api/budgets       | List (with live spend %), Create, Read, Update, Delete |
| Categories  | /api/categories    | List, Create, Update, Delete            |
| Reports     | /api/reports       | Summary, By Category, Trends, Month Comparison |

---

## Default Categories

The seed script creates the following categories for every new installation:

| Category       | Icon               |
|----------------|--------------------|
| Food & Dining  | bi-cup-hot         |
| Transport      | bi-bus-front       |
| Housing & Rent | bi-house           |
| Utilities      | bi-lightning       |
| Entertainment  | bi-film            |
| Shopping       | bi-bag             |
| Healthcare     | bi-heart-pulse     |
| Education      | bi-book            |
| Personal Care  | bi-scissors        |
| Savings        | bi-piggy-bank      |
| M-Pesa Charges | bi-phone           |
| Other          | bi-three-dots      |

---

## Future Enhancements

- Recurring expenses with automatic monthly entry
- M-Pesa SMS parsing to auto-import transactions
- Income tracking alongside expenses
- Receipt photo upload
- Push notifications when a budget limit is approaching
- PWA support for offline access
- Multi-currency with live exchange rate conversion

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Author

Martin Maina
GitHub: [Martin888Maina](https://github.com/Martin888Maina)
