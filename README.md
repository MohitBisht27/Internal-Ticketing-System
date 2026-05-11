# Internal Ticketing System

An efficient and robust Internal Ticketing System designed to streamline issue tracking and resolution within organizations. Built with the MERN stack (MongoDB, Express, React, Node.js), this application enables employees to report issues, agents to manage and resolve tickets, and administrators to oversee the entire process.

## 🚀 Features

- **Role-Based Access Control (RBAC):** Distinct roles for Employees, Agents, and Administrators.
- **Ticket Management:** Create, read, update, and delete tickets.
- **Ticket Lifecycle:** Track status from 'Open' to 'Closed' with intermediate states like 'In Progress' and 'Resolved'.
- **Prioritization & Categorization:** Assign priority levels (Low, Medium, High, Critical) and categories (Software, Hardware, Network, etc.) to tickets.
- **Assignment System:** Assign tickets to specific agents for resolution.
- **Commenting System:** Discuss issues directly within the ticket thread.
- **Real-time Updates:** (If applicable, or usually implies quick state updates via React).
- **Secure Authentication:** JWT-based authentication with secure cookie handling.
- **File Attachments:** Support for uploading attachments using Cloudinary.
- **Dashboard & Analytics:** Visual insights into ticket status and agent performance.

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js**: RESTful API and server logic.
- **MongoDB** & **Mongoose**: Database and object modeling.
- **JWT (JSON Web Tokens)**: Secure user authentication.
- **Cloudinary**: Cloud-based image and file management.
- **Multer**: Middleware for handling `multipart/form-data`.
- **Bcrypt**: Password hashing for security.

### Frontend
- **React.js (Vite)**: Fast and modern frontend framework.
- **Redux Toolkit**: Efficient state management.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **React Router DOM**: Client-side routing.
- **Lucide React**: Beautiful and consistent icons.

## 📂 Project Structure

```
Internal Ticketing System/
├── Backend/                # Server-side application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── db/             # Database connection
│   │   ├── middlewares/    # Custom middlewares (Auth, Uploads)
│   │   ├── models/         # Mongoose schemas (User, Ticket, Comment)
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── ...
└── Frontend/               # Client-side application
    ├── src/
    │   ├── app/            # Redux store configuration
    │   ├── components/     # Reusable UI components
    │   ├── features/       # Redux slices
    │   ├── pages/          # Application pages/views
    │   └── ...
    ├── package.json
    └── ...
```

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB (Local or Atlas connection string)
- Cloudinary Account (for file uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/MohitBisht27/Internal-Ticketing-System.git
cd internal-ticketing-system
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` root and configure the following variables:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd Frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## 🔌 API Endpoints

### Auth
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `POST /api/v1/users/refresh-token` - Refresh access token

### Tickets
- `GET /api/v1/tickets` - Get all tickets
- `POST /api/v1/tickets` - Create a new ticket
- `GET /api/v1/tickets/:id` - Get ticket details
- `PATCH /api/v1/tickets/:id` - Update ticket status/details
- `DELETE /api/v1/tickets/:id` - Delete a ticket

### Comments
- `GET /api/v1/comments/:ticketId` - Get comments for a ticket
- `POST /api/v1/comments/:ticketId` - Add a comment
