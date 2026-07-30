import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/forum — list threads
router.get('/', async (req, res) => {
  try {
    const threads = await prisma.forumThread.findMany({
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(threads);
  } catch (err) {
    console.error('List threads error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/forum/:id — thread detail with comments
router.get('/:id', async (req, res) => {
  try {
    const thread = await prisma.forumThread.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, displayName: true } },
        comments: {
          include: {
            author: { select: { id: true, displayName: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json(thread);
  } catch (err) {
    console.error('Get thread error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/forum — create thread
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const thread = await prisma.forumThread.create({
      data: { title, body, authorId: req.user.id },
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { comments: true } },
      },
    });

    const io = req.app.get('io');
    if (io) io.emit('newForumThread', thread);

    res.status(201).json(thread);
  } catch (err) {
    console.error('Create thread error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/forum/:id/comments — add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Comment body is required' });

    const comment = await prisma.forumComment.create({
      data: {
        threadId: req.params.id,
        authorId: req.user.id,
        body,
      },
      include: {
        author: { select: { id: true, displayName: true } },
      },
    });

    const io = req.app.get('io');
    if (io) io.emit('newForumComment', { threadId: req.params.id, comment });

    res.status(201).json(comment);
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
