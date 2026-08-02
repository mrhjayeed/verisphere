# Verisphere

Verisphere is an open-source, privacy-first civic accountability platform designed to protect whistleblowers, audit public institutions, archive evidence, and enable transparent public participation.

---

## Motivation

In many societies, civic participation and public accountability face significant structural barriers:

- **Whistleblower Risks:** Individuals disclosing public-interest information face surveillance, identity tracking, and severe personal retaliation.
- **Ephemerality of Social Media:** Evidence of corruption, service failures, or human rights violations shared on mainstream social networks is frequently removed, algorithmically suppressed, or lost across fragmented feeds.
- **The Accountability Gap:** Public officials and institutions make commitments during crises, but citizens lack structured, persistent systems to audit whether those promises are kept or broken over time.
- **Information Asymmetry:** Citizens lack accessible knowledge regarding their constitutional rights, legal procedures, and mechanisms for public grievance redressal.

Verisphere was created to bridge this gap. By building open-source digital public infrastructure, Verisphere enables evidence-based civic reporting, cryptographically safer whistleblowing, and transparent public official tracking.

---

## Core Guiding Principles

- **Privacy by Design:** Zero-PII metadata stripping for anonymous disclosures.
- **Evidence-Based Accountability:** Every report and official pledge is backed by verifiable documentation.
- **Open Knowledge:** Educational legal guides and open data principles to empower public literacy.
- **Censorship Resistance:** Permanent, cloud-preserved archives for civic records and documents.
- **Community Governance:** Open-source development built for public oversight and independent auditing.

---

## Platform Features

### 1. Anonymous Whistleblowing Pipeline
- **Zero-PII Metadata Stripping:** Disclosures submitted anonymously strip user identifiers, IP addresses, and session tokens before database persistence.
- **Secret Tracking Codes:** Generates a unique, deterministic tracking code for submitters to monitor case progress and investigator updates without creating an account.

### 2. Public Official Scorecards & Pledges
- **Pledge Lifecycle Tracking:** Monitor official commitments categorized as *Kept*, *Broken*, or *Pending*.
- **Controversies & Source References:** Documented public controversies with verified external references.
- **Citizen Complaint Linkage:** Direct association between citizen-filed reports and official profiles.

### 3. Civic Reporting & Evidence Archive
- **Categorized Filing:** Submit reports across Corruption, Environment, Public Service, Infrastructure, and Human Rights.
- **Embedded Document Viewer:** In-browser PDF reading and image inspection built into evidence detail pages.
- **Cloud Object Preservation:** Secure storage integration for long-term document retention.

### 4. Community Forum & Public Opinions
- **Interactive Markdown Editor:** Live Write/Preview Markdown editing for formatting citations and policy op-eds.
- **Real-Time WebSockets:** Socket.io integration delivering instant comment broadcasts across clients.

### 5. Transparency Analytics Dashboard
- Data visualizations computing case resolution rates, category distributions, and official promise fulfillment statistics.

---

## System Architecture

```text
verisphere/
├── client/                      # React 18 SPA (Vite)
│   ├── src/
│   │   ├── api/                 # Axios HTTP client configuration
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # AuthContext state management
│   │   ├── hooks/               # Custom hooks (useSocket)
│   │   └── pages/               # Application route views
│   ├── vercel.json              # Client SPA routing rewrite rules
│   └── vite.config.js
├── server/                      # Node.js + Express REST API & WebSockets
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definitions (16 models)
│   │   └── seed.js              # Database seeding script
│   └── src/
│       ├── middleware/          # JWT auth & upload handling
│       ├── routes/              # Express API endpoints
│       ├── prisma.js            # Prisma ORM singleton instance
│       └── index.js             # Express entry point & Socket.io server
└── README.md
```

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router 6, Vanilla CSS Design System, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js, Socket.io, Prisma ORM 6, Multer, bcryptjs, jsonwebtoken
- **Database:** PostgreSQL (Hosted on Supabase)
- **Object Storage:** Supabase Storage
- **Deployment:** Vercel (Frontend SPA) and Render (Backend API Web Service)

---

## Local Setup & Installation

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher (or a Supabase PostgreSQL instance)
- npm

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/mrhjayeed/verisphere.git
cd verisphere

# Install root workspace dependencies
npm install

# Install server and client dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/verisphere"
JWT_SECRET="your_secure_jwt_secret"
CORS_ORIGIN="http://localhost:5173"

# Optional: Supabase Storage configuration for cloud file uploads
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL="http://localhost:5000"
VITE_SOCKET_URL="http://localhost:5000"
```

### 3. Database Initialization

```bash
cd server

# Apply database migrations and generate Prisma Client
npx prisma db push

# Optional: Seed initial demonstration data
node prisma/seed.js
```

### 4. Running Development Servers

From the root directory, start both backend and frontend development servers concurrently:

```bash
npm run dev
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API Server:** `http://localhost:5000`

---

## Production Deployment

### Database & Cloud Storage
1. Provision a PostgreSQL instance on Supabase.
2. Use the connection pooler string (Port 6543) for `DATABASE_URL`.
3. Create a public storage bucket named `verisphere-uploads`.

### Backend API (Render)
- Root Directory: `server`
- Build Command: `npm install && npx prisma generate`
- Start Command: `npm start`
- Set required environment variables (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

### Frontend SPA (Vercel)
- Root Directory: `client`
- Output Directory: `dist`
- Set `VITE_API_URL` and `VITE_SOCKET_URL` environment variables pointing to your deployed API server.

---

## Security & Whistleblower Protection

Verisphere implements privacy-first design patterns to protect submitter confidentiality:
- Anonymous whistleblowing submissions do not log user accounts, session cookies, IP addresses, or user-agent headers.
- Secret Tracking Codes rely on cryptographically secure random identifiers to allow status queries without account creation.
- File uploads are validated and sanitized prior to storage persistence.

---

## Contributing

Contributions are welcome from developers, security researchers, legal advisors, and civic activists. Please feel free to open issues, submit pull requests, or propose new feature modules.

---

## License

Verisphere is open-source software released under the [MIT License](LICENSE).
