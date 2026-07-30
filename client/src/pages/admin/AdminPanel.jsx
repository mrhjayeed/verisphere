import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import MarkdownEditor from '../../components/MarkdownEditor';
import { useSocket } from '../../hooks/useSocket';

export default function AdminPanel() {
  const [tab, setTab] = useState('submissions');

  return (
    <div>
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage officials, articles, and review submissions</p>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'submissions' ? 'active' : ''}`} onClick={() => setTab('submissions')}>Submissions</button>
        <button className={`admin-tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>Reports</button>
        <button className={`admin-tab ${tab === 'officials' ? 'active' : ''}`} onClick={() => setTab('officials')}>Officials</button>
        <button className={`admin-tab ${tab === 'articles' ? 'active' : ''}`} onClick={() => setTab('articles')}>Articles</button>
      </div>

      {tab === 'submissions' && <SubmissionsTab />}
      {tab === 'reports' && <ReportsTab />}
      {tab === 'officials' && <OfficialsTab />}
      {tab === 'articles' && <ArticlesTab />}
    </div>
  );
}

function SubmissionsTab() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions')
      .then((res) => setSubmissions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useSocket('newSubmission', (newSub) => {
    setSubmissions((prev) => [newSub, ...prev.filter(s => s.id !== newSub.id)]);
  });

  useSocket('submissionStatusUpdated', (updated) => {
    setSubmissions((prev) => prev.map((s) => s.id === updated.id ? { ...s, status: updated.status } : s));
  });

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/submissions/${id}/status`, { status });
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Submitter</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.category.replace(/_/g, ' ')}</td>
              <td>{s.submitter?.displayName || <em>Anonymous</em>}</td>
              <td><StatusBadge status={s.status} /></td>
              <td className="text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
              <td>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                  value={s.status}
                  onChange={(e) => updateStatus(s.id, e.target.value)}
                >
                  <option value="received">Received</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then((res) => setReports(res.data.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useSocket('newReport', (newReport) => {
    setReports((prev) => [newReport, ...prev.filter(r => r.id !== newReport.id)]);
  });

  useSocket('reportStatusUpdated', (updated) => {
    setReports((prev) => prev.map((r) => r.id === updated.id ? { ...r, status: updated.status } : r));
  });

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/reports/${id}/status`, { status });
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Author</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.category.replace(/_/g, ' ')}</td>
              <td>{r.author?.displayName || <em>Anonymous</em>}</td>
              <td><StatusBadge status={r.status} /></td>
              <td className="text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                >
                  <option value="received">Received</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OfficialsTab() {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', position: '', institution: '', bio: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/officials')
      .then((res) => setOfficials(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStartEdit = (o) => {
    setEditingId(o.id);
    setForm({ name: o.name, position: o.position, institution: o.institution, bio: o.bio || '' });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', position: '', institution: '', bio: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/officials/${editingId}`, form);
        setOfficials((prev) => prev.map((o) => o.id === editingId ? { ...o, ...res.data } : o));
      } else {
        const res = await api.post('/officials', form);
        setOfficials((prev) => [...prev, res.data]);
      }
      handleCancelForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save official profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button className="btn btn-outline" onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ Add Official'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3>{editingId ? 'Edit Official Profile' : 'New Official Profile'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input className="form-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Institution</label>
              <input className="form-input" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Bio (Markdown)</label>
              <MarkdownEditor value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Official' : 'Create Official'}
            </button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Institution</th>
              <th>Complaints</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {officials.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link to={`/officials/${o.id}`} style={{ fontWeight: 600 }}>
                    {o.name}
                  </Link>
                </td>
                <td>{o.position}</td>
                <td>{o.institution}</td>
                <td>{o._count?.complaints || 0}</td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => handleStartEdit(o)}>
                    Edit
                  </button>
                  <Link to={`/officials/${o.id}`} className="btn btn-sm btn-outline">
                    Manage Profile & Promises →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArticlesTab() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/knowledge')
      .then((res) => setArticles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStartEdit = (article) => {
    setEditingId(article.id);
    setForm({ title: article.title, category: article.category, content: article.content });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: '', category: '', content: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/knowledge/${editingId}`, form);
        setArticles((prev) => prev.map((a) => a.id === editingId ? res.data : a));
      } else {
        const res = await api.post('/knowledge', form);
        setArticles((prev) => [res.data, ...prev]);
      }
      handleCancelForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await api.delete(`/knowledge/${id}`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button className="btn btn-outline" onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ Add Article'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3>{editingId ? 'Edit Article' : 'New Article'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Title</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select</option>
                  <option value="legal_rights">Legal Rights</option>
                  <option value="governance">Governance</option>
                  <option value="civic_engagement">Civic Engagement</option>
                  <option value="environment">Environment</option>
                  <option value="education">Education</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Content (Markdown)</label>
              <MarkdownEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
            </button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link to={`/knowledge/${a.id}`} style={{ fontWeight: 600 }}>
                    {a.title}
                  </Link>
                </td>
                <td>{a.category.replace(/_/g, ' ')}</td>
                <td>{a.author?.displayName || 'Admin'}</td>
                <td className="text-sm">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => handleStartEdit(a)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
