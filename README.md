# FINZ Financial Review

I built this project to make financial review more practical and easier to understand. It helps me track business transactions, review uncertain entries, analyze performance trends, and ask questions about the financial story behind the numbers.

The app brings together a full-stack workflow: transactions are imported, categorized, reviewed, and analyzed through a clean dashboard. I also added an AI analyst layer so the user can ask natural-language questions about revenue, operating profit, monthly P&L, review items, and variance changes.

## What this project does

This application is designed around a simple business workflow:

- import transaction data from CSV
- review entries that may need manual classification
- classify transactions into financial categories for P&L tracking
- monitor revenue, gross profit, operating profit, and operating expenses
- compare monthly performance and spot variance changes
- use AI to answer business questions from the actual dataset

## Why I built it

I wanted a project that feels like a real financial operations tool rather than just a basic dashboard. The goal was to combine data review, business metrics, and intelligence in one place so I can quickly understand what is happening in the financial data and what needs attention.

## Repository

The project repository is called `financial-review` and is hosted on GitHub:

https://github.com/Chandra-006/financial-review

To clone the project to your computer, open a terminal and run:

```bash
git clone https://github.com/Chandra-006/financial-review.git
cd financial-review
```

After cloning, install and run the backend and frontend from their respective folders as described in the setup section below.

## Project structure

```text
financial-review/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   ├── .env
│   ├── package.json
│   └── src/server.js
├── data/
│   └── finz_transactions.csv
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── README.md
└── .gitignore
```

## Tech stack

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express
- PostgreSQL
- pg
- csv-parse
- multer
- dotenv

## Features

### Dashboard
The dashboard gives a quick view of the most important financial metrics. It shows total transactions, review count, revenue, and operating profit, along with monthly P&L breakdowns and category totals.

### Review workflow
The review page lets me look through transactions that need classification attention. I can update the category, add a reason, and move the transaction forward after review.

### Variance analysis
The variance page compares month-to-month performance and surfaces the main drivers behind changes in revenue, COGS, payroll, operating expenses, and operating profit.

### AI Analyst
The AI Analyst feature lets me ask financial questions in plain English and receive answers grounded in the dataset and the P&L context. This is useful for quick analysis without manually digging through the raw numbers.

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL installed and running
- A database named `financial-db` or an updated database config in the backend environment file

### Backend setup

```bash
cd backend
npm install
npm start
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

### Environment variables

Create a `.env` file inside the backend folder with values similar to this:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financial-db
DB_USER=postgres
DB_PASSWORD=0000
GROQ_API_KEY=your_key_here
```

## App URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Main API routes

### Transactions
- `GET /api/transactions`
- `POST /api/transactions/upload`
- `POST /api/transactions/categorize`
- `PUT /api/transactions/categories/:transactionId`
- `GET /api/transactions/reviews`
- `GET /api/transactions/review-summary`

### P&L and variance
- `GET /api/transactions/pnl`
- `GET /api/transactions/pnl/monthly`
- `GET /api/transactions/variances`
- `GET /api/transactions/variances/drivers`

### AI Analyst
- `GET /api/transactions/analyst/context`
- `POST /api/transactions/analyst/ask`

## Requirements check

This project meets the core requirements for a financial review application:

- transaction review flow
- dashboard summary for key financial metrics
- P&L tracking and monthly analysis
- variance identification and driver analysis
- category correction and review handling
- AI-assisted financial analysis
- frontend and backend separation
- data persistence in PostgreSQL
- clean and modern frontend design with Tailwind CSS

## Notes

This is a strong foundation for a real business finance tool. There are still a few improvements I would make for production use, such as authentication, better validation for uploaded CSV files, test coverage, and more robust deployment and monitoring setup.

## License

This project is intended for internal financial review and analysis work.
