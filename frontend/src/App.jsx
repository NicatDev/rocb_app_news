import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login/index';
import Register from './pages/auth/Register/index';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import News from './pages/News';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import { Layout } from 'antd';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

import RTCDashboard from './pages/RTCDashboard';
import RTCDetail from './pages/RTCDetail';
import NewsDetail from './pages/NewsDetail';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminNews from './pages/admin/News';
import AdminEvents from './pages/admin/Events';
import AdminResources from './pages/admin/Resources';
import AdminProjects from './pages/admin/Projects';
import AdminGallery from './pages/admin/Gallery';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Layout wraps both public and protected routes */}
        <Route element={<MainLayout />}>
          {/* Public Route - Default */}
          <Route path="/" element={<News />} />
          <Route path="/news" element={<News />} />  {/* Alias */}
          <Route path="/news/:id" element={<NewsDetail />} />

          {/* Login required: Feed + /admin (rtc_admin) only */}
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rtc-dashboard" element={<RTCDashboard />} />
          <Route path="/rtc-dashboard/:id" element={<RTCDetail />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="gallery" element={<AdminGallery />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
