import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

export default function ForumThread() {
  const { id } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/forum/${id}`)
      .then((res) => setThread(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useSocket('newForumComment', (data) => {
    if (data.threadId === id) {
      setThread((prev) => prev ? { ...prev, comments: [...prev.comments, data.comment] } : prev);
    }
  });

  const handleComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/forum/${id}/comments`, { body: commentBody });
      setCommentBody('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) return <div className="loading">Loading thread...</div>;
  if (!thread) return <div className="empty-state"><h3>Thread not found</h3></div>;

  return (
    <div className="detail-page">
      <Link to="/forum" style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>← Back to forum</Link>

      <h1 style={{ marginTop: 'var(--space-md)' }}>{thread.title}</h1>
      <div className="detail-meta">
        <span>{thread.author.displayName}</span>
        <span>{formatDate(thread.createdAt)}</span>
      </div>

      <div className="detail-body">
        <MarkdownRenderer content={thread.body} />
      </div>

      <div className="detail-section">
        <h2>Comments ({thread.comments.length})</h2>
        {thread.comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="comment-header">
              <span className="comment-author">{c.author.displayName}</span>
              <span className="comment-date">{formatDate(c.createdAt)}</span>
            </div>
            <div className="comment-body">
              <MarkdownRenderer content={c.body} />
            </div>
          </div>
        ))}

        {user ? (
          <form onSubmit={handleComment} style={{ marginTop: 'var(--space-lg)' }}>
            <div className="form-group">
              <textarea
                className="form-textarea"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment (Markdown supported)..."
                rows={4}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className="text-secondary" style={{ marginTop: 'var(--space-lg)' }}>
            <Link to="/login">Log in</Link> to join the discussion.
          </p>
        )}
      </div>
    </div>
  );
}
