import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import MarkdownEditor from '../../components/MarkdownEditor';
import FileUpload from '../../components/FileUpload';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['corruption', 'fraud', 'abuse_of_power', 'environmental', 'financial', 'safety', 'other'];

export default function WhistleblowForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [files, setFiles] = useState([]);
  const [createdCode, setCreatedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('anonymous', anonymous.toString());
      files.forEach((f) => formData.append('files', f));

      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.trackingCode) {
        setCreatedCode(res.data.trackingCode);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (success) {
    return (
      <div style={{ maxWidth: '580px' }}>
        <div className="alert alert-success">
          <strong>Submission received.</strong> Your report has been securely recorded.
          {anonymous ? ' No identifying information was stored.' : ''}
        </div>

        {createdCode && (
          <div className="card" style={{ marginBottom: 'var(--space-lg)', background: 'var(--bg-alt)', textAlign: 'center' }}>
            <p className="text-sm text-secondary" style={{ marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Secret Tracking Code
            </p>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em', color: 'var(--accent)', margin: '0.5rem 0' }}>
              {createdCode}
            </div>
            <p className="text-xs text-secondary" style={{ marginBottom: '1rem' }}>
              Save this code! You can use it to track your investigation status anytime without logging in.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-outline" onClick={handleCopyCode}>
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Tracking Code'}
              </button>
              <Link to={`/whistleblow/track?code=${createdCode}`} className="btn btn-sm btn-primary">
                Track Status Now →
              </Link>
            </div>
          </div>
        )}

        <p>Thank you for your courage. Your submission will be reviewed by our team.</p>
        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => { setSuccess(false); setTitle(''); setDescription(''); setCategory(''); setFiles([]); setCreatedCode(''); }}>
            Submit Another
          </button>
          {user && !anonymous && (
            <Link to="/whistleblow/mine" className="btn btn-outline">View My Submissions</Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <h1 style={{ marginBottom: 0 }}>Anonymous Whistleblowing</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/whistleblow/track" className="btn btn-sm btn-outline">
              Track by Code
            </Link>
            {user && (
              <Link to="/whistleblow/mine" className="btn btn-sm btn-outline">
                My Submissions →
              </Link>
            )}
          </div>
        </div>
        <p className="text-secondary" style={{ marginBottom: 0 }}>
          Submit sensitive information securely. When "submit anonymously" is checked, no identifying information is stored with your submission.
        </p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 'var(--space-xl)' }}>
        <strong>Privacy notice:</strong> Anonymous submissions store no user ID, IP address, or session data. Your submission cannot be traced back to you.
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description" required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Description (Markdown supported)</label>
          <MarkdownEditor value={description} onChange={setDescription} placeholder="Provide as much detail as possible..." />
        </div>

        <div className="form-group">
          <label>Supporting Evidence (Optional)</label>
          <FileUpload files={files} onChange={setFiles} />
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Submit anonymously — no identifying information will be stored
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
