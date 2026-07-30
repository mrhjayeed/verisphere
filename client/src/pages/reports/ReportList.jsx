import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useSocket } from '../../hooks/useSocket';

const CATEGORIES = [
  'all', 'corruption', 'abuse_of_authority', 'human_rights', 'environment',
  'public_service', 'misuse_of_resources', 'infrastructure', 'election',
];

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchReports = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.category = filter;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/reports', { params });
      setReports(res.data.reports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter, search]);

  useSocket('newReport', (report) => {
    setReports((prev) => {
      if (prev.some((r) => r.id === report.id)) return prev;
      return [report, ...prev];
    });
  });

  useSocket('reportStatusUpdated', (updated) => {
    setReports((prev) => prev.map((r) => r.id === updated.id ? { ...r, status: updated.status } : r));
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Civic Reports</h1>
            <p>Documented civic issues reported by citizens</p>
          </div>
          <Link to="/reports/new" className="btn btn-primary">New Report</Link>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-group">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All' : cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="search-input" style={{ width: '250px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <h3>No reports found</h3>
          <p>Be the first to submit a civic report.</p>
        </div>
      ) : (
        <div className="list-stack">
          {reports.map((report) => (
            <Link key={report.id} to={`/reports/${report.id}`} className="card card-link">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.25rem', fontFamily: 'var(--font-sans)', fontSize: '1rem' }}>{report.title}</h3>
                  <div className="card-meta">
                    <span>{report.author?.displayName || 'Anonymous'}</span>
                    <span>{formatDate(report.createdAt)}</span>
                    {report.location && <span>{report.location}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <span className="badge badge-category">{report.category.replace(/_/g, ' ')}</span>
                  <StatusBadge status={report.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
