# Expense Tracker Application

A personal expense tracking web application built with React and Node.js. It allows users to log daily expenses, set category budgets, and view spending analytics through charts and reports. The project was built as a full-stack portfolio piece demonstrating modern JavaScript development practices.

---

## Features

- User registration and login with JWT authentication
- Add, edit, and delete expenses with category, payment method, date, and notes
- Filter expenses by date range, category, payment method, and search text
- Bulk delete with checkbox selection
- Export filtered expenses to CSV
- Set monthly, weekly, or yearly budgets per category with live progress tracking
- Budget status indicators: On Track, Caution, and Over Budget
- Dashboard with summary stat cards, a daily spending trend line chart, and a category breakdown donut chart
- Reports page with a horizontal bar chart and spending breakdown table by category
- Category management — use the 12 default categories or create custom ones with a chosen icon and color
- Profile settings — update name, email, currency preference, and password
- Light and dark mode toggle, persisted across sessions
- Responsive layout for both desktop and mobile

---

## Tech Stack

| Layer        | Technology                                        |
|--------------|---------------------------------------------------|
| Frontend     | React 18 with Vite                                |
| UI Framework | Bootstrap 5 and React-Bootstrap                   |
| Charts       | Recharts                                          |
| Backend      | Node.js with Express.js                           |
| Database     | PostgreSQL                                        |
| ORM          | Sequelize                                         |
| Auth         | JSON Web Tokens (JWT) and bcrypt                  |
| Validation   | Zod (backend) and React Hook Form (frontend)      |
| HTTP Client  | Axios                                             |
| Date Handling| date-fns                                          |

---

## Prerequisites

Before running this project locally, make sure you have the following installed:

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm 9 or higher (comes with Node.js)
- Git

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Martin888Maina/Expense-Tracker-Application.git
cd Expense-Tracker-Application
```

### 2. Create the PostgreSQL database

Open psql or pgAdmin and run:

```sql
CREATE DATABASE expense_tracker;
```

### 3. Set up the backend

```bash
cd server
npm install
```

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

Open `server/.env` and update these values:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/expense_tracker
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the development server. On first run, Sequelize will automatically create all the database tables:

```bash
npm run dev
```

### 4. Seed the default categories

In a separate terminal, run the seed script to populate the 12 default expense categories:

```bash
cd server
npm run seed
```

You only need to run this once. It is safe to run again — it will skip any categories that already exist.

### 5. Set up the frontend

Open another terminal window:

```bash
cd client
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

The default value works for local development without any changes:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the React development server:

```bash
npm run dev
```

Open your browser at **http://localhost:5173** and create an account to get started.

---

## Running Both Servers

You need two terminal windows open at the same time during development:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

---

## Environment Variables

### Backend — `server/.env`

| Variable       | Description                                          | Example                                                   |
|----------------|------------------------------------------------------|-----------------------------------------------------------|
| DATABASE_URL   | PostgreSQL connection string                         | postgresql://postgres:pass@localhost:5432/expense_tracker |
| JWT_SECRET     | Secret key used to sign and verify JWT tokens        | a_long_random_secret_string                               |
| JWT_EXPIRES_IN | How long tokens stay valid before requiring re-login | 7d                                                        |
| PORT           | Port the Express server listens on                   | 5000                                                      |
| NODE_ENV       | Application environment                              | development                                               |
| CLIENT_URL     | Frontend origin allowed by the CORS policy           | http://localhost:5173                                     |

### Frontend — `client/.env`

| Variable      | Description                                   | Example                   |
|---------------|-----------------------------------------------|---------------------------|
| VITE_API_URL  | Base URL prepended to all API requests        | http://localhost:5000/api |

---

## Project Structure

```
Expense-Tracker-Application/
├── client/                        # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── auth/              # ProtectedRoute
│       │   ├── budgets/           # BudgetCard, BudgetForm
│       │   ├── common/            # ConfirmModal, EmptyState
│       │   ├── dashboard/         # SummaryCards, SpendingCharts, RecentTransactions
│       │   ├── expenses/          # ExpenseForm, ExpenseList, ExpenseFilters
│       │   └── layout/            # Sidebar, Topbar, PageWrapper
│       ├── context/               # AuthContext, ThemeContext
│       ├── hooks/                 # useExpenses, useBudgets, useCategories, useDashboard
│       ├── pages/                 # DashboardPage, ExpensesPage, BudgetsPage,
│       │                          # ReportsPage, CategoriesPage, SettingsPage,
│       │                          # LoginPage, RegisterPage, NotFoundPage
│       └── services/              # Axios API service modules
│
├── server/                        # Express backend
│   └── src/
│       ├── config/                # Sequelize database connection
│       ├── controllers/           # Route handler logic
│       ├── middleware/            # JWT auth, request validation, error handling
│       ├── models/                # Sequelize models: User, Expense, Budget, Category
│       ├── routes/                # Express route definitions
│       ├── schemas/               # Zod validation schemas
│       ├── seeders/               # Default category seed script
│       └── utils/                 # Token helpers and date utilities
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## API Overview

All routes except `/api/auth/register` and `/api/auth/login` require a valid JWT sent in the `Authorization: Bearer <token>` header.

| Resource    | Base Path         | Key Operations                                                                        |
|-------------|-------------------|---------------------------------------------------------------------------------------|
| Auth        | /api/auth         | Register, Login, Logout, Get Profile, Update Profile, Change Password, Delete Account |
| Expenses    | /api/expenses     | List (paginated + filtered), Create, Read, Update, Delete, Bulk Delete, Export CSV    |
| Budgets     | /api/budgets      | List with live spend percentage, Create, Read, Update, Delete                         |
| Categories  | /api/categories   | List all (default + custom), Create, Update, Delete                                   |
| Reports     | /api/reports      | Monthly summary, By-category breakdown, Spending trends, Month comparison             |

A health check is available at `GET /api/health`.

---

## Default Categories

The seed script creates these 12 categories available to all users out of the box:

| Category       | Icon           |
|----------------|----------------|
| Food & Dining  | bi-cup-hot     |
| Transport      | bi-bus-front   |
| Housing & Rent | bi-house       |
| Utilities      | bi-lightning   |
| Entertainment  | bi-film        |
| Shopping       | bi-bag         |
| Healthcare     | bi-heart-pulse |
| Education      | bi-book        |
| Personal Care  | bi-scissors    |
| Savings        | bi-piggy-bank  |
| M-Pesa Charges | bi-phone       |
| Other          | bi-three-dots  |

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
