import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

export default function ForumList() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = search.trim() ? { search: search.trim() } : {};
    api.get('/forum', { params })
      .then((res) => setThreads(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  useSocket('newForumThread', (thread) => {
    setThreads((prev) => [thread, ...prev]);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/forum', { title, body });
      setTitle('');
      setBody('');
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  if (loading) return <div className="loading">Loading forum...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Community Forum</h1>
            <p>Discuss civic issues, share strategies, and organize</p>
          </div>
          {user && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'New Thread'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="thread-title">Title</label>
              <input
                id="thread-title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Thread title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="thread-body">Body (Markdown supported)</label>
              <textarea
                id="thread-body"
                className="form-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your post..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Thread'}
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
            placeholder="Search forum threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="empty-state">
          <h3>No threads yet</h3>
          <p>Start a discussion by creating the first thread.</p>
        </div>
      ) : (
        <div className="list-stack">
          {threads.map((t) => (
            <Link key={t.id} to={`/forum/${t.id}`} className="card card-link">
              <h3 style={{ marginBottom: '0.25rem', fontFamily: 'var(--font-sans)', fontSize: '1rem' }}>{t.title}</h3>
              <div className="card-meta">
                <span>{t.author.displayName}</span>
                <span>{formatDate(t.createdAt)}</span>
                <span>{t._count.comments} {t._count.comments === 1 ? 'comment' : 'comments'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
