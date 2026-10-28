# SpendSmart

SpendSmart is a personal finance tracker built as a full-stack college project.
It helps a user record income and expenses, understand monthly spending, and set
category budgets. The interface is responsive and designed to be clear during a
live project presentation.

## Features

- Monthly overview with income, expenses, net cash flow, and budget limits
- Six-month expense trend and category spending chart
- Transaction create, read, update, and delete operations
- Transaction search and income/expense filters
- Month filtering for transaction history
- Monthly category budgets with progress bars and over-budget feedback
- Custom income and expense categories
- Server generated monthly reports with month-over-month comparisons
- Server-side request validation and MongoDB persistence
- Responsive navigation, empty states, loading feedback, and error recovery

## Technology

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | React 19, Vite, React Router |
| Styling          | Tailwind CSS 4, custom CSS   |
| Charts and icons | Recharts, Lucide React       |
| HTTP client      | Axios                        |
| Backend          | Node.js, Express 4           |
| Database         | MongoDB with Mongoose        |

## Project structure

```text
client/
  src/
    App.jsx              Route declarations and lazy-loaded pages
    components/          Shared app shell, page header, and metric card
    pages/               Dashboard, transactions, budgets, reports, and categories
    services/api.js      API client and resource request helpers
    utils/finance.js      Shared currency, date, and category helpers
server/
  models/              Mongoose schemas for transactions, budgets, and categories
  routes/              Validated REST endpoints
  server.js            Express setup, database connection, and health endpoint
```

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB (local or hosted)

## Run locally

Configure the backend environment:

```sh
cd server
cp .env.example .env
```

Set `MONGODB_URI` in `server/.env`, then install and start the API:

```sh
npm install
npm run dev
```

In a second terminal, start the frontend:

```sh
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:5000` by
default. `GET /api/health` reports whether MongoDB is connected. To use a
different API address, set `VITE_API_URL` in `client/.env.local`.

## API overview

| Method      | Endpoint                             | Purpose                                                 |
| ----------- | ------------------------------------ | ------------------------------------------------------- |
| GET         | `/api/health`                        | API and database status                                 |
| GET, POST   | `/api/transactions`                  | List or create transactions                             |
| PUT, DELETE | `/api/transactions/:id`              | Update or remove a transaction                          |
| GET         | `/api/budgets?month=YYYY-MM`         | List monthly budgets                                    |
| POST        | `/api/budgets`                       | Create a category budget                                |
| PUT, DELETE | `/api/budgets/:id`                   | Update or remove a budget                               |
| GET, POST   | `/api/categories`                    | List or create custom categories                        |
| PUT, DELETE | `/api/categories/:id`                | Update or remove an unused category                     |
| GET         | `/api/reports/monthly?month=YYYY-MM` | Monthly totals, categories, and six-month trend         |

## Presentation walkthrough

1. Start with the monthly overview and expense charts.
2. Add custom categories, then record income and expense transactions.
3. Set budgets by category and month, then show their progress on the overview.
4. Open Reports and explain the monthly comparison and server aggregation
   endpoint.
5. Briefly explain the React → Express → MongoDB flow.

Use sample records and a test database for a presentation. This project is a
single personal workspace: it does not currently include login or per-user data
separation, so do not expose its API to untrusted users.

## Configuration

`server/.env.example` contains the backend variables. `client/.env.example`
documents the optional frontend API URL. Keep real credentials in local
environment files and out of source control.
# spendSmart
