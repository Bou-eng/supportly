# Supportly Deployment

## Requirements

- Node.js 20 or newer
- MongoDB Atlas or a reachable MongoDB deployment
- A Cloudinary account for attachment uploads
- A frontend host and a backend host

## Backend environment

Create `backend/.env` from `backend/.env.example` and set real values. Do not commit this file.

```env
PORT=5001
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/supportly?retryWrites=true&w=majority
JWT_SECRET=use-a-random-secret-at-least-32-characters-long
FRONTEND_URL=https://app.example.com
AUTH_RATE_LIMIT_MAX=10
API_RATE_LIMIT_MAX=200
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=production
```

URL-encode MongoDB credentials when they contain characters such as `@`, `#`, `/`, or `:`. Allow the backend server's public IP in MongoDB Atlas Network Access.

## Install and seed

```bash
cd backend
npm ci
npm run seed:categories
npm test
```

The category seed is idempotent and can safely be run during deployment.

## Start the backend

```bash
cd backend
npm start
```

The backend connects to MongoDB before listening. A failed database connection must be fixed before traffic is sent to the API.

## Frontend environment and build

Set `VITE_API_URL` at build time to the public API URL, including `/api`:

```env
VITE_API_URL=https://api.example.com/api
```

Then build and serve the static output:

```bash
cd frontend
npm ci
npm test
npm run build
npm run preview
```

Use a static host such as Vercel, Netlify, or an Nginx bucket. Configure SPA fallback so `/login`, `/tickets`, and other client routes serve `index.html`.

## Cookies and CORS

The API uses an HTTP-only authentication cookie. Production frontend and backend must use HTTPS. Configure the exact frontend origin in `FRONTEND_URL`; do not use `*` with credentials.

## Cloudinary attachments

Uploads are limited to five files per message and 10 MB per file. Allowed types are JPEG, PNG, GIF, PDF, TXT, and CSV. Downloads use protected, short-lived signed URLs.

## Health and smoke checks

After deployment:

1. Register or log in through the frontend.
2. Confirm `/api/auth/me` succeeds after refresh.
3. Create a ticket with a seeded category.
4. Send a reply with an allowed attachment.
5. Confirm the attachment appears and the signed download opens.
6. Verify customer/staff message visibility and role restrictions.
7. Open reports and settings to confirm API data loads.

## Operational notes

- Rotate credentials that have ever been exposed in repository files or chat logs.
- Use a process manager such as systemd, Docker, PM2, or the platform's managed process runner.
- Configure centralized logs and alerts for database connection failures, 401/403 spikes, 429 responses, and 5xx errors.
- Back up MongoDB and configure Cloudinary retention policies appropriate for your organization.
