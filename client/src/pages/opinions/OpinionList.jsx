import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

export default function OpinionList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = search.trim() ? { search: search.trim() } : {};
    api.get('/opinions', { params })
      .then((res) => setPosts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  useSocket('newOpinionPost', (newPost) => {
    setPosts((prev) => {
      if (prev.some((p) => p.id === newPost.id)) return prev;
      return [newPost, ...prev];
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/opinions', { title, body });
      setTitle('');
      setBody('');
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to publish opinion');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  if (loading) return <div className="loading">Loading opinions...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Public Opinion</h1>
            <p>Community perspectives on civic matters</p>
          </div>
          {user && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Publish Opinion'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Body (Markdown supported)</label>
              <textarea className="form-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={8} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish'}
            </button>
          </form>
        </div>
      )}

      <div className="toolbar" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="search-input" style={{ width: '100%', maxWidth: '360px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search opinions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state"><h3>No opinions published yet</h3></div>
      ) : (
        <div className="list-stack">
          {posts.map((p) => (
            <Link key={p.id} to={`/opinions/${p.id}`} className="card card-link">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{p.title}</h3>
              <div className="card-meta">
                <span>{p.author.displayName}</span>
                <span>{formatDate(p.createdAt)}</span>
                <span>{p._count.comments} {p._count.comments === 1 ? 'comment' : 'comments'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
