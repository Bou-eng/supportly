# 🎫 Supportly — Customer Support & Ticket Management System

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5-000000?style=for-the-badge\&logo=express\&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge)](https://mongoosejs.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge\&logo=cloudinary\&logoColor=white)](https://cloudinary.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)

A full-stack **customer support and ticket management platform** built with **React, Node.js, Express, and MongoDB**.

Supportly provides a centralized environment for managing customer support requests, assigning tickets to support agents, communicating through ticket messages, tracking activity, managing knowledge-base articles, and monitoring support operations through role-based dashboards.

The project was designed as a **production-style full-stack application** with a separated frontend/backend architecture, authentication, authorization, file uploads, API protection, and cloud deployment.

---

## 📌 Overview

Supportly is designed around the workflow of a modern customer support organization.

Customers can create and track support tickets, while support agents and managers can process, assign, prioritize, and resolve those tickets.

The system provides different capabilities depending on the user's role.

### Main workflow

```text
Customer
   │
   │ Creates support ticket
   ▼
Ticket
   │
   ├── Category
   ├── Priority
   ├── Status
   └── Messages / Attachments
   │
   ▼
Support Agent
   │
   ├── Processes ticket
   ├── Responds to customer
   ├── Updates status
   └── Adds activity
   │
   ▼
Manager / Admin
   │
   ├── Assigns tickets
   ├── Manages users and teams
   ├── Manages categories
   └── Monitors support operations
```

---

## ✨ Core Features

### 🎫 Ticket Management

* Create customer support tickets
* View ticket lists
* View individual ticket details
* Update ticket status
* Update ticket priority
* Assign tickets to support staff
* Track ticket activity
* Filter and organize support work

### 💬 Ticket Conversations

* Message-based communication inside tickets
* Customer ↔ support communication
* File attachments
* Cloud-based attachment storage
* Attachment download access control

### 👥 Role-Based Access Control

Supportly separates functionality according to user roles.

| **Role**     | **Capabilities**                                                                 |
| ------------ | -------------------------------------------------------------------------------- |
| **Customer** | Create tickets, view own tickets, communicate with support                       |
| **Agent**    | Manage assigned support tickets, respond to customers, update ticket information |
| **Manager**  | Manage support operations, assignments, teams, and users                         |
| **Admin**    | Full system administration and configuration                                     |

Access to protected operations is enforced on the backend rather than relying only on frontend route protection.

---

## 🏷️ Ticket Status & Priority

Tickets can be managed throughout their support lifecycle.

Typical workflow:

```text
OPEN
  │
  ▼
IN PROGRESS
  │
  ▼
WAITING / PENDING
  │
  ▼
RESOLVED
  │
  ▼
CLOSED
```

Tickets also support priority management so support teams can identify and handle important requests appropriately.

---

## 👨‍💼 Team & User Management

Managers and administrators can manage the support organization through dedicated APIs and interfaces.

Features include:

* User management
* Role management
* Team management
* Agent assignment
* Support organization configuration
* Category management

---

## 🔔 Notifications

Supportly includes a notification system for keeping users informed about important support events.

Notifications can be used to communicate events such as:

* Ticket assignments
* Ticket updates
* New messages
* Status changes
* Other relevant support activity

---

## 📚 Knowledge Base

Supportly includes a knowledge-base/article system designed to reduce repetitive support requests.

Support teams can maintain support articles that can be used to provide users with helpful information before or during the support process.

This creates the foundation for a self-service support workflow alongside traditional ticket-based support.

---

## 📊 Reports & Dashboard

The application includes reporting functionality for monitoring support operations.

The dashboard architecture is designed around role-specific information such as:

* Ticket workload
* Ticket status
* Ticket priority
* Support activity
* Team performance
* Operational statistics

Different roles receive different views based on their responsibilities.

---

## 🏗️ System Architecture

Supportly follows a separated full-stack architecture:

```text
                    ┌──────────────────────┐
                    │      React / Vite     │
                    │       Frontend        │
                    └──────────┬───────────┘
                               │
                         Axios / REST
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Express / Node.js  │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐    ┌────────────┐   ┌────────────┐
        │ MongoDB  │    │ Cloudinary │   │ JWT / HTTP │
        │  Atlas   │    │   Media    │   │   Cookies  │
        └──────────┘    └────────────┘   └────────────┘
```

### Frontend

The frontend is responsible for:

* User interface
* Client-side routing
* Authentication state
* API communication
* Role-based navigation
* Ticket management interfaces
* Dashboards
* Notifications
* Knowledge base
* Settings

### Backend

The backend provides:

* REST API
* Authentication
* Authorization
* Business logic
* Ticket management
* User/team management
* Notifications
* Knowledge-base management
* Reports
* File upload handling
* Security middleware

---

## 🧰 Tech Stack

| **Layer**            | **Technology**                     |
| -------------------- | ---------------------------------- |
| Frontend             | React 19                           |
| Build Tool           | Vite                               |
| Routing              | React Router                       |
| Styling              | Tailwind CSS                       |
| UI Icons             | Lucide React                       |
| Internationalization | i18next                            |
| HTTP Client          | Axios                              |
| Backend              | Node.js                            |
| API Framework        | Express.js                         |
| Database             | MongoDB Atlas                      |
| ODM                  | Mongoose                           |
| Authentication       | JWT + HTTP-only Cookies            |
| Password Security    | bcrypt                             |
| File Uploads         | Multer                             |
| Media Storage        | Cloudinary                         |
| Security Headers     | Helmet                             |
| Rate Limiting        | express-rate-limit                 |
| Logging              | Pino HTTP                          |
| Testing              | Vitest, Testing Library, Supertest |
| Deployment           | Vercel + Render                    |

---

## 🔐 Authentication & Security

Security is handled primarily by the backend.

### Authentication

* JWT-based authentication
* HTTP-only authentication cookies
* Protected API routes
* Login / registration / logout
* Authenticated user retrieval

### Authorization

Backend middleware verifies whether a user has permission to access protected resources.

Role-specific operations are protected using authorization middleware rather than trusting frontend-only restrictions.

### API Security

The backend also includes:

* CORS configuration
* Helmet security headers
* API rate limiting
* Authentication rate limiting
* Password hashing with bcrypt
* Input handling and validation
* Protected file-access routes
* HTTP-only cookies
* Structured HTTP logging

---

## 📁 Project Structure

```text
supportly/
│
├── backend/
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimiter.js
│   │
│   ├── models/
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── knowledgeRoutes.js
│   │   ├── userRoutes.js
│   │   ├── reportRoutes.js
│   │   └── settingsRoutes.js
│   │
│   ├── scripts/
│   │
│   ├── test/
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔌 API Structure

The backend exposes RESTful API groups for the main application domains.

| **Group**      | **Endpoint Prefix**    |
| -------------- | ---------------------- |
| Authentication | `/api/auth/*`          |
| Tickets        | `/api/tickets/*`       |
| Teams          | `/api/teams/*`         |
| Categories     | `/api/categories/*`    |
| Notifications  | `/api/notifications/*` |
| Knowledge Base | `/api/articles/*`      |
| Users          | `/api/users/*`         |
| Reports        | `/api/reports/*`       |
| Settings       | `/api/settings/*`      |

### Authentication examples

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Ticket examples

```text
GET   /api/tickets
POST  /api/tickets
GET   /api/tickets/:id
PATCH /api/tickets/:id
PATCH /api/tickets/:id/status
PATCH /api/tickets/:id/priority
PATCH /api/tickets/:id/assign
```

Ticket conversations also support:

```text
GET  /api/tickets/:id/messages
POST /api/tickets/:id/messages
```

---

## 🗄️ Data & Storage

Supportly uses **MongoDB with Mongoose** for application data.

The database stores information related to areas such as:

* Users
* Tickets
* Ticket messages
* Teams
* Categories
* Notifications
* Knowledge-base articles
* Reports
* Application settings
* Ticket activity

File attachments are handled separately through **Cloudinary**, keeping binary media storage outside the main MongoDB database.

---

## 🌐 Deployment

Supportly is deployed using a separated frontend/backend architecture.

```text
                 Internet
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
      Vercel               Render
      Frontend             Backend
          │                   │
          │ REST API          │
          └─────────►─────────┘
                              │
                   ┌──────────┴──────────┐
                   ▼                     ▼
              MongoDB Atlas          Cloudinary
```

### Production services

**Frontend**

```text
https://supportly-kappa.vercel.app
```

**Backend**

```text
https://supportly-vhx2.onrender.com
```

The frontend communicates with the production backend through:

```text
https://supportly-vhx2.onrender.com/api
```

> If the production URLs change in the future, update the links above.

---

## ⚙️ Environment Variables

### Backend

Create a `.env` file inside the `backend` directory.

```env
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

AUTH_RATE_LIMIT_MAX=10
API_RATE_LIMIT_MAX=200
```

### Frontend

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5001/api
```

For the deployed frontend, configure:

```env
VITE_API_URL=https://supportly-vhx2.onrender.com/api
```

> **Never commit `.env` files, API keys, database credentials, JWT secrets, or Cloudinary secrets to GitHub.**

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git
* MongoDB Atlas account or a local MongoDB instance
* Cloudinary account if using attachment uploads

---

## 📥 Installation

Clone the repository:

```bash
git clone https://github.com/Bou-eng/supportly.git

cd supportly
```

### Backend

```bash
cd backend
npm install
```

Configure your `.env` file.

Start the development server:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5001
```

Health check:

```text
http://localhost:5001/
```

---

### Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Configure:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🧪 Testing

The project includes testing infrastructure for both frontend and backend components.

### Frontend

```bash
cd frontend
npm test
```

For a single test run:

```bash
npm run test
```

### Backend

```bash
cd backend
npm test
```

Backend tests use:

* Node.js test runner
* Supertest
* MongoDB Memory Server

---

## 🔄 Typical Support Workflow

```text
1. Customer registers / logs in
             │
             ▼
2. Customer creates a ticket
             │
             ▼
3. Ticket enters support queue
             │
             ▼
4. Manager / Agent assigns ticket
             │
             ▼
5. Agent communicates with customer
             │
             ├── Messages
             ├── Attachments
             └── Activity tracking
             │
             ▼
6. Agent updates status / priority
             │
             ▼
7. Ticket is resolved
             │
             ▼
8. Support data becomes available
   for operational reporting
```

---

## 🎯 Project Goals

Supportly was built to demonstrate how a real-world support platform can be designed using a modern full-stack architecture.

The project focuses on:

* Full-stack application development
* REST API design
* Authentication and authorization
* Role-based access control
* Database modeling
* Secure API design
* File upload handling
* Cloud services
* Frontend/backend integration
* Error handling
* Rate limiting
* Production deployment
* Automated testing

---

## 🎓 Educational Value

This project demonstrates practical experience with:

* React application architecture
* Node.js backend development
* Express REST APIs
* MongoDB and Mongoose
* JWT authentication
* HTTP-only cookies
* Role-based authorization
* RESTful resource design
* Middleware architecture
* Cloudinary integration
* API security
* Frontend state management
* Testing
* Environment configuration
* Vercel deployment
* Render deployment

Rather than being a simple CRUD application, Supportly combines these concepts into a multi-role system with interconnected workflows.

---

## 🛡️ Security Notes

This repository is intended for educational and portfolio purposes.

Before deploying your own instance:

1. Generate a strong and unique `JWT_SECRET`.
2. Configure your own MongoDB credentials.
3. Configure your own Cloudinary credentials.
4. Configure the correct frontend origin in `FRONTEND_URL`.
5. Configure `VITE_API_URL` for the target backend.
6. Never commit `.env` files or credentials.
7. Use production HTTPS when deploying.
8. Review and configure rate limits according to your deployment requirements.

---

## 📌 Project Status

**Status: Active Development / Portfolio Project**

The core Supportly architecture is implemented and deployed, with the project structured to allow additional features and improvements to be added over time.

Possible future improvements include:

* Advanced analytics
* More detailed SLA management
* Email notifications
* Customer satisfaction ratings
* Advanced search
* Automated ticket categorization
* More extensive automated testing
* Real-time ticket updates
* Improved observability and monitoring

---

## 📄 License

This project is licensed under the **MIT License**.

See the [`LICENSE`](./LICENSE) file for details.

---

## 👨‍💻 Author

**Bou-eng**

GitHub:

https://github.com/Bou-eng

---

## ⭐ Support

If you find the project useful or interesting, consider giving the repository a ⭐ on GitHub.
