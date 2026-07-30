import { Link } from 'react-router-dom';

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

export default function Home() {
  return (
    <div>
      <div className="hero">
        <h1>Civic accountability,<br />by the people</h1>
        <p>
          Verisphere is an open-source platform where citizens report injustice,
          track public officials, archive evidence, and organize for transparency.
          Every voice counts. Every report matters.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/reports" className="btn btn-primary">Browse Reports</Link>
          <Link to="/signup" className="btn btn-outline">Join the Community</Link>
        </div>
      </div>

      <div className="feature-grid">
        {FEATURES.map((f) => (
          <Link key={f.path} to={f.path} className="feature-card card-link">
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
