# 🌐 Verisphere — Open-Source Civic Accountability Platform

[![July Hackathon 2026](https://img.shields.io/badge/July%20Hackathon%202026-Track%20B%3A%20Spirit%20of%20July-1E3A5F?style=for-the-badge)](https://hackathon2026.jrabd.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Live App](https://img.shields.io/badge/Live%20App-verispherebd.vercel.app-2D6A4F?style=for-the-badge)](https://verispherebd.vercel.app)

**Verisphere** is an open-source, community-driven civic platform where citizens report injustice, track public official performance, archive verified evidence, learn their legal rights, discuss issues with live Markdown preview, and whistleblow with 100% cryptographic anonymity.

Built for **July Hackathon 2026** under **Track B. Spirit of July** *(Transparency, Accountability, & Access to Justice)*.

---

## 🔗 Live Links & Demo Access

* 🌐 **Live Web Application**: [https://verispherebd.vercel.app](https://verispherebd.vercel.app)
* ⚙️ **Production API Endpoint**: `https://verisphere-backend-0z2y.onrender.com`
* 💻 **GitHub Repository**: [https://github.com/mrhjayeed/verisphere](https://github.com/mrhjayeed/verisphere)

### 🗝️ Hackathon Demo Credentials

| Role | Username | Password | Privileges |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | `admin` | `admin123` | Full Admin Panel, Official Profile Editing, Promise Status Management |
| 👤 **Citizen 1** | `citizen` | `citizen123` | File Reports, Submit Opinions, Post Forum Threads, Upload Evidence |
| 👤 **Citizen 2** | `farida_k` | `citizen123` | Community Member |

### 🔒 Sample Secret Whistleblower Tracking Codes
Test case tracking without login at **[`/whistleblow/track`](https://verispherebd.vercel.app/whistleblow/track)**:
* `VS-789012` *(Status: Under Review)*
* `VS-345678` *(Status: Resolved)*

---

## 🎯 Problem Statement & Track Alignment

In the wake of civic movements and structural reforms, citizens lack centralized, censorship-resistant platforms to monitor public governance. Critical evidence of corruption, human rights abuses, and municipal neglect is frequently deleted or algorithmically suppressed on mainstream social networks. Potential whistleblowers face grave risks of retaliation due to intrusive IP logging and data retention.

**Verisphere** directly addresses **Track B: Spirit of July** by providing:
1. **Zero-PII Encrypted Whistleblowing**: Submit disclosures without storing IP addresses, user IDs, or browser fingerprints, accompanied by deterministic Secret Tracking Codes.
2. **Public Official Performance Scorecards**: Transparent tracking of official pledges (*Kept*, *Broken*, *Pending*), complaints, and controversies.
3. **Interactive Evidence Vault**: Permanent cloud preservation of civic evidence with embedded PDF document readers and image inspection tools.
4. **Access to Justice**: Simple, accessible guides on constitutional rights, RTI (Right to Information) filings, and Public Interest Litigation (PIL).

---

## ✨ Key Platform Features

| Capability | Technical Highlights |
| :--- | :--- |
| **🔒 Anonymous Whistleblowing** | Zero-metadata submission mode with Secret Tracking Code generation (`VS-XXXXXX`) |
| **🏛️ Official Profiles & Scorecards** | Public pledge tracking (*Kept vs. Broken*), controversies, and direct complaint linking |
| **📋 Civic Reporting** | Filtered reports by category (*Corruption, Environment, Public Service, Infrastructure*) |
| **📁 Interactive Evidence Archive** | Cloud storage via Supabase Storage with embedded PDF viewer and image zoom |
| **📊 Transparency Dashboard** | Real-time interactive charts powered by Recharts (resolution rates, category distribution) |
| **💬 Forum & Public Opinions** | Multi-threaded discussions with live **Write / Preview** Markdown editors |
| **⚡ Real-Time WebSockets** | Instant updates across clients via Socket.io without page refreshes |
| **🛡️ Admin Panel** | Managing officials, promise status toggles, review submissions, and article publishing |

---

## 🏗️ Technical Architecture

```
verisphere/
├── client/                      # React 18 + Vite Frontend
│   ├── src/
│   │   ├── api/                 # Axios Client & Interceptors
│   │   ├── components/          # MarkdownEditor, MarkdownRenderer, Navbar, FileUpload, StatusBadge
│   │   ├── context/             # AuthContext (JWT & State)
│   │   ├── hooks/               # useSocket (Real-time WebSockets)
│   │   └── pages/               # Reports, Officials, Evidence, Forum, Opinions, Knowledge, Whistleblow, Admin
│   ├── vercel.json              # Vercel SPA Routing Configuration
│   └── vite.config.js
├── server/                      # Node.js + Express Backend API
│   ├── prisma/
│   │   ├── schema.prisma        # 16 Relational Data Models
│   │   ├── seed.js              # Production & Local Demo Seeding Script
│   │   └── clear.js             # Database Cleanup Utility
│   └── src/
│       ├── middleware/          # JWT Authentication & Multer Cloud Upload
│       ├── routes/              # Auth, Reports, Officials, Dashboard, Forum, Evidence, Knowledge, Opinions, Submissions
│       ├── prisma.js            # Single Shared Prisma Client Singleton
│       └── index.js             # Express Server & Socket.io Server Setup
└── README.md
```

---

## 🛠️ Local Installation & Setup

### Prerequisites
* Node.js 18+
* PostgreSQL 14+ (Local or Supabase)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mrhjayeed/verisphere.git
cd verisphere

# Install root dependencies
npm install

# Install server and client packages
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Database Setup & Seeding
```bash
# In server directory, configure .env
cd server
cp .env.example .env

# Run Prisma schema push & generate
npx prisma db push

# Seed demo dataset
node prisma/seed.js
```

### 3. Run Development Servers
```bash
# From the root directory — launches both server (:5000) and client (:5173) concurrently
npm run dev
```

* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`

---

## 🚀 Production Deployment Blueprint

* **Database**: Supabase PostgreSQL (Connection Pooler on Port 6543)
* **File Storage**: Supabase Public Storage Bucket (`verisphere-uploads`)
* **Backend Hosting**: Render Web Service (`node src/index.js`)
* **Frontend Hosting**: Vercel Single-Page App (`dist`)

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p center="align">
  Built with ❤️ for <strong>July Hackathon 2026</strong> · Dedicated to transparency, truth, and civic dignity.
</p>
