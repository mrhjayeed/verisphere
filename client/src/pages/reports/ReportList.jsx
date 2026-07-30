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

  const fetchReports = async () => {
    try {
      const params = filter !== 'all' ? { category: filter } : {};
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
  }, [filter]);

  useSocket('newReport', (report) => {
    setReports((prev) => [report, ...prev]);
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

      <div className="filter-group" style={{ marginBottom: 'var(--space-xl)' }}>
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
