# MoneyMate

A full-stack personal finance and expense management platform with AI-powered financial advisory, category budgeting, and interactive analytics.

## Live Demo & Links

- **Live Application:** [https://money-mate-omega.vercel.app](https://money-mate-omega.vercel.app)
- **Backend API:** [https://moneymate-dins.onrender.com](https://moneymate-dins.onrender.com)
- **GitHub Repository:** [https://github.com/Sparsh88/MoneyMate](https://github.com/Sparsh88/MoneyMate)

---

## Overview

MoneyMate is a production-oriented personal finance platform designed to give users complete control over their daily finances. It enables users to track income and expense transactions, organize spending into customizable categories, establish monthly budget caps with automated threshold warnings, and monitor savings goal milestones.

The platform integrates Google Gemini AI to analyze user spending habits and deliver actionable financial recommendations, future spending predictions, and an interactive financial Q&A advisor. Built with a TypeScript-first architecture, the application pairs a responsive React frontend with a secure Express and MongoDB backend.

---

## Problem Statement

- **Manual Tracking Friction:** Tracking finances across spreadsheets or notes is time-consuming, prone to data entry errors, and lacks automated consolidation.
- **Lack of Budget Visibility:** Users frequently overspend without real-time tracking against category-specific monthly budget limits.
- **Unstructured Goal Planning:** Saving for long-term targets without structured milestone tracking makes measuring financial progress difficult.
- **Absence of Actionable Insights:** Raw transaction data rarely translates into behavioral changes without intelligent analysis and proactive guidance.

---

## Key Features

- **Authentication & RBAC:** Secure user authentication using JWT access and refresh token rotation, bcrypt password hashing, email verification via Nodemailer, password reset flows, and role-based access control (User and Admin roles).
- **Transaction Management:** Complete CRUD operations for income and expense transactions with category tagging, payment method selection, date filtering, and receipt image attachments uploaded to Cloudinary.
- **Data Import & Export:** Export transaction history into CSV spreadsheets and formatted PDF statements (generated via PDFKit), alongside CSV batch transaction import functionality.
- **Interactive Analytics:** Financial dashboards powered by Recharts visualizing cash flow trends, monthly income vs. expense comparisons, and category-wise spending distributions.
- **Category Budgeting & Alerts:** Configurable monthly budget limits per category with dynamic progress tracking and visual threshold notifications (80% warning and 100% limit reached).
- **Savings Goals Tracker:** Goal management tracking target amounts, target dates, and accumulated contributions with visual percentage completion indicators.
- **AI Financial Advisor:** Integration with Google Gemini 1.5 Flash (`@google/generative-ai`) providing tailored spending insights, next-month expense forecasts, budget optimization recommendations, and an interactive financial advisory chat assistant with built-in heuristic fallbacks.
- **Admin Management:** Dedicated administrative interface to monitor system metrics, manage user accounts and statuses, and review and resolve user support tickets.
- **Theme & Responsiveness:** Fully responsive interface built with Tailwind CSS and Framer Motion, supporting system dark/light mode toggling via Zustand state persistence.

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | Component-based client SPA with type safety and fast HMR |
| **Styling & UI** | Tailwind CSS, Framer Motion, Lucide React | Responsive layout styling, animations, and UI icons |
| **State & Data Fetching** | Zustand, TanStack Query, Axios | Global client state and server-state caching/synchronization |
| **Forms & Validation** | React Hook Form, Zod | Form state management and schema validation |
| **Data Visualization** | Recharts | Interactive financial charts, cash flow, and category breakdowns |
| **Backend** | Node.js, Express.js, TypeScript | RESTful API server and application business logic |
| **Database** | MongoDB Atlas, Mongoose | NoSQL database for users, transactions, budgets, goals, and tickets |
| **Authentication** | JWT, bcrypt | Stateless token authentication with refresh rotation and password hashing |
| **AI / LLM** | Google Gemini API (`gemini-1.5-flash`) | AI financial analysis, spending predictions, and advisory chat |
| **Cloud Storage** | Cloudinary, Multer | Cloud storage for receipt image uploads and multipart form parsing |
| **Utilities & Reports** | PDFKit, csv-parser, Nodemailer | PDF report generation, CSV data processing, and transactional emails |
| **Security** | Helmet, Express Rate Limit, Mongo Sanitize | HTTP header security, rate limiting, and NoSQL injection mitigation |
| **Deployment** | Vercel, Render | Frontend hosting on Vercel and backend web service on Render |

---

## Architecture

```text
[ User Browser / Client ]
           │
           ▼
[ React 18 + TypeScript + Vite SPA (Vercel) ]
           │  (REST API / JSON / Credentials)
           ▼
[ Express.js + Node.js Backend API (Render) ]
   ├── Middleware: Helmet, Rate Limiter, Mongo-Sanitize, JWT Auth Guard
   ├── Route Controllers (Auth, Transactions, Budgets, Goals, Analytics, AI, Admin)
   └── External Services & Integrations:
          ├── MongoDB Atlas (Mongoose ODM)
          ├── Google Gemini 1.5 Flash (AI Financial Advisory)
          ├── Cloudinary API (Receipt Image Storage)
          └── Nodemailer SMTP (Account Verification & Password Resets)
```

---

## Application Flow

1. **Authentication:** User registers an account, receives an email verification token, and logs in to obtain a short-lived access JWT and refresh token.
2. **Recording Transactions:** User logs income or expense records with category, amount, payment method, and optional receipt images stored in Cloudinary.
3. **Data Aggregation:** The backend computes monthly financial summaries, category totals, and net savings from stored transaction records.
4. **Budget Monitoring:** Spending in each category is checked against active monthly budget limits, triggering threshold alerts when approaching or exceeding limits.
5. **Goal Tracking:** Users allocate funds toward designated savings goals, dynamically updating progress bars and target timelines.
6. **AI Analysis:** The user requests insights or chats with the AI Advisor; the backend compiles financial context and queries Gemini 1.5 Flash for personalized suggestions.
7. **Reporting & Exports:** Users download structured PDF financial statements or CSV exports for offline accounting.
8. **Admin Operations:** Platform administrators review registered user metrics, toggle account statuses, and process support tickets.

---

## Project Structure

```text
MoneyMate/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary, and Mailer configuration
│   │   ├── controllers/     # Handlers for Auth, Transactions, Budgets, Goals, AI, Admin
│   │   ├── middleware/      # Auth verification, Admin guard, Rate limit, Multer upload
│   │   ├── models/          # Mongoose schemas (User, Transaction, Budget, Goal, Ticket)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Gemini AI, Mailer, and PDFKit generation services
│   │   ├── utils/           # Token generators, custom error classes, and helpers
│   │   ├── app.ts           # Express application setup and global middleware
│   │   └── index.ts         # Server bootstrap and MongoDB connection
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI elements, Layouts, and Transaction modals
│   │   ├── pages/           # Dashboard, Transactions, Analytics, Budgets, Goals, AI, Admin
│   │   ├── services/        # Axios API client modules
│   │   ├── store/           # Zustand stores for Auth and Theme state
│   │   ├── types/           # Shared TypeScript interfaces
│   │   ├── App.tsx          # Client routing configuration and theme listener
│   │   └── main.tsx         # Application root with TanStack Query provider
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── render.yaml              # Render cloud deployment descriptor
└── README.md
```

---

## API Reference

### Authentication & User
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate user credentials and issue tokens
- `POST /api/auth/verify-email` - Verify email address with token
- `POST /api/auth/forgot-password` - Request password reset link
- `POST /api/auth/reset-password` - Reset password with verification token
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `POST /api/auth/logout` - Invalidate user session
- `GET /api/auth/me` - Fetch authenticated user profile

### Transactions
- `GET /api/transactions` - Fetch user transactions with optional filters
- `POST /api/transactions` - Create a new income or expense transaction
- `PUT /api/transactions/:id` - Update existing transaction details
- `DELETE /api/transactions/:id` - Remove a transaction record
- `POST /api/transactions/upload-receipt` - Upload receipt image to Cloudinary
- `GET /api/transactions/export/csv` - Export transactions as CSV file
- `GET /api/transactions/export/pdf` - Export transactions as PDF report
- `POST /api/transactions/import` - Batch import transactions from CSV

### Analytics & Budgets
- `GET /api/analytics/summary` - Get total income, expense, and net balance summary
- `GET /api/analytics/category` - Get category-wise spending breakdown
- `GET /api/analytics/trends` - Get monthly spending and income trend data
- `GET /api/analytics/cashflow` - Get cash flow analysis
- `GET /api/budgets` - Fetch all category budgets and spending progress
- `POST /api/budgets` - Create or update a monthly category budget limit
- `DELETE /api/budgets/:id` - Delete a category budget

### Savings Goals & AI Advisor
- `GET /api/goals` - Fetch user savings goals and completion percentages
- `POST /api/goals` - Create a new savings goal
- `PUT /api/goals/:id` - Update goal details or add savings contribution
- `DELETE /api/goals/:id` - Delete a savings goal
- `GET /api/ai/insights` - Generate personalized financial insights
- `GET /api/ai/predictions` - Generate next-month spending predictions
- `GET /api/ai/budget-suggestions` - Generate recommended category budget caps
- `GET /api/ai/goal-recommendations` - Generate recommended savings targets
- `POST /api/ai/chat` - Interactive financial advisory conversation

### Admin & Support
- `GET /api/admin/stats` - Fetch platform user and transaction metrics (Admin only)
- `GET /api/admin/users` - List all registered platform accounts (Admin only)
- `PUT /api/admin/users/:id/status` - Update user active/suspended status (Admin only)
- `POST /api/admin/tickets` - Submit a user support ticket
- `GET /api/admin/tickets` - List all support tickets (Admin only)
- `PUT /api/admin/tickets/:id/resolve` - Mark support ticket as resolved (Admin only)

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas instance or local MongoDB server
- Cloudinary account credentials (for receipt image storage)
- Google Gemini API key (for AI advisor features)

### 1. Clone the Repository
```bash
git clone https://github.com/Sparsh88/MoneyMate.git
cd MoneyMate
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in the required `.env` variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/moneymate
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@moneymate.com
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```
Configure `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

The application will be accessible locally at `http://localhost:5173`.
