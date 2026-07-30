import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/reports', label: 'Reports' },
  { path: '/officials', label: 'Officials' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/forum', label: 'Forum' },
  { path: '/evidence', label: 'Evidence' },
  { path: '/knowledge', label: 'Knowledge' },
  { path: '/opinions', label: 'Opinions' },
  { path: '/whistleblow', label: 'Whistleblow' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="nav-brand">Verisphere</Link>

          <ul className="nav-links">
            {NAV_ITEMS.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={location.pathname.startsWith(path) ? 'active' : ''}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-auth">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="btn btn-sm btn-outline">Admin</Link>
                )}
                <span className="text-sm text-secondary">{user.displayName}</span>
                <button onClick={logout} className="btn btn-sm btn-outline">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline">Log in</Link>
                <Link to="/signup" className="btn btn-sm btn-primary">Sign up</Link>
              </>
            )}
          </div>

          <button
            className="hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {NAV_ITEMS.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </Link>
        ))}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); setMobileOpen(false); }}>
              Log out ({user.displayName})
            </a>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign up</Link>
          </>
        )}
      </div>
    </>
  );
}
