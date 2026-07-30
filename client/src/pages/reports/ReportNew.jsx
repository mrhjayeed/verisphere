import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import MarkdownEditor from '../../components/MarkdownEditor';
import FileUpload from '../../components/FileUpload';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'corruption', 'abuse_of_authority', 'human_rights', 'environment',
  'public_service', 'misuse_of_resources', 'infrastructure', 'election',
];

export default function ReportNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
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
      if (location) formData.append('location', location);
      if (incidentDate) formData.append('incidentDate', incidentDate);
      formData.append('anonymous', anonymous.toString());
      files.forEach((f) => formData.append('files', f));

      const res = await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate(`/reports/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1>Submit a Civic Report</h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
        Document a civic issue with as much detail as possible. Reports are public and help build accountability.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="report-title">Title</label>
          <input
            id="report-title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="report-category">Category</label>
          <select
            id="report-category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description (Markdown supported)</label>
          <MarkdownEditor value={description} onChange={setDescription} placeholder="Describe the issue in detail..." />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="report-location">Location</label>
            <input
              id="report-location"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Dhaka, Bangladesh"
            />
          </div>
          <div className="form-group">
            <label htmlFor="report-date">Incident Date</label>
            <input
              id="report-date"
              className="form-input"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Evidence Files</label>
          <FileUpload files={files} onChange={setFiles} />
        </div>

        {user && (
          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              Submit anonymously (your identity will not be linked to this report)
            </label>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
