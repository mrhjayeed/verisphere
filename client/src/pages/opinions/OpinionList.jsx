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

  useEffect(() => {
    api.get('/opinions')
      .then((res) => setPosts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useSocket('newOpinionPost', (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/opinions', { title, body });
      setPosts((prev) => [res.data, ...prev]);
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
