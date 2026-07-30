import { Router } from 'express';
import prisma from '../prisma.js';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadToStorage } from '../middleware/upload.js';

const router = Router();

// GET /api/evidence — list evidence items
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.evidenceItem.findMany({
      where,
      include: {
        uploadedBy: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    console.error('List evidence error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/evidence/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.evidenceItem.findUnique({
      where: { id: req.params.id },
      include: {
        uploadedBy: { select: { id: true, displayName: true } },
      },
    });
    if (!item) return res.status(404).json({ error: 'Evidence item not found' });
    res.json(item);
  } catch (err) {
    console.error('Get evidence error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/evidence — upload evidence
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, sourceRef } = req.body;
    if (!title || !category || !req.file) {
      return res.status(400).json({ error: 'Title, category, and file are required' });
    }

    const filePath = await uploadToStorage(req.file.buffer, req.file.originalname);
    const fileType = req.file.mimetype;

    const item = await prisma.evidenceItem.create({
      data: {
        title,
        description: description || null,
        filePath,
        originalName: req.file.originalname,
        fileType,
        category,
        sourceRef: sourceRef || null,
        uploadedById: req.user.id,
      },
      include: {
        uploadedBy: { select: { id: true, displayName: true } },
      },
    });

    const io = req.app.get('io');
    if (io) io.emit('newEvidence', item);

    res.status(201).json(item);
  } catch (err) {
    console.error('Create evidence error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
