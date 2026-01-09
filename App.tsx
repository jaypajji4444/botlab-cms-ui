import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PageList } from './pages/pages/PageList';
import { PageEditor } from './pages/pages/PageEditor';
import { SectionList } from './pages/sections/SectionList';
import { SectionEditor } from './pages/sections/SectionEditor';
import { BlogList } from './pages/blogs/BlogList';
import { BlogEditor } from './pages/blogs/BlogEditor';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

// Guard Component to protect routes
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          <Route path="pages" element={<PageList />} />
          <Route path="pages/create" element={<PageEditor />} />
          <Route path="pages/edit/:id" element={<PageEditor />} />

          <Route path="blogs" element={<BlogList />} />
          <Route path="blogs/create" element={<BlogEditor />} />
          <Route path="blogs/edit/:id" element={<BlogEditor />} />
          
          <Route path="sections" element={<SectionList />} />
          <Route path="sections/create" element={<SectionEditor />} />
          <Route path="sections/edit/:id" element={<SectionEditor />} />
        </Route>
      </Route>
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;