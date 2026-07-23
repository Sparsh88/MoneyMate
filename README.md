# 💰 MoneyMate – AI Powered Personal Finance Management Platform

<p align="center">

**A modern full-stack finance management application that helps users track expenses, manage budgets, analyze spending habits, and receive AI-powered financial insights.**

Built with **React, TypeScript, Node.js, Express, MongoDB, and Google Gemini AI**.

</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

</p>

---

# 🌐 Live Demo

### 🚀 Frontend

**https://money-mate-omega.vercel.app**

### ⚡ Backend API

**https://moneymate-dins.onrender.com**

---

# 📖 About the Project

MoneyMate is a **production-ready personal finance management platform** designed to simplify financial tracking while providing meaningful AI-powered insights. Users can manage transactions, monitor budgets, visualize financial data, and interact with an AI financial assistant to improve spending habits.

This project demonstrates real-world full-stack development concepts including secure authentication, REST APIs, cloud storage, analytics dashboards, responsive UI, and scalable application architecture.

---

# ✨ Features

## 👤 Authentication

* JWT Authentication
* Refresh Tokens
* Secure Password Hashing
* Email Verification
* Forgot Password
* Reset Password
* Protected Routes
* Role-Based Access Control (Admin/User)

---

## 💳 Transaction Management

* Add Income & Expenses
* Edit Transactions
* Delete Transactions
* Transaction Categories
* Receipt Image Upload
* Cloud Storage Support
* CSV Import
* CSV Export
* PDF Report Export

---

## 📊 Analytics Dashboard

* Income vs Expense Overview
* Monthly Financial Trends
* Cash Flow Analysis
* Category-wise Expense Breakdown
* Interactive Charts
* Financial Summary Cards
* Recent Transactions
* Spending Insights

---

## 🎯 Budget Management

* Monthly Budgets
* Category-wise Budget Limits
* Budget Progress
* 80% Warning Alerts
* 100% Limit Notifications
* Remaining Budget Calculation

---

## 🎯 Savings Goals

* Create Savings Goals
* Progress Tracking
* Goal Completion Percentage
* Milestone Celebrations
* Goal History

---

## 🤖 AI Financial Advisor

Powered by **Google Gemini AI**

Features include:

* Personalized Spending Analysis
* Budget Suggestions
* Saving Recommendations
* Monthly Financial Insights
* Financial Q&A Chat
* Smart Expense Predictions

---

## 👑 Admin Dashboard

* User Management
* Dashboard Statistics
* Platform Analytics
* Support Ticket Management
* User Activity Monitoring

---

## 🌙 User Experience

* Fully Responsive Design
* Dark Mode
* Light Mode
* Beautiful Animations
* Smooth UI Interactions
* Mobile Friendly
* Fast Loading
* Modern Dashboard Design

---

# 🏗️ Project Structure

```text
MoneyMate/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   ├── services/
│   └── utils/
│
├── backend/
│   ├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── config/
│   └── utils/
│
└── README.md
```

---

# 🛠 Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* React Router DOM
* Zustand
* TanStack Query
* Axios
* React Hook Form
* Zod
* Recharts

---

## Backend

* Node.js
* Express.js
* TypeScript
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcrypt
* Multer
* Cloudinary
* Nodemailer
* Google Gemini API
* Helmet
* Express Rate Limit

---

# 🔐 Security Features

* JWT Authentication
* Refresh Token Authentication
* Password Hashing using bcrypt
* Input Validation
* API Rate Limiting
* Helmet Security Middleware
* Protected API Routes
* Secure Environment Variables

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/Sparsh88
```

---

## Backend Setup

```bash
cd backend

npm install

cp .env.example .env

npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

---

# ⚙️ Environment Variables

### Backend

```env
PORT=

MONGODB_URI=

JWT_SECRET=

JWT_REFRESH_SECRET=

CLOUDINARY_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

EMAIL_USER=

EMAIL_PASS=

GEMINI_API_KEY=
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 📡 API Overview

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| POST   | `/api/auth/register`     | Register User       |
| POST   | `/api/auth/login`        | Login User          |
| GET    | `/api/auth/profile`      | User Profile        |
| GET    | `/api/transactions`      | Fetch Transactions  |
| POST   | `/api/transactions`      | Add Transaction     |
| PUT    | `/api/transactions/:id`  | Update Transaction  |
| DELETE | `/api/transactions/:id`  | Delete Transaction  |
| GET    | `/api/analytics/summary` | Dashboard Analytics |
| GET    | `/api/ai/insights`       | AI Insights         |
| POST   | `/api/ai/chat`           | AI Chat             |
| GET    | `/api/admin/stats`       | Admin Statistics    |

---

# 🚀 Deployment

| Service  | Platform      |
| -------- | ------------- |
| Frontend | Vercel        |
| Backend  | Render        |
| Database | MongoDB Atlas |

---

# 🎯 Future Improvements

* Google OAuth Authentication
* Recurring Transactions
* Investment Portfolio Tracking
* Family Budget Sharing
* Multi-Currency Support
* React Native Mobile App
* Bank Account Synchronization
* Financial Goal Recommendations

---

# 📸 Screenshots

> Add screenshots of:
>
> * Login Page
> * Dashboard
> * Analytics
> * Transactions
> * AI Chat
> * Budget Management
> * Savings Goals
> * Admin Dashboard

---

# 👨‍💻 Developer

**Sparsh Chauhan**

Full Stack Developer | Computer Science Student

### Connect with me

* 🌐 Portfolio: *Coming Soon*
* 💼 LinkedIn: https://linkedin.com/in/sparshchauhan08
* 💻 GitHub: https://github.com/Sparsh88

---

# ⭐ Support

If you found this project useful:

* ⭐ Star this repository
* 🍴 Fork it
* 🛠️ Contribute with Pull Requests
* 📢 Share your feedback

---

# 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">

**Built with ❤️ by Sparsh Chauhan**

</p>
