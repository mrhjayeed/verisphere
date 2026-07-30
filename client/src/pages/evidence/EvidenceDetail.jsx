import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownRenderer from '../../components/MarkdownRenderer';

export default function EvidenceDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/evidence/${id}`)
      .then((res) => setItem(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const isImage = (type) => type?.startsWith('image/');
  const isPdf = (type) => type?.includes('pdf') || item?.originalName?.endsWith('.pdf');

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <div className="loading">Loading evidence...</div>;
  if (!item) return <div className="empty-state"><h3>Evidence item not found</h3></div>;

  return (
    <div className="detail-page" style={{ maxWidth: '820px' }}>
      <Link to="/evidence" style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>
        ← Back to evidence archive
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginTop: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{item.title}</h1>
          <div className="card-meta">
            <span className="badge badge-category">{item.category.replace(/_/g, ' ')}</span>
            <span>Uploaded {formatDate(item.createdAt)}</span>
            <span>by {item.uploadedBy?.displayName || 'Anonymous'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-outline" onClick={handleCopyLink}>
            {copied ? '✓ Link Copied' : '🔗 Share Link'}
          </button>
          <a href={item.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
            Open File ↗
          </a>
        </div>
      </div>

      {item.sourceRef && (
        <div className="alert alert-info" style={{ marginBottom: 'var(--space-lg)' }}>
          <strong>Source reference:</strong> {item.sourceRef}
        </div>
      )}

      {/* File Preview */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md)', textAlign: 'center', background: 'var(--bg-alt)' }}>
        {isImage(item.fileType) ? (
          <img
            src={item.filePath}
            alt={item.title}
            style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '4px' }}
          />
        ) : isPdf(item.fileType) ? (
          <div style={{ height: '500px', width: '100%' }}>
            <iframe
              src={item.filePath}
              title={item.title}
              width="100%"
              height="100%"
              style={{ border: 'none', borderRadius: '4px' }}
            />
          </div>
        ) : (
          <div style={{ padding: 'var(--space-2xl) var(--space-md)' }}>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>Document file ({item.originalName})</p>
            <a href={item.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Download File ({item.originalName})
            </a>
          </div>
        )}
      </div>

      {/* Detailed Description */}
      {item.description && (
        <div className="detail-section">
          <h2>Evidence Description</h2>
          <MarkdownRenderer content={item.description} />
        </div>
      )}
    </div>
  );
}
