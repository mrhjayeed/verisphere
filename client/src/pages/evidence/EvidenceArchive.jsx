import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../../components/FileUpload';
import { useSocket } from '../../hooks/useSocket';

const CATEGORIES = ['environment', 'corruption', 'infrastructure', 'governance', 'election', 'public_service', 'human_rights', 'other'];

export default function EvidenceArchive() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', sourceRef: '' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = () => {
    const params = {};
    if (filter !== 'all') params.category = filter;
    if (search) params.search = search;
    api.get('/evidence', { params })
      .then((res) => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [filter, search]);

  useSocket('newEvidence', (newItem) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === newItem.id)) return prev;
      return [newItem, ...prev];
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return alert('Please select a file');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('sourceRef', form.sourceRef);
      formData.append('file', files[0]);
      await api.post('/evidence', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ title: '', description: '', category: '', sourceRef: '' });
      setFiles([]);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload evidence');
    } finally {
      setSubmitting(false);
    }
  };

  const isImage = (type) => type?.startsWith('image/');

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  if (loading) return <div className="loading">Loading evidence...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Evidence Archive</h1>
            <p>Documented evidence supporting civic accountability</p>
          </div>
          {user && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Upload Evidence'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="form-group">
              <label>Source Reference</label>
              <input className="form-input" value={form.sourceRef} onChange={(e) => setForm({ ...form, sourceRef: e.target.value })} placeholder="Optional source attribution" />
            </div>
            <div className="form-group">
              <label>File</label>
              <FileUpload files={files} onChange={setFiles} multiple={false} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      )}

      <div className="toolbar">
        <div className="filter-group">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="search-input" style={{ width: '250px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search evidence..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state"><h3>No evidence items found</h3></div>
      ) : (
        <div className="grid-2">
          {items.map((item) => (
            <Link key={item.id} to={`/evidence/${item.id}`} className="card card-link">
              {isImage(item.fileType) && (
                <img src={item.filePath} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 2, marginBottom: '0.75rem' }} />
              )}
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.title}</h3>
              {item.description && <p className="text-sm text-secondary" style={{ marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>}
              <div className="card-meta">
                <span className="badge badge-category">{item.category.replace(/_/g, ' ')}</span>
                <span>{formatDate(item.createdAt)}</span>
                <span>by {item.uploadedBy?.displayName || 'Anonymous'}</span>
              </div>
              {item.sourceRef && <p className="text-xs text-tertiary" style={{ marginTop: '0.5rem', marginBottom: 0 }}>Source: {item.sourceRef}</p>}
              <span className="text-sm" style={{ marginTop: '0.5rem', display: 'inline-block', color: 'var(--accent)' }}>
                View full evidence →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
