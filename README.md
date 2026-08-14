# MoneyMate — Personal Finance & AI Expense Advisor

A full-stack personal finance and expense management platform with AI-powered financial advisory, category budgeting, savings milestone tracking, and interactive analytics.

---

## Live Demo & Links

- **Live Application:** [https://money-mate-omega.vercel.app](https://money-mate-omega.vercel.app)
- **Backend API:** [https://moneymate-dins.onrender.com](https://moneymate-dins.onrender.com)
- **GitHub Repository:** [https://github.com/Sparsh88/MoneyMate](https://github.com/Sparsh88/MoneyMate)

---

## Overview

MoneyMate is a production-oriented personal finance platform designed to give users complete control over their daily finances. It enables users to track income and expense transactions, organize spending into customizable categories, establish monthly budget caps with automated threshold warnings, and monitor savings goal milestones.

The platform integrates Google Gemini AI to analyze user spending habits and deliver actionable financial recommendations, future spending predictions, and an interactive financial Q&A advisor. Built with a TypeScript-first architecture, the application pairs a responsive React frontend with a secure Express and MongoDB backend.

The system features exportable PDF financial reports generated via PDFKit, CSV batch imports, receipt attachments uploaded to Cloudinary, and dedicated administrative analytics.

---

## Problem Statement

- **Manual Tracking Friction:** Tracking finances across spreadsheets or notes is time-consuming, error-prone, and lacks automated consolidation.
- **Lack of Budget Visibility:** Users frequently overspend without real-time tracking against category-specific monthly budget limits.
- **Unstructured Goal Planning:** Saving for long-term targets without structured milestone tracking makes measuring financial progress difficult.
- **Absence of Actionable Insights:** Raw transaction data rarely translates into behavioral changes without intelligent analysis and proactive guidance.

---

## Key Features

- **Transaction Management:** Complete CRUD operations for income and expense transactions with category tagging, payment method selection, date filtering, and receipt image attachments uploaded to Cloudinary.
- **Interactive Analytics:** Financial dashboards powered by Recharts visualizing cash flow trends, monthly income vs. expense comparisons, and category-wise spending distributions.
- **Category Budgeting & Alerts:** Configurable monthly budget limits per category with dynamic progress tracking and visual threshold notifications (80% warning and 100% limit reached).
- **Savings Goals Tracker:** Goal management tracking target amounts, target dates, and accumulated contributions with visual percentage completion indicators.
- **AI Financial Advisor (Google Gemini):** AI-powered spending habit analysis, next-month expense forecasts, budget optimization recommendations, and an interactive advisory chatbot.
- **Data Import & Export:** Export transaction history into formatted PDF statements (generated via PDFKit) and CSV spreadsheets, alongside CSV batch transaction import functionality.
- **Secure Authentication & RBAC:** User authentication using JWT access and refresh token rotation, bcrypt password hashing, email verification via Nodemailer, and role-based access control.
- **Admin Management:** Dedicated administrative interface to monitor system metrics, manage user accounts and statuses, and review and resolve user support tickets.

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 18, TypeScript, Vite | Component-based client SPA with type safety and fast HMR |
| Styling & UI | Tailwind CSS, Framer Motion, Lucide React | Responsive layout styling, animations, and UI icons |
| State & Data Fetching | Zustand, TanStack Query, Axios | Global client state and server-state caching/synchronization |
| Form Validation | React Hook Form, Zod | Form state management and schema validation |
| Data Visualization | Recharts | Interactive financial charts, cash flow, and category breakdowns |
| Backend Runtime | Node.js, Express.js, TypeScript | RESTful API server and application business logic |
| Database | MongoDB Atlas, Mongoose ODM | NoSQL database for users, transactions, budgets, goals, and tickets |
| Authentication | JWT, bcrypt | Stateless token authentication with refresh rotation and password hashing |
| AI / LLM | Google Gemini API (`gemini-1.5-flash`) | AI financial analysis, spending predictions, and advisory chat |
| Cloud Storage | Cloudinary, Multer | Cloud storage for receipt image uploads and multipart form parsing |
| Utilities & Reports | PDFKit, csv-parser, Nodemailer | PDF report generation, CSV data processing, and transactional emails |
| Deployment | Vercel (Frontend), Render (Backend) | Cloud hosting with automated deployment pipelines |

---

## Architecture

```text
Client Browser (React 18 + TypeScript + Zustand)
       │
       │ HTTPS / REST API
       ▼
Express.js API Server (Node.js + TypeScript)
  ├── Auth & Session Middleware (JWT & Refresh Rotation)
  ├── Controllers (Auth, Transactions, Budgets, Goals, AI, Admin)
  └── Services
       ├── Google Gemini API (AI Financial Analysis & Chat)
       ├── Cloudinary Storage (Receipt Image Attachments)
       ├── PDFKit Engine (PDF Statement Generator)
       └── Mongoose ODM (MongoDB Atlas Connection Pooling)
               │
               ▼
       MongoDB Database (Atlas)
```

---

## Application Flow

1. **User Authentication:** User registers or logs in; JWT access/refresh token pair is issued for authenticated session management.
2. **Transaction Recording:** User records an income or expense transaction, tags a category, and optionally attaches a receipt image.
3. **Budget Tracking:** System compares monthly category totals against configured budget thresholds and renders progress indicators.
4. **Analytics Aggregation:** Recharts visualizes historical spending trends, net cash flow, and expense breakdown percentages.
5. **AI Advisory Execution:** User requests an AI financial audit; Google Gemini analyzes transaction patterns and provides recommendations.
6. **Data Export:** User exports monthly statements to formatted PDF documents or CSV files for external record keeping.

---

## Project Structure

```text
MoneyMate/
├── backend/
│   ├── src/
│   │   ├── config/            # Database and Cloudinary configuration
│   │   ├── controllers/       # Auth, transaction, budget, goal, AI, admin controllers
│   │   ├── middleware/        # Auth, role check, and upload middleware
│   │   ├── models/            # Mongoose schemas (User, Transaction, Budget, Goal, Ticket)
│   │   ├── routes/            # REST API route declarations
│   │   ├── services/          # Gemini AI service, PDF generator, email service
│   │   ├── utils/             # Validation schemas and helper utilities
│   │   └── server.ts          # Server initialization
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Charts, TransactionTable, BudgetModal, GoalCard, AIChat
│   │   ├── pages/             # Dashboard, Transactions, Budgets, Goals, Reports, Admin
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx            # Route configuration
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## Installation & Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas connection URI or local instance

### 1. Clone the Repository

```bash
git clone https://github.com/Sparsh88/MoneyMate.git
cd MoneyMate
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLIENT_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

---

## Author

**Sparsh Chauhan**  
*Computer Science & Engineering Student | Full Stack Developer*

- **Portfolio:** [portfolio-flame-rho-29.vercel.app](https://portfolio-flame-rho-29.vercel.app/)
- **GitHub:** [@Sparsh88](https://github.com/Sparsh88)
- **LinkedIn:** [linkedin.com/in/sparshchauhan08](https://linkedin.com/in/sparshchauhan08)
- **Email:** [sparshchauhan050@gmail.com](mailto:sparshchauhan050@gmail.com)
