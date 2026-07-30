import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReportList from './pages/reports/ReportList';
import ReportDetail from './pages/reports/ReportDetail';
import ReportNew from './pages/reports/ReportNew';
import OfficialList from './pages/officials/OfficialList';
import OfficialDetail from './pages/officials/OfficialDetail';
import Dashboard from './pages/Dashboard';
import ForumList from './pages/forum/ForumList';
import ForumThread from './pages/forum/ForumThread';
import EvidenceArchive from './pages/evidence/EvidenceArchive';
import KnowledgeList from './pages/knowledge/KnowledgeList';
import KnowledgeArticle from './pages/knowledge/KnowledgeArticle';
import OpinionList from './pages/opinions/OpinionList';
import OpinionDetail from './pages/opinions/OpinionDetail';
import WhistleblowForm from './pages/whistleblow/WhistleblowForm';
import MySubmissions from './pages/whistleblow/MySubmissions';
import AdminPanel from './pages/admin/AdminPanel';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Civic Reports */}
            <Route path="/reports" element={<ReportList />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/reports/new" element={<ReportNew />} />

            {/* Officials */}
            <Route path="/officials" element={<OfficialList />} />
            <Route path="/officials/:id" element={<OfficialDetail />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Forum */}
            <Route path="/forum" element={<ForumList />} />
            <Route path="/forum/:id" element={<ForumThread />} />

            {/* Evidence */}
            <Route path="/evidence" element={<EvidenceArchive />} />

            {/* Knowledge Hub */}
            <Route path="/knowledge" element={<KnowledgeList />} />
            <Route path="/knowledge/:id" element={<KnowledgeArticle />} />

            {/* Public Opinion */}
            <Route path="/opinions" element={<OpinionList />} />
            <Route path="/opinions/:id" element={<OpinionDetail />} />

            {/* Whistleblowing */}
            <Route path="/whistleblow" element={<WhistleblowForm />} />
            <Route path="/whistleblow/mine" element={
              <ProtectedRoute><MySubmissions /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
