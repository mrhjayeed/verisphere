import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { upload, uploadToStorage } from '../middleware/upload.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/reports — list all reports
router.get('/', async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.civicReport.findMany({
        where,
        include: {
          author: { select: { id: true, displayName: true } },
          files: true,
          _count: { select: { complaints: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.civicReport.count({ where }),
    ]);

    res.json({ reports, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('List reports error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const report = await prisma.civicReport.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, displayName: true } },
        files: true,
        complaints: {
          include: { official: { select: { id: true, name: true } } },
        },
      },
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    console.error('Get report error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reports — create a report
router.post('/', optionalAuth, upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, category, location, incidentDate, anonymous } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    const report = await prisma.civicReport.create({
      data: {
        title,
        description,
        category,
        location: location || null,
        incidentDate: incidentDate ? new Date(incidentDate) : null,
        authorId: anonymous === 'true' ? null : (req.user?.id || null),
      },
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = await uploadToStorage(file.buffer, file.originalname);
        await prisma.civicReportFile.create({
          data: {
            reportId: report.id,
            filePath,
            originalName: file.originalname,
          },
        });
      }
    }

    const fullReport = await prisma.civicReport.findUnique({
      where: { id: report.id },
      include: {
        author: { select: { id: true, displayName: true } },
        files: true,
      },
    });

    // Emit realtime event
    const io = req.app.get('io');
    if (io) io.emit('newReport', fullReport);

    res.status(201).json(fullReport);
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/reports/:id/status — admin update status
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['received', 'under_review', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await prisma.civicReport.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        author: { select: { id: true, displayName: true } },
        files: true,
      },
    });

    const io = req.app.get('io');
    if (io) io.emit('reportStatusUpdated', report);

    res.json(report);
  } catch (err) {
    console.error('Update report status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
