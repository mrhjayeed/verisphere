import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import reportsRoutes from './routes/reports.js';
import officialsRoutes from './routes/officials.js';
import dashboardRoutes from './routes/dashboard.js';
import forumRoutes from './routes/forum.js';
import evidenceRoutes from './routes/evidence.js';
import knowledgeRoutes from './routes/knowledge.js';
import opinionsRoutes from './routes/opinions.js';
import submissionsRoutes from './routes/submissions.js';

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io and prisma available to routes
app.set('io', io);
app.set('prisma', prisma);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Local file uploads (fallback when Supabase not configured)
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/officials', officialsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/opinions', opinionsRoutes);
app.use('/api/submissions', submissionsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Verisphere server running on port ${PORT}`);
});

export { app, io, prisma };
