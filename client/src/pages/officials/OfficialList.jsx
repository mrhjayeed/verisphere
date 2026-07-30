import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function OfficialList() {
  const [officials, setOfficials] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = search ? { search } : {};
    api.get('/officials', { params })
      .then((res) => setOfficials(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  if (loading) return <div className="loading">Loading officials...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Public Officials</h1>
        <p>Track the promises, controversies, and complaints of public officials</p>
      </div>

      <div style={{ marginBottom: 'var(--space-xl)', maxWidth: '400px' }}>
        <div className="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, position, or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {officials.length === 0 ? (
        <div className="empty-state"><h3>No officials found</h3></div>
      ) : (
        <div className="grid-3">
          {officials.map((o) => (
            <Link key={o.id} to={`/officials/${o.id}`} className="card card-link">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                {o.photoPath ? (
                  <img src={o.photoPath} alt={o.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="official-photo-placeholder" style={{ width: 48, height: 48, fontSize: '1.25rem' }}>
                    {o.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 style={{ marginBottom: 0, fontSize: '1rem' }}>{o.name}</h3>
                  <p className="text-sm text-secondary" style={{ marginBottom: 0 }}>{o.position}</p>
                </div>
              </div>
              <p className="text-sm text-secondary" style={{ marginBottom: '0.5rem' }}>{o.institution}</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--fg-secondary)' }}>
                <span>{o._count.promises} promises</span>
                <span>{o._count.controversies} controversies</span>
                <span>{o._count.complaints} complaints</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
