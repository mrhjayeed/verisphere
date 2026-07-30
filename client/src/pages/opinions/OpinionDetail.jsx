import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import MarkdownEditor from '../../components/MarkdownEditor';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

export default function OpinionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/opinions/${id}`)
      .then((res) => setPost(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useSocket('newOpinionComment', (data) => {
    if (data.opinionId === id) {
      setPost((prev) => {
        if (!prev) return prev;
        if (prev.comments.some((c) => c.id === data.comment.id)) return prev;
        return { ...prev, comments: [...prev.comments, data.comment] };
      });
    }
  });

  const handleComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/opinions/${id}/comments`, { body: commentBody });
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

  if (loading) return <div className="loading">Loading opinion...</div>;
  if (!post) return <div className="empty-state"><h3>Opinion not found</h3></div>;

  return (
    <div className="detail-page">
      <Link to="/opinions" style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>← Back to opinions</Link>

      <h1 style={{ marginTop: 'var(--space-md)' }}>{post.title}</h1>
      <div className="detail-meta">
        <span>{post.author.displayName}</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>

      <div className="detail-body">
        <MarkdownRenderer content={post.body} />
      </div>

      <div className="detail-section">
        <h2>Comments ({post.comments.length})</h2>
        {post.comments.map((c) => (
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
              <MarkdownEditor
                value={commentBody}
                onChange={setCommentBody}
                placeholder="Write a comment in Markdown..."
                rows={4}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className="text-secondary" style={{ marginTop: 'var(--space-lg)' }}>
            <Link to="/login">Log in</Link> to comment.
          </p>
        )}
      </div>
    </div>
  );
}
