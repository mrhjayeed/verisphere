import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function OfficialDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [official, setOfficial] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showPromiseForm, setShowPromiseForm] = useState(false);
  const [promiseForm, setPromiseForm] = useState({ text: '', status: 'pending', sourceUrl: '' });

  const [showControversyForm, setShowControversyForm] = useState(false);
  const [controversyForm, setControversyForm] = useState({ title: '', description: '', sourceUrl: '' });

  const fetchOfficial = () => {
    api.get(`/officials/${id}`)
      .then((res) => setOfficial(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOfficial();
  }, [id]);

  const handleUpdatePromiseStatus = async (promiseId, newStatus) => {
    try {
      await api.patch(`/officials/promises/${promiseId}`, { status: newStatus });
      setOfficial((prev) => ({
        ...prev,
        promises: prev.promises.map((p) => p.id === promiseId ? { ...p, status: newStatus } : p),
      }));
    } catch (err) {
      alert('Failed to update promise status');
    }
  };

  const handleAddPromise = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/officials/${id}/promises`, promiseForm);
      setPromiseForm({ text: '', status: 'pending', sourceUrl: '' });
      setShowPromiseForm(false);
      fetchOfficial();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add promise');
    }
  };

  const handleAddControversy = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/officials/${id}/controversies`, controversyForm);
      setControversyForm({ title: '', description: '', sourceUrl: '' });
      setShowControversyForm(false);
      fetchOfficial();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add controversy');
    }
  };

  if (loading) return <div className="loading">Loading official...</div>;
  if (!official) return <div className="empty-state"><h3>Official not found</h3></div>;

  const promiseCounts = {
    kept: official.promises.filter(p => p.status === 'kept').length,
    broken: official.promises.filter(p => p.status === 'broken').length,
    pending: official.promises.filter(p => p.status === 'pending').length,
  };

  const isAdmin = user?.role === 'admin';

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

      {/* PROMISES TRACKER */}
      <div className="detail-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: 'var(--space-md)' }}>
          <h2>
            Promises
            <span className="text-sm text-secondary" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, marginLeft: '0.75rem' }}>
              {promiseCounts.kept} kept · {promiseCounts.broken} broken · {promiseCounts.pending} pending
            </span>
          </h2>
          {isAdmin && (
            <button className="btn btn-sm btn-outline" onClick={() => setShowPromiseForm(!showPromiseForm)}>
              {showPromiseForm ? 'Cancel' : '+ Track New Promise'}
            </button>
          )}
        </div>

        {showPromiseForm && (
          <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <form onSubmit={handleAddPromise}>
              <div className="form-group">
                <label>Promise Details</label>
                <input
                  className="form-input"
                  value={promiseForm.text}
                  onChange={(e) => setPromiseForm({ ...promiseForm, text: e.target.value })}
                  placeholder="e.g., Construct 10 public parks by 2026"
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Initial Status</label>
                  <select
                    className="form-select"
                    value={promiseForm.status}
                    onChange={(e) => setPromiseForm({ ...promiseForm, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="kept">Kept</option>
                    <option value="broken">Broken</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Source URL (Optional)</label>
                  <input
                    className="form-input"
                    value={promiseForm.sourceUrl}
                    onChange={(e) => setPromiseForm({ ...promiseForm, sourceUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-sm btn-primary">Save Promise</button>
            </form>
          </div>
        )}

        {official.promises.length === 0 ? (
          <p className="text-secondary">No promises recorded yet.</p>
        ) : (
          official.promises.map((p) => (
            <div key={p.id} className="promise-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <StatusBadge status={p.status} />
              <span style={{ flex: 1 }}>{p.text}</span>
              {isAdmin && (
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
                  value={p.status}
                  onChange={(e) => handleUpdatePromiseStatus(p.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="kept">Kept</option>
                  <option value="broken">Broken</option>
                </select>
              )}
            </div>
          ))
        )}
      </div>

      {/* CONTROVERSIES */}
      <div className="detail-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: 'var(--space-md)' }}>
          <h2>Controversies ({official.controversies.length})</h2>
          {isAdmin && (
            <button className="btn btn-sm btn-outline" onClick={() => setShowControversyForm(!showControversyForm)}>
              {showControversyForm ? 'Cancel' : '+ Add Controversy'}
            </button>
          )}
        </div>

        {showControversyForm && (
          <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <form onSubmit={handleAddControversy}>
              <div className="form-group">
                <label>Title</label>
                <input
                  className="form-input"
                  value={controversyForm.title}
                  onChange={(e) => setControversyForm({ ...controversyForm, title: e.target.value })}
                  placeholder="e.g., Audit discrepancies in road expansion project"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (Markdown)</label>
                <textarea
                  className="form-textarea"
                  value={controversyForm.description}
                  onChange={(e) => setControversyForm({ ...controversyForm, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>Source URL (Optional)</label>
                <input
                  className="form-input"
                  value={controversyForm.sourceUrl}
                  onChange={(e) => setControversyForm({ ...controversyForm, sourceUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <button type="submit" className="btn btn-sm btn-primary">Save Controversy</button>
            </form>
          </div>
        )}

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

      {/* COMPLAINTS */}
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
