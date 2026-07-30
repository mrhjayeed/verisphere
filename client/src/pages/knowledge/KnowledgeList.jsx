import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client';

const CATEGORIES = ['all', 'legal_rights', 'governance', 'civic_engagement', 'environment', 'education'];

export default function KnowledgeList() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialCategory);

  useEffect(() => {
    const params = filter !== 'all' ? { category: filter } : {};
    api.get('/knowledge', { params })
      .then((res) => setArticles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  if (loading) return <div className="loading">Loading articles...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Civic Knowledge Hub</h1>
        <p>Learn your rights and understand civic processes</p>
      </div>

      <div className="filter-group" style={{ marginBottom: 'var(--space-xl)' }}>
        {CATEGORIES.map((c) => (
          <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'all' ? 'All' : c.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="empty-state"><h3>No articles found</h3></div>
      ) : (
        <div className="list-stack">
          {articles.map((a) => (
            <Link key={a.id} to={`/knowledge/${a.id}`} className="card card-link">
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', marginBottom: '0.25rem' }}>{a.title}</h3>
              <div className="card-meta">
                <span className="badge badge-category">{a.category.replace(/_/g, ' ')}</span>
                <span>{a.author.displayName}</span>
                <span>{formatDate(a.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
