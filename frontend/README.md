# FINZ Financial Review

FINZ is a full-stack financial review dashboard for analyzing transactions, tracking month-over-month profitability, identifying review-required records, and asking AI-driven questions about the business numbers.

## Overview

This project combines:

- A Node.js + Express backend for transaction processing and P&L calculations
- A PostgreSQL data layer for storing transaction records
- A React + Vite frontend for financial analysis and review workflows
- AI-assisted analyst capabilities using LLM-backed question answering

## Features

- Dashboard overview for total transactions, revenue, and operating profit
- Monthly profit and loss analysis by category
- Review queue for transactions that need manual classification review
- Variance analysis comparing month-to-month performance changes
- AI Analyst module for business question answering using structured financial context
- CSV upload workflow for importing transaction data
- Category correction workflow with explanation tracking

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express
- PostgreSQL
- pg client library
- CSV parsing with csv-parse
- Multer for file uploads
- dotenv for environment configuration

## Project Structure

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
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ installed
- PostgreSQL running locally or in a remote environment
- A database named `financial-db` or updated environment credentials

## Environment Configuration

Create a backend `.env` file based on the following:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financial-db
DB_USER=postgres
DB_PASSWORD=0000
GROQ_API_KEY=your_key_here
```

## Installation

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Running the App

Once both are started:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health endpoint: http://localhost:5000/api/health

## Available API Routes

### Transactions
- `GET /api/transactions` - fetch all transactions
- `POST /api/transactions/upload` - upload CSV transactions
- `POST /api/transactions/categorize` - categorize pending records
- `PUT /api/transactions/categories/:transactionId` - correct a classified transaction
- `GET /api/transactions/reviews` - fetch review-required transactions
- `GET /api/transactions/review-summary` - get review summary metrics

### P&L and Variance
- `GET /api/transactions/pnl` - get overall P&L totals
- `GET /api/transactions/pnl/monthly` - get month-by-month P&L
- `GET /api/transactions/variances` - get variance metrics
- `GET /api/transactions/variances/drivers` - get variance drivers and key transactions

### AI Analyst
- `GET /api/transactions/analyst/context` - build analyst context
- `POST /api/transactions/analyst/ask` - ask business questions using the dataset

## Notes on the Architecture

The application is designed around a financial operations workflow:

1. Transactions are imported from CSV.
2. They are categorized into P&L and non-P&L buckets.
3. Review items are flagged for human classification approval.
4. Financial metrics are computed and shown on the dashboard.
5. Variance analysis exposes underlying contributors to month-over-month movement.
6. The AI analyst answers natural-language questions using structured evidence.

## Requirements Check

This project meets the main requirements for a small-business financial review tool:

- transaction review workflow
- financial dashboard summaries
- P&L and monthly analysis
- category correction capability
- AI-powered analyst assistance
- frontend + backend separation
- database-backed persistence

## Future Improvements

- Add authentication and authorization
- Add export to CSV/PDF reports
- Add stronger validation for uploaded files
- Add automated tests for backend and frontend
- Add Docker-based deployment support
- Improve AI analyst accuracy with stricter business rules and model validation

## License

This project is intended for internal financial review and analysis use.
