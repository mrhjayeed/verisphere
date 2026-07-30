import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

const FEATURES = [
  {
    title: 'Civic Reporting',
    description: 'Report corruption, abuse of authority, environmental violations, and other civic issues with evidence.',
    path: '/reports',
  },
  {
    title: 'Official Profiles',
    description: 'Track public officials — their promises, controversies, and complaints filed against them.',
    path: '/officials',
  },
  {
    title: 'Transparency Dashboard',
    description: 'Live charts and statistics computed from real civic data. See the big picture at a glance.',
    path: '/dashboard',
  },
  {
    title: 'Community Forum',
    description: 'Discuss civic issues, share strategies, and organize with fellow citizens.',
    path: '/forum',
  },
  {
    title: 'Evidence Archive',
    description: 'Upload and browse documented evidence — photos, documents, and reports that support civic accountability.',
    path: '/evidence',
  },
  {
    title: 'Civic Knowledge Hub',
    description: 'Learn your rights. Browse articles on legal procedures, filing complaints, and civic engagement.',
    path: '/knowledge',
  },
  {
    title: 'Public Opinion',
    description: 'Publish opinion pieces on civic matters and engage with community perspectives.',
    path: '/opinions',
  },
  {
    title: 'Anonymous Whistleblowing',
    description: 'Submit sensitive information anonymously. No identifying data stored if you choose full anonymity.',
    path: '/whistleblow',
  },
];

const STEPS = [
  {
    num: '1',
    title: 'Document & Report',
    desc: 'Submit civic grievances with supporting evidence photos/documents, or leak sensitive corruption data via encrypted whistleblowing.',
  },
  {
    num: '2',
    title: 'Investigate & Track',
    desc: 'Join community discussions, audit official pledges on public scorecards, and review uploaded civic evidence.',
  },
  {
    num: '3',
    title: 'Drive Resolution',
    desc: 'Force institutional responsiveness, municipal repairs, and legal accountability through public visibility.',
  },
];

export default function Home() {
  const [stats, setStats] = useState({ reports: 0, officials: 0, evidence: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [featuredOfficials, setFeaturedOfficials] = useState([]);

  useEffect(() => {
    // Fetch live reports
    api.get('/reports?limit=3')
      .then((res) => {
        setRecentReports(res.data.reports || []);
        setStats((prev) => ({ ...prev, reports: res.data.total || (res.data.reports || []).length }));
      })
      .catch(console.error);

    // Fetch officials
    api.get('/officials')
      .then((res) => {
        setFeaturedOfficials((res.data || []).slice(0, 3));
        setStats((prev) => ({ ...prev, officials: (res.data || []).length }));
      })
      .catch(console.error);

    // Fetch evidence count
    api.get('/evidence')
      .then((res) => {
        setStats((prev) => ({ ...prev, evidence: (res.data || []).length }));
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero" style={{ paddingBottom: 'var(--space-2xl)' }}>
        <h1 style={{ marginBottom: '1rem' }}>
          Civic accountability,<br />by the people
        </h1>
        <p style={{ maxWidth: '640px', margin: '0 auto 1.5rem auto' }}>
          Verisphere is an open-source platform where citizens report injustice,
          track public officials, archive evidence, and organize for transparency.
          Every voice counts. Every report matters.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/reports" className="btn btn-primary">Browse Reports</Link>
          <Link to="/whistleblow" className="btn btn-outline">Whistleblow Anonymously</Link>
          <Link to="/signup" className="btn btn-outline">Join the Community</Link>
        </div>
      </div>

      {/* Live Impact Stats Counter */}
      <div className="stats-row" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="stat-card card">
          <div className="stat-value">{stats.reports}</div>
          <div className="stat-label">Civic Reports Filed</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{stats.officials}</div>
          <div className="stat-label">Public Officials Tracked</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{stats.evidence}</div>
          <div className="stat-label">Verified Evidence Files</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">100%</div>
          <div className="stat-label">Encrypted Whistleblowing</div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="detail-section" style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>How Verisphere Works</h2>
        <div className="grid-3">
          {STEPS.map((s) => (
            <div key={s.num} className="card" style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-md)' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-alt)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1.25rem', margin: '0 auto var(--space-md) auto', color: 'var(--accent)'
              }}>
                {s.num}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p className="text-sm text-secondary" style={{ marginBottom: 0, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Civic Activity */}
      {recentReports.length > 0 && (
        <div className="detail-section" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2>Recent Civic Reports</h2>
            <Link to="/reports" className="text-sm" style={{ fontWeight: 500 }}>View all reports →</Link>
          </div>
          <div className="grid-3">
            {recentReports.map((r) => (
              <Link key={r.id} to={`/reports/${r.id}`} className="card card-link">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge badge-category">{r.category.replace(/_/g, ' ')}</span>
                  <StatusBadge status={r.status} />
                </div>
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)', marginBottom: '0.5rem' }}>{r.title}</h3>
                <p className="text-xs text-secondary" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {r.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tracked Officials Scorecard Preview */}
      {featuredOfficials.length > 0 && (
        <div className="detail-section" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2>Tracked Public Officials</h2>
            <Link to="/officials" className="text-sm" style={{ fontWeight: 500 }}>Explore all officials →</Link>
          </div>
          <div className="grid-3">
            {featuredOfficials.map((o) => (
              <Link key={o.id} to={`/officials/${o.id}`} className="card card-link">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {o.photoPath ? (
                    <img src={o.photoPath} alt={o.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-alt)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      {o.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-sans)', marginBottom: '0.1rem' }}>{o.name}</h3>
                    <p className="text-xs text-secondary" style={{ marginBottom: 0 }}>{o.position}</p>
                  </div>
                </div>
                <div className="card-meta">
                  <span>{o.institution}</span>
                  <span>{o._count?.promises || 0} promises</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Platform Features */}
      <div className="detail-section">
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>Platform Capabilities</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <Link key={f.path} to={f.path} className="feature-card card-link">
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
