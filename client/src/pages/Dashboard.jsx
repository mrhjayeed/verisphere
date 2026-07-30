import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../api/client';

const COLORS = ['#1E3A5F', '#2D6A4F', '#B8860B', '#8B1A1A', '#4A5568', '#6B7280', '#9CA3AF', '#D1D5DB'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!stats) return <div className="empty-state"><h3>Failed to load dashboard data</h3></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Transparency Dashboard</h1>
        <p>Live statistics computed from real civic data</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totals.reports}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totals.resolvedReports}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totals.pendingReports}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totals.officials}</div>
          <div className="stat-label">Officials Tracked</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="chart-card">
          <h3>Reports by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.reportsByCategory} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: 'var(--fg-secondary)' }}
                angle={-45}
                textAnchor="end"
                height={80}
                tickFormatter={(v) => v.replace(/_/g, ' ')}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--fg-secondary)' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: '0.8rem', border: '1px solid var(--border)' }}
                labelFormatter={(v) => v.replace(/_/g, ' ')}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Reports by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.reportsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ status, count }) => `${status.replace(/_/g, ' ')} (${count})`}
                labelLine={true}
              >
                {stats.reportsByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '0.8rem', border: '1px solid var(--border)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Officials by Number of Complaints</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.officialsByComplaints} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--fg-secondary)' }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: 'var(--fg)' }}
              width={110}
            />
            <Tooltip contentStyle={{ fontSize: '0.8rem', border: '1px solid var(--border)' }} />
            <Bar dataKey="complaints" fill="#8B1A1A" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {stats.reportsOverTime?.length > 0 && (
        <div className="chart-card">
          <h3>Reports Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.reportsOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--fg-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--fg-secondary)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: '0.8rem', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
