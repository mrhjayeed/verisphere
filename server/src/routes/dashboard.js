import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    // Reports by category
    const reportsByCategory = await prisma.civicReport.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    // Reports by status
    const reportsByStatus = await prisma.civicReport.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Submissions over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const reportsOverTime = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "CivicReport"
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Officials by number of complaints
    const officialsByComplaints = await prisma.official.findMany({
      select: {
        id: true,
        name: true,
        position: true,
        _count: { select: { complaints: true } },
      },
      orderBy: { complaints: { _count: 'desc' } },
      take: 10,
    });

    // Total counts
    const [totalReports, totalSubmissions, totalOfficials, totalForumThreads] = await Promise.all([
      prisma.civicReport.count(),
      prisma.whistleblowerSubmission.count(),
      prisma.official.count(),
      prisma.forumThread.count(),
    ]);

    // Resolved vs pending reports
    const resolvedReports = await prisma.civicReport.count({ where: { status: 'resolved' } });
    const pendingReports = await prisma.civicReport.count({
      where: { status: { in: ['received', 'under_review'] } },
    });

    res.json({
      reportsByCategory: reportsByCategory.map(r => ({
        category: r.category,
        count: r._count.id,
      })),
      reportsByStatus: reportsByStatus.map(r => ({
        status: r.status,
        count: r._count.id,
      })),
      reportsOverTime,
      officialsByComplaints: officialsByComplaints.map(o => ({
        name: o.name,
        position: o.position,
        complaints: o._count.complaints,
      })),
      totals: {
        reports: totalReports,
        submissions: totalSubmissions,
        officials: totalOfficials,
        forumThreads: totalForumThreads,
        resolvedReports,
        pendingReports,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
