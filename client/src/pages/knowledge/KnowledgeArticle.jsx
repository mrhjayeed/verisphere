import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownRenderer from '../../components/MarkdownRenderer';

export default function KnowledgeArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/knowledge/${id}`)
      .then((res) => setArticle(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading article...</div>;
  if (!article) return <div className="empty-state"><h3>Article not found</h3></div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="detail-page">
      <Link to="/knowledge" style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>← Back to Knowledge Hub</Link>

      <h1 style={{ marginTop: 'var(--space-md)' }}>{article.title}</h1>
      <div className="detail-meta">
        <span className="badge badge-category">{article.category.replace(/_/g, ' ')}</span>
        <span>{article.author.displayName}</span>
        <span>{formatDate(article.createdAt)}</span>
      </div>

      <div className="detail-body">
        <MarkdownRenderer content={article.content} />
      </div>
    </div>
  );
}
