import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useSocket } from '../../hooks/useSocket';

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions')
      .then((res) => setSubmissions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useSocket('submissionStatusUpdated', (updated) => {
    setSubmissions((prev) => prev.map((s) => s.id === updated.id ? { ...s, status: updated.status } : s));
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  if (loading) return <div className="loading">Loading submissions...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>My Submissions</h1>
            <p>Track the status of your whistleblower submissions</p>
          </div>
          <Link to="/whistleblow" className="btn btn-primary">New Submission</Link>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state">
          <h3>No submissions yet</h3>
          <p>Anonymous submissions will not appear here.</p>
        </div>
      ) : (
        <div className="list-stack">
          {submissions.map((s) => (
            <div key={s.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', marginBottom: '0.25rem' }}>{s.title}</h3>
                  <div className="card-meta">
                    <span className="badge badge-category">{s.category.replace(/_/g, ' ')}</span>
                    <span>{formatDate(s.createdAt)}</span>
                    {s.files?.length > 0 && <span>{s.files.length} file(s)</span>}
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
