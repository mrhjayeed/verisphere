import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import StatusBadge from '../../components/StatusBadge';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then((res) => setReport(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading report...</div>;
  if (!report) return <div className="empty-state"><h3>Report not found</h3></div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="detail-page">
      <Link to="/reports" style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>← Back to reports</Link>

      <h1 style={{ marginTop: 'var(--space-md)' }}>{report.title}</h1>

      <div className="detail-meta">
        <StatusBadge status={report.status} />
        <span className="badge badge-category">{report.category.replace(/_/g, ' ')}</span>
        <span>by {report.author?.displayName || 'Anonymous'}</span>
        <span>{formatDate(report.createdAt)}</span>
        {report.location && <span>📍 {report.location}</span>}
        {report.incidentDate && <span>Incident: {formatDate(report.incidentDate)}</span>}
      </div>

      <div className="detail-body">
        <MarkdownRenderer content={report.description} />
      </div>

      {report.files?.length > 0 && (
        <div className="detail-section">
          <h2>Attached Files</h2>
          <div className="list-stack">
            {report.files.map((file) => (
              <div key={file.id} className="file-item">
                <a href={file.filePath} target="_blank" rel="noopener noreferrer">
                  {file.originalName}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.complaints?.length > 0 && (
        <div className="detail-section">
          <h2>Linked Official Complaints</h2>
          {report.complaints.map((c) => (
            <div key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ marginBottom: '0.25rem' }}>{c.text}</p>
              {c.official && (
                <Link to={`/officials/${c.official.id}`} className="text-sm">
                  → {c.official.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
