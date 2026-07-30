import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CORE_NAV = [
  { path: '/reports', label: 'Reports' },
  { path: '/officials', label: 'Officials' },
  { path: '/dashboard', label: 'Dashboard' },
];

const COMMUNITY_NAV = [
  { path: '/forum', label: 'Public Forum' },
  { path: '/opinions', label: 'Public Opinions' },
  { path: '/knowledge', label: 'Knowledge Hub' },
  { path: '/evidence', label: 'Evidence Archive' },
];

const ALL_NAV = [
  ...CORE_NAV,
  ...COMMUNITY_NAV,
  { path: '/whistleblow', label: 'Anonymous Whistleblow' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const communityDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (communityDropdownRef.current && !communityDropdownRef.current.contains(event.target)) {
        setCommunityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCommunityActive = COMMUNITY_NAV.some((item) => location.pathname.startsWith(item.path));

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="nav-brand">Verisphere</Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            {CORE_NAV.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={location.pathname.startsWith(path) ? 'active' : ''}
                >
                  {label}
                </Link>
              </li>
            ))}

            {/* Community & Knowledge Dropdown */}
            <li className="more-dropdown-container" ref={communityDropdownRef} style={{ display: 'list-item' }}>
              <button
                type="button"
                className={`more-dropdown-btn ${isCommunityActive ? 'active' : ''}`}
                onClick={() => setCommunityDropdownOpen(!communityDropdownOpen)}
              >
                <span>Community</span>
                <svg className={`chevron-icon ${communityDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {communityDropdownOpen && (
                <div className="more-dropdown-menu" style={{ width: '190px' }}>
                  {COMMUNITY_NAV.map(({ path, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={location.pathname.startsWith(path) ? 'active' : ''}
                      onClick={() => setCommunityDropdownOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          </ul>

          {/* Right Action CTA & User Section */}
          <div className="nav-auth">
            <Link to="/whistleblow" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              🔒 Whistleblow
            </Link>

            {user ? (
              <div className="user-dropdown-container" ref={userDropdownRef}>
                <button
                  type="button"
                  className="user-dropdown-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <span>{user.displayName}</span>
                  {user.role === 'admin' && <span className="admin-tag">Admin</span>}
                  <svg className={`chevron-icon ${userDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserDropdownOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/whistleblow/mine" onClick={() => setUserDropdownOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      My Submissions
                    </Link>
                    <Link to="/whistleblow/track" onClick={() => setUserDropdownOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Track Submission
                    </Link>
                    <Link to="/reports/new" onClick={() => setUserDropdownOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16m8-8H4" />
                      </svg>
                      New Civic Report
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-logout-btn"
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline">Log in</Link>
                <Link to="/signup" className="btn btn-sm btn-primary">Sign up</Link>
              </>
            )}
          </div>

          {/* Hamburger Toggle */}
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

      {/* Mobile Drawer */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {ALL_NAV.map(({ path, label }) => (
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
            <div style={{ padding: '0.25rem 0', fontWeight: 600, color: 'var(--fg)', fontSize: '0.9rem' }}>
              {user.displayName} {user.role === 'admin' ? '(Admin)' : ''}
            </div>
            {user.role === 'admin' && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
            )}
            <Link to="/whistleblow/mine" onClick={() => setMobileOpen(false)}>My Submissions</Link>
            <Link to="/whistleblow/track" onClick={() => setMobileOpen(false)}>Track Submission</Link>
            <Link to="/reports/new" onClick={() => setMobileOpen(false)}>New Civic Report</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); setMobileOpen(false); }}>
              Log out
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
