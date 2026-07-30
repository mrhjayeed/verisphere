# Verisphere

**Open-source civic accountability platform** where citizens report injustice, track public officials, browse transparency dashboards, learn their rights, discuss issues, archive evidence, and publish opinions.

Built for [Track B — Spirit of July: transparency & accountability].

---

## Tech Stack

- **Frontend:** React (Vite), React Router, plain CSS, Recharts, Socket.io
- **Backend:** Node.js + Express, Prisma ORM, Socket.io, Multer
- **Database:** PostgreSQL (Supabase-hosted in production)
- **File Storage:** Supabase Storage (local fallback for dev)
- **Auth:** JWT + bcrypt (username/password, no OAuth)

## Demo Credentials

| Role    | Username   | Password     |
|---------|-----------|-------------|
| Admin   | `admin`    | `admin123`   |
| Citizen | `citizen`  | `citizen123` |
| Citizen | `farida_k` | `citizen123` |

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Clone & Install
```bash
git clone <repo-url>
cd verisphere
npm install        # installs root (concurrently)
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Database Setup
```bash
# Create database
psql -U postgres -c "CREATE DATABASE verisphere;"

# Configure server/.env (already created with defaults)
# DATABASE_URL=postgresql://postgres:psql@localhost:5432/verisphere

# Run migrations
cd server && npx prisma migrate dev --name init

# Seed demo data
cd server && node prisma/seed.js
```

### 3. Run Development
```bash
# From repo root — starts both server and client
npm run dev

# Or separately:
cd server && npm run dev   # Backend on :5000
cd client && npm run dev   # Frontend on :5173
```

Frontend: http://localhost:5173
Backend:  http://localhost:5000

---

## Deployment

### Supabase (Database + Storage)
1. Create a Supabase project
2. Copy the **pooled** connection string (port 6543) as `DATABASE_URL`
3. Create a Storage bucket: `verisphere-uploads` (public read)
4. Copy `SUPABASE_URL` and service role key

### Render (Backend — Web Service)
- Root directory: `/server`
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `npm start`
- Env vars:
  - `DATABASE_URL` — Supabase pooled connection string
  - `JWT_SECRET` — any secure random string
  - `SUPABASE_URL` — from Supabase dashboard
  - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard
  - `CORS_ORIGIN` — your Vercel frontend URL
  - `PORT` — auto-set by Render

### Vercel (Frontend — Static)
- Root directory: `/client`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Env vars:
  - `VITE_API_URL` — your Render backend URL
  - `VITE_SOCKET_URL` — same Render backend URL

---

## Features

| Feature | Description |
|---------|-------------|
| **Civic Reporting** | Report corruption, abuse, environmental issues with evidence |
| **Official Profiles** | Track promises, controversies, and complaints |
| **Transparency Dashboard** | Live charts from real DB data |
| **Community Forum** | Threaded discussions with realtime comments |
| **Evidence Archive** | Upload and browse documented evidence |
| **Knowledge Hub** | Articles on civic rights and processes |
| **Public Opinion** | Opinion pieces with community comments |
| **Whistleblowing** | Anonymous or identified submissions |
| **Admin Panel** | Manage officials, articles, review submissions |

All features support markdown content, file uploads, and work end-to-end.

---

## Architecture

```
verisphere/
├── client/          # React (Vite) frontend
│   ├── src/
│   │   ├── api/          # Axios client
│   │   ├── components/   # Shared components
│   │   ├── context/      # Auth context
│   │   ├── hooks/        # Socket.io hook
│   │   └── pages/        # All page components
│   ├── vercel.json       # SPA rewrite
│   └── vite.config.js
├── server/          # Express backend
│   ├── prisma/
│   │   ├── schema.prisma # 16 models
│   │   └── seed.js       # Demo data
│   └── src/
│       ├── middleware/    # Auth + Upload
│       ├── routes/        # 9 route files
│       └── index.js       # Server entry
└── README.md
```

---

## License

MIT
