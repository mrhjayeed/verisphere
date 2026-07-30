import { Router } from 'express';
import prisma from '../prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/knowledge — list articles
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      include: {
        author: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(articles);
  } catch (err) {
    console.error('List articles error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/knowledge/:id
router.get('/:id', async (req, res) => {
  try {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, displayName: true } },
      },
    });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error('Get article error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/knowledge — admin create article
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title || !category || !content) {
      return res.status(400).json({ error: 'Title, category, and content are required' });
    }

    const article = await prisma.knowledgeArticle.create({
      data: {
        title,
        category,
        content,
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, displayName: true } },
      },
    });

    res.status(201).json(article);
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/knowledge/:id — admin update article
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const data = {};
    if (title) data.title = title;
    if (category) data.category = category;
    if (content) data.content = content;

    const article = await prisma.knowledgeArticle.update({
      where: { id: req.params.id },
      data,
      include: {
        author: { select: { id: true, displayName: true } },
      },
    });

    res.json(article);
  } catch (err) {
    console.error('Update article error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/knowledge/:id — admin delete article
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.knowledgeArticle.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete article error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
