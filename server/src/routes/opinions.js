import { Router } from 'express';
import prisma from '../prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/opinions — list opinion posts
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.opinionPost.findMany({
      where,
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    console.error('List opinions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/opinions/:id — opinion detail with comments
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.opinionPost.findUnique({
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
    if (!post) return res.status(404).json({ error: 'Opinion post not found' });
    res.json(post);
  } catch (err) {
    console.error('Get opinion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/opinions — create opinion post
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const post = await prisma.opinionPost.create({
      data: { title, body, authorId: req.user.id },
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { comments: true } },
      },
    });

    const io = req.app.get('io');
    if (io) io.emit('newOpinionPost', post);

    res.status(201).json(post);
  } catch (err) {
    console.error('Create opinion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/opinions/:id/comments — add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Comment body is required' });

    const comment = await prisma.opinionComment.create({
      data: {
        opinionId: req.params.id,
        authorId: req.user.id,
        body,
      },
      include: {
        author: { select: { id: true, displayName: true } },
      },
    });

    const io = req.app.get('io');
    if (io) io.emit('newOpinionComment', { opinionId: req.params.id, comment });

    res.status(201).json(comment);
  } catch (err) {
    console.error('Create opinion comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
