import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import StatusBadge from '../../components/StatusBadge';

export default function OfficialDetail() {
  const { id } = useParams();
  const [official, setOfficial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/officials/${id}`)
      .then((res) => setOfficial(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading official...</div>;
  if (!official) return <div className="empty-state"><h3>Official not found</h3></div>;

  const promiseCounts = {
    kept: official.promises.filter(p => p.status === 'kept').length,
    broken: official.promises.filter(p => p.status === 'broken').length,
    pending: official.promises.filter(p => p.status === 'pending').length,
  };

  return (
    <div className="detail-page">
      <Link to="/officials" style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>← Back to officials</Link>

      <div className="official-header" style={{ marginTop: 'var(--space-md)' }}>
        {official.photoPath ? (
          <img src={official.photoPath} alt={official.name} className="official-photo" />
        ) : (
          <div className="official-photo-placeholder">
            {official.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{official.name}</h1>
          <p className="text-secondary" style={{ marginBottom: '0.25rem' }}>{official.position}</p>
          <p className="text-secondary text-sm">{official.institution}</p>
        </div>
      </div>

      {official.bio && (
        <div className="detail-section">
          <h2>Biography</h2>
          <MarkdownRenderer content={official.bio} />
        </div>
      )}

      <div className="detail-section">
        <h2>
          Promises
          <span className="text-sm text-secondary" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, marginLeft: '0.75rem' }}>
            {promiseCounts.kept} kept · {promiseCounts.broken} broken · {promiseCounts.pending} pending
          </span>
        </h2>
        {official.promises.length === 0 ? (
          <p className="text-secondary">No promises recorded yet.</p>
        ) : (
          official.promises.map((p) => (
            <div key={p.id} className="promise-item">
              <StatusBadge status={p.status} />
              <span style={{ flex: 1 }}>{p.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="detail-section">
        <h2>Controversies ({official.controversies.length})</h2>
        {official.controversies.length === 0 ? (
          <p className="text-secondary">No controversies recorded.</p>
        ) : (
          official.controversies.map((c) => (
            <div key={c.id} className="controversy-item">
              <h4>{c.title}</h4>
              <MarkdownRenderer content={c.description} />
              {c.sourceUrl && (
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm">
                  Source →
                </a>
              )}
            </div>
          ))
        )}
      </div>

      <div className="detail-section">
        <h2>Complaints ({official.complaints.length})</h2>
        {official.complaints.length === 0 ? (
          <p className="text-secondary">No complaints filed.</p>
        ) : (
          official.complaints.map((c) => (
            <div key={c.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ marginBottom: '0.25rem' }}>{c.text}</p>
              {c.report && (
                <Link to={`/reports/${c.report.id}`} className="text-sm">
                  Linked report: {c.report.title} ({c.report.category.replace(/_/g, ' ')})
                </Link>
              )}
              <p className="text-xs text-tertiary" style={{ marginBottom: 0, marginTop: '0.25rem' }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
