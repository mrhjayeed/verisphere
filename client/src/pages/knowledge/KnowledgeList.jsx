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
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = {};
    if (filter !== 'all') params.category = filter;
    if (search.trim()) params.search = search.trim();
    api.get('/knowledge', { params })
      .then((res) => setArticles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, search]);

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

      <div className="toolbar" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="filter-group">
          {CATEGORIES.map((c) => (
            <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c === 'all' ? 'All' : c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="search-input" style={{ width: '250px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
