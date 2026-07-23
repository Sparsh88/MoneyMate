# FinTrack Pro 🚀

> **Production-ready Full Stack Personal Finance Management Platform**  
> AI-Powered · Secure · Beautiful · Scalable

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Overview

FinTrack Pro is a modern, production-ready personal finance management platform featuring:

- 📊 **Rich Analytics** – Income vs expense charts, cash flow, category breakdowns
- 🤖 **Gemini AI Advisor** – Smart spending insights, predictions, and budget suggestions
- 💰 **Transaction Management** – Full CRUD with receipt uploads, CSV import/export, PDF export
- 🎯 **Savings Goals** – Visual progress tracking with milestone celebrations
- 📋 **Budget Alerts** – Real-time notifications at 80% and 100% of limits
- 🔐 **Secure Auth** – JWT + Refresh Tokens, email verification, password reset
- 🌙 **Dark / Light Mode** – Fully supported throughout
- 👑 **Admin Panel** – User management, platform analytics, support tickets

---

## 🏗️ Architecture

```
FinTrack-Pro/
├── frontend/    →  React 19 + TypeScript + Vite + Tailwind + Framer Motion
├── backend/     →  Node.js + Express + TypeScript + MongoDB + JWT
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | Core UI framework |
| Vite | Build tooling |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| React Router v6 | Client routing |
| Zustand | State management |
| TanStack Query | Server state & caching |
| Axios | HTTP client |
| React Hook Form + Zod | Form validation |
| Recharts | Charts & analytics |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express + TypeScript | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcrypt | Auth & security |
| Multer + Cloudinary | File uploads |
| Nodemailer | Email delivery |
| Google Gemini AI | AI advisory features |
| Helmet + Rate Limiting | Security hardening |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account
- (Optional) Gemini API Key for AI features

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000/api
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 🌐 API Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login + get tokens |
| `GET /api/analytics/summary` | Dashboard data |
| `GET /api/transactions` | List transactions |
| `POST /api/transactions` | Add transaction |
| `GET /api/ai/insights` | AI financial insights |
| `POST /api/ai/chat` | Chat with AI advisor |
| `GET /api/admin/stats` | Platform statistics (Admin) |

Full API documentation available in `backend/README.md`.

---

## 📦 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

See individual `README.md` files in each folder for deployment guides.

---

## 🔮 Future Improvements

- [ ] Google OAuth integration (frontend)
- [ ] Recurring transaction management UI
- [ ] Mobile app (React Native)
- [ ] Investment portfolio tracking
- [ ] Bank account sync via Plaid API
- [ ] Multi-currency support
- [ ] Budget sharing / family accounts

---

## 📄 License

MIT License — Free to use for personal projects, portfolios, and internship applications.
