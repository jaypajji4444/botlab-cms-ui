import React from "react";
import { Toaster } from "react-hot-toast";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BlogEditor } from "./pages/blogs/BlogEditor";
import { BlogList } from "./pages/blogs/BlogList";
import { JobEditor } from "./pages/careers/JobEditor";
import { JobList } from "./pages/careers/JobList";
import { CaseStudyEditor } from "./pages/caseStudies/CaseStudyEditor";
import { CaseStudyList } from "./pages/caseStudies/CaseStudyList";
import { ContactList } from "./pages/contacts/ContactList";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { PageEditor } from "./pages/pages/PageEditor";
import { PageList } from "./pages/pages/PageList";
import { PortfolioEditor } from "./pages/portfolio/PortfolioEditor";
import { PortfolioList } from "./pages/portfolio/PortfolioList";
import { ReportEditor } from "./pages/reports/ReportEditor";
import { ReportList } from "./pages/reports/ReportList";
import { SectionEditor } from "./pages/sections/SectionEditor";
import { SectionList } from "./pages/sections/SectionList";

// Guard Component to protect routes
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        Loading...
      </div>
    );
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

          <Route path="portfolios" element={<PortfolioList />} />
          <Route path="portfolios/create" element={<PortfolioEditor />} />
          <Route path="portfolios/edit/:id" element={<PortfolioEditor />} />

          <Route path="reports" element={<ReportList />} />
          <Route path="reports/create" element={<ReportEditor />} />
          <Route path="reports/edit/:id" element={<ReportEditor />} />

          <Route path="careers" element={<JobList />} />
          <Route path="careers/create" element={<JobEditor />} />
          <Route path="careers/edit/:id" element={<JobEditor />} />

          <Route path="case-studies" element={<CaseStudyList />} />
          <Route path="case-studies/create" element={<CaseStudyEditor />} />
          <Route path="case-studies/edit/:id" element={<CaseStudyEditor />} />

          <Route path="contacts" element={<ContactList />} />
        </Route>
      </Route>
    </Routes>
  );
};

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
