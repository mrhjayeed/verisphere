import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { useSocket } from '../../hooks/useSocket';

export default function TrackSubmission() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setError('');
    setLoading(true);
    setSubmission(null);

    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await api.get(`/submissions/track/${cleanCode}`);
      setSubmission(res.data);
      setSearchParams({ code: cleanCode });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to track submission. Check code and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleTrack();
    }
  }, []);

  useSocket('submissionStatusUpdated', (updated) => {
    if (submission && updated.id === submission.id) {
      setSubmission((prev) => prev ? { ...prev, status: updated.status } : prev);
    }
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ maxWidth: '680px' }}>
      <Link to="/whistleblow" style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>
        ← Back to Whistleblow Form
      </Link>

      <h1 style={{ marginTop: 'var(--space-md)' }}>Track Whistleblower Submission</h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
        Enter your Secret Tracking Code to check the live investigation status of an anonymous or private submission.
      </p>

      <form onSubmit={handleTrack} style={{ marginBottom: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., WB-DEMO-0001 or WB-A49F-18C2"
              style={{ fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: '1rem', textTransform: 'uppercase' }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track Status'}
          </button>
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {submission && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: 'var(--space-md)' }}>
            <div>
              <div className="text-xs text-tertiary" style={{ fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Tracking Code: {submission.trackingCode}
              </div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                {submission.title}
              </h2>
              <div className="card-meta">
                <span className="badge badge-category">{submission.category.replace(/_/g, ' ')}</span>
                <span>Submitted: {formatDate(submission.createdAt)}</span>
              </div>
            </div>
            <div>
              <StatusBadge status={submission.status} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Details</h3>
            <MarkdownRenderer content={submission.description} />
          </div>

          {submission.files?.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Attached Files ({submission.files.length})</h3>
              <div className="list-stack">
                {submission.files.map((file) => (
                  <div key={file.id} className="file-item">
                    <a href={file.filePath} target="_blank" rel="noopener noreferrer">
                      {file.originalName}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
