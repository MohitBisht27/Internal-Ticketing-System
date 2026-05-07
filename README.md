# Internal Ticketing System

A full-stack MERN internal support platform where employees can raise tickets, agents can resolve them, and admins can monitor workload and performance.

## Table of Contents
- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Data Model](#data-model)
- [Authentication and Authorization](#authentication-and-authorization)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Available Scripts](#available-scripts)
- [Deployment Notes](#deployment-notes)
- [Validation and Known Baseline Issues](#validation-and-known-baseline-issues)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Overview
The Internal Ticketing System helps organizations manage issue reporting and resolution workflows with:
- role-based access control (`employee`, `agent`, `admin`)
- SLA-driven deadlines and overdue tracking
- attachment uploads (Cloudinary)
- threaded comments with internal notes
- ticket statistics and agent performance analytics

## Core Capabilities

### Employee
- Register and log in
- Create tickets with category, priority, tags, and attachments
- View only own tickets
- View and participate in ticket comments

### Agent
- View assigned and open unassigned tickets
- Update ticket status through allowed transitions
- Add/update comments and internal notes

### Admin
- Assign tickets to agents (with active workload limit)
- View all tickets with filters and pagination
- View agent performance dashboard
- Trigger overdue ticket recalculation
- Access list of active agents with workload context

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer + Cloudinary for file uploads
- Cookie parser + CORS

### Frontend
- React (Vite)
- Redux Toolkit + RTK Query
- React Router
- Tailwind CSS
- Lucide icons

## Architecture
- **Frontend** is a React SPA.
- **Backend** exposes REST APIs under `/api/v1`.
- Frontend uses RTK Query to call backend APIs.
- Access token is sent in `Authorization: Bearer <token>`.
- Refresh token is stored in secure HTTP-only cookie.

## Repository Structure

```text
Internal-Ticketing-System/
├── Backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── constants.js
│   │   ├── controller/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── model/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   └── pages/
│   └── package.json
├── netlify.toml
└── README.md
```

## Data Model

### User
Key fields:
- `fullName`, `username`, `email`, `password`
- `department` (`Engineering`, `HR`, `Finance`, `Customer Success`, `Operations`, `IT`)
- `role` (`employee`, `agent`, `admin`)
- `avatar`, `refreshToken`, `isActive`

### Ticket
Key fields:
- `ticketId` (generated format: `TIC-XXXXXX`)
- `title`, `description`, `category`, `priority`, `tags`
- `status` (`open`, `in-progress`, `on-hold`, `resolved`, `closed`)
- `createdBy`, `assignedTo`, `deadline`, `isOverdue`, `attachments`

### Comment
Key fields:
- `ticket`, `author`, `content`
- `parentComment` (threading)
- `attachments`
- `isInternalNote`
- `type` (`message`, `activity`)

## Authentication and Authorization
- Login returns `accessToken` + `refreshToken`.
- Protected routes require bearer token.
- Backend `verifyJWT` middleware validates and hydrates `req.user`.
- `checkRole([...])` middleware gates admin/agent operations.

## API Reference
Base URL: `/api/v1`

### User APIs
- `POST /users/register` (multipart, includes `avatar`)
- `POST /users/login`
- `POST /users/refresh-token`
- `POST /users/logout` (auth required)
- `GET /users/current-user` (auth required)
- `PATCH /users/avatar` (auth required, multipart)
- `GET /users/agents` (admin only)

### Ticket APIs
- `POST /tickets` (employee only, multipart `attachments[]`)
- `GET /tickets`
  - supports `page`, `limit`, `search`, `status`, `priority`, `category`, `isOverdue`, `sortBy`, `sortOrder`
- `GET /tickets/:ticketId`
- `PATCH /tickets/:ticketId` (agent/admin; status transition rules enforced)
- `PATCH /tickets/:ticketId/assign` (admin only)
- `GET /tickets/stats`
- `GET /tickets/performance` (admin only)
- `GET /tickets/admin/all` (admin only)
- `PATCH /tickets/update-overdue` (admin only)

### Comment APIs
- `POST /comments/:ticketId/comments` (auth, multipart optional attachments)
- `GET /comments/:ticketId/comments` (auth, pagination via `page` and `limit`)
- `PATCH /comments/:commentId` (owner/admin)
- `DELETE /comments/:commentId` (owner/admin)

## Environment Variables
Create `Backend/.env` with:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017
# Production example:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> Note: The backend appends the DB name (`InternalTicketing`) internally, so keep `MONGODB_URI` as the server/cluster URI (without adding `/InternalTicketing` yourself).
>
> The value above is a local-development example. For production, use an authenticated connection string (for example, an authenticated MongoDB Atlas URI).
> Do **not** use unauthenticated MongoDB connections in production.

## Local Development Setup

### 1) Clone
```bash
git clone https://github.com/MohitBisht27/Internal-Ticketing-System.git
cd Internal-Ticketing-System
```

### 2) Backend
```bash
cd Backend
npm install
npm run dev
```

Backend runs on `http://localhost:8000`.

### 3) Frontend
Open a new terminal:
```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Available Scripts

### Backend (`Backend/package.json`)
- `npm run dev` - start backend with nodemon
- `npm run start` - start backend with node

### Frontend (`Frontend/package.json`)
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run lint` - run ESLint
- `npm run preview` - preview production build

## Deployment Notes
- Frontend is configured for Netlify (`netlify.toml`).
- The frontend is currently configured with this API base URL:
  - `https://internalticketingsystem.onrender.com/api/v1`
- This is the endpoint used by this repository at the moment. For your own deployment, **replace this URL** in `Frontend/src/features/authSlice/authApiSlice.js` with your backend API URL.
- Also search for additional URL references if you later introduce environment files or dedicated API utility modules.

## Validation and Known Baseline Issues
Validation run in this repository:
- Frontend build: ✅ passes (`npm run build`)
- Frontend lint: ❌ fails due to existing unused variable issues
- Backend start: ❌ fails without valid MongoDB env configuration (expected until `Backend/.env` is configured as shown above)

These are baseline project-state issues and not introduced by documentation changes.

## Troubleshooting
- **Mongo parse error on backend start**: ensure `MONGODB_URI` is set to a valid URI (`mongodb://...` or `mongodb+srv://...`).
- **CORS/auth problems**: confirm `CORS_ORIGIN` matches frontend origin and cookies are allowed.
- **Cloudinary uploads failing**: verify all Cloudinary env values.

## Future Improvements
- Move frontend API base URL to environment variables.
- Add backend lint/test scripts.
- Add API OpenAPI/Swagger spec.
- Add CI workflows for lint/build/test automation.
