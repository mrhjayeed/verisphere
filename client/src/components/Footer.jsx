import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Mission */}
          <div className="footer-col-brand">
            <h3>Verisphere</h3>
            <p className="footer-tagline">
              An open-source civic accountability and transparency platform empowering citizens to report injustice, audit public official commitments, archive evidence, and safeguard democratic rights.
            </p>
            <div className="footer-badge-list">
              <span className="badge badge-category">MIT License</span>
              <span className="badge badge-category">Digital Public Infrastructure</span>
            </div>
          </div>

          {/* Core Modules */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              <li><Link to="/reports">Civic Reports</Link></li>
              <li><Link to="/officials">Public Officials</Link></li>
              <li><Link to="/dashboard">Transparency Dashboard</Link></li>
              <li><Link to="/evidence">Evidence Archive</Link></li>
              <li><Link to="/whistleblow">Whistleblower Portal</Link></li>
            </ul>
          </div>

          {/* Community & Knowledge */}
          <div className="footer-col">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><Link to="/knowledge">Civic Knowledge Hub</Link></li>
              <li><Link to="/forum">Community Forum</Link></li>
              <li><Link to="/opinions">Public Opinions</Link></li>
              <li><Link to="/whistleblow/track">Track Submission</Link></li>
            </ul>
          </div>

          {/* Open Source & Governance */}
          <div className="footer-col">
            <h4>Open Source</h4>
            <ul className="footer-links">
              <li>
                <a href="https://github.com/mrhjayeed/verisphere" target="_blank" rel="noopener noreferrer">
                  GitHub Repository ↗
                </a>
              </li>
              <li><Link to="/knowledge">Legal & Rights Guides</Link></li>
              <li><Link to="/whistleblow">Privacy Safeguards</Link></li>
              <li><Link to="/login">System Sign In</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Verisphere. Released under the open-source MIT License.</span>
          <div className="footer-status">
            <span className="status-dot"></span>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
