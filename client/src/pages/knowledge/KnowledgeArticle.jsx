import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import MarkdownEditor from '../../components/MarkdownEditor';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['legal_rights', 'governance', 'civic_engagement', 'environment', 'education'];

export default function KnowledgeArticle() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/knowledge/${id}`)
      .then((res) => {
        setArticle(res.data);
        setForm({
          title: res.data.title,
          category: res.data.category,
          content: res.data.content,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/knowledge/${id}`, form);
      setArticle(res.data);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update article');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading article...</div>;
  if (!article) return <div className="empty-state"><h3>Article not found</h3></div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="detail-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/knowledge" style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>← Back to Knowledge Hub</Link>
        {isAdmin && (
          <button className="btn btn-sm btn-outline" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel Editing' : '✏️ Edit Article'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="card" style={{ marginTop: 'var(--space-md)' }}>
          <h2>Edit Knowledge Article</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Title</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Content (Markdown)</label>
              <MarkdownEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save Article'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <h1 style={{ marginTop: 'var(--space-md)' }}>{article.title}</h1>
          <div className="detail-meta">
            <span className="badge badge-category">{article.category.replace(/_/g, ' ')}</span>
            <span>{article.author?.displayName || 'Admin'}</span>
            <span>{formatDate(article.createdAt)}</span>
          </div>

          <div className="detail-body">
            <MarkdownRenderer content={article.content} />
          </div>
        </>
      )}
    </div>
  );
}
