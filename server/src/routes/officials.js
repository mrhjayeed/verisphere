import { Router } from 'express';
import prisma from '../prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload, uploadToStorage } from '../middleware/upload.js';

const router = Router();

// GET /api/officials — list all officials
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { institution: { contains: search, mode: 'insensitive' } },
            { position: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const officials = await prisma.official.findMany({
      where,
      include: {
        _count: {
          select: { promises: true, controversies: true, complaints: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(officials);
  } catch (err) {
    console.error('List officials error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/officials/:id
router.get('/:id', async (req, res) => {
  try {
    const official = await prisma.official.findUnique({
      where: { id: req.params.id },
      include: {
        promises: true,
        controversies: true,
        complaints: {
          include: {
            report: { select: { id: true, title: true, category: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!official) return res.status(404).json({ error: 'Official not found' });
    res.json(official);
  } catch (err) {
    console.error('Get official error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/officials — admin create official
router.post('/', authenticate, requireAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { name, position, institution, bio } = req.body;
    if (!name || !position || !institution) {
      return res.status(400).json({ error: 'Name, position, and institution are required' });
    }

    let photoPath = null;
    if (req.file) {
      photoPath = await uploadToStorage(req.file.buffer, req.file.originalname);
    }

    const official = await prisma.official.create({
      data: { name, position, institution, bio: bio || null, photoPath },
    });

    res.status(201).json(official);
  } catch (err) {
    console.error('Create official error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/officials/:id — admin update official
router.put('/:id', authenticate, requireAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { name, position, institution, bio } = req.body;
    const data = {};
    if (name) data.name = name;
    if (position) data.position = position;
    if (institution) data.institution = institution;
    if (bio !== undefined) data.bio = bio || null;

    if (req.file) {
      data.photoPath = await uploadToStorage(req.file.buffer, req.file.originalname);
    }

    const official = await prisma.official.update({
      where: { id: req.params.id },
      data,
    });

    res.json(official);
  } catch (err) {
    console.error('Update official error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/officials/:id/promises — admin add promise
router.post('/:id/promises', authenticate, requireAdmin, async (req, res) => {
  try {
    const { text, status } = req.body;
    if (!text) return res.status(400).json({ error: 'Promise text is required' });

    const promise = await prisma.officialPromise.create({
      data: {
        officialId: req.params.id,
        text,
        status: status || 'pending',
      },
    });
    res.status(201).json(promise);
  } catch (err) {
    console.error('Create promise error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/officials/promises/:id — admin update promise status
router.patch('/promises/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['kept', 'broken', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const promise = await prisma.officialPromise.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(promise);
  } catch (err) {
    console.error('Update promise error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/officials/:id/controversies — admin add controversy
router.post('/:id/controversies', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, sourceUrl } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const controversy = await prisma.officialControversy.create({
      data: {
        officialId: req.params.id,
        title,
        description,
        sourceUrl: sourceUrl || null,
      },
    });
    res.status(201).json(controversy);
  } catch (err) {
    console.error('Create controversy error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/officials/:id/complaints — add complaint (linked to report)
router.post('/:id/complaints', authenticate, async (req, res) => {
  try {
    const { text, reportId } = req.body;
    if (!text) return res.status(400).json({ error: 'Complaint text is required' });

    const complaint = await prisma.officialComplaint.create({
      data: {
        officialId: req.params.id,
        text,
        reportId: reportId || null,
      },
    });
    res.status(201).json(complaint);
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
