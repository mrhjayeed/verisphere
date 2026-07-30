import { Router } from 'express';
import prisma from '../prisma.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { upload, uploadToStorage } from '../middleware/upload.js';

const router = Router();

// GET /api/submissions — admin lists all, user lists own
router.get('/', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { submitterId: req.user.id };

    const submissions = await prisma.whistleblowerSubmission.findMany({
      where,
      include: {
        submitter: { select: { id: true, displayName: true } },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(submissions);
  } catch (err) {
    console.error('List submissions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/submissions/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const submission = await prisma.whistleblowerSubmission.findUnique({
      where: { id: req.params.id },
      include: {
        submitter: { select: { id: true, displayName: true } },
        files: true,
      },
    });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Only admin or the submitter can view
    if (req.user.role !== 'admin' && submission.submitterId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Get submission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

import crypto from 'crypto';

// GET /api/submissions/track/:code — public tracking by secret code
router.get('/track/:code', async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const submission = await prisma.whistleblowerSubmission.findFirst({
      where: { trackingCode: code },
      select: {
        id: true,
        trackingCode: true,
        title: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
        files: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'No submission found matching this tracking code' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Track submission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/submissions — create submission (can be anonymous)
router.post('/', optionalAuth, upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, category, anonymous } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    const isAnonymous = anonymous === 'true' || anonymous === true;
    const trackingCode = `WB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const submission = await prisma.whistleblowerSubmission.create({
      data: {
        trackingCode,
        title,
        description,
        category,
        submitterId: isAnonymous ? null : (req.user?.id || null),
      },
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = await uploadToStorage(file.buffer, file.originalname);
        await prisma.submissionFile.create({
          data: {
            submissionId: submission.id,
            filePath,
            originalName: file.originalname,
          },
        });
      }
    }

    const fullSubmission = await prisma.whistleblowerSubmission.findUnique({
      where: { id: submission.id },
      include: {
        submitter: { select: { id: true, displayName: true } },
        files: true,
      },
    });

    // Emit realtime event
    const io = req.app.get('io');
    if (io) io.emit('newSubmission', fullSubmission);

    res.status(201).json(fullSubmission);
  } catch (err) {
    console.error('Create submission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/submissions/:id/status — admin update status
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['received', 'under_review', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const submission = await prisma.whistleblowerSubmission.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        submitter: { select: { id: true, displayName: true } },
        files: true,
      },
    });

    const io = req.app.get('io');
    if (io) io.emit('submissionStatusUpdated', submission);

    res.json(submission);
  } catch (err) {
    console.error('Update submission status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
