import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext-v2';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout';
import Dashboard from './features/project-management/Dashboard';
import ClientProfile from './features/client-profile/ClientProfile';
import DataModel from './features/data-model/DataModel';
import TagLibrary from './features/tag-library/TagLibrary';
import JourneySimulator from './features/journey-simulator/JourneySimulator';
import Exporter from './features/exporter/Exporter';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="project/:projectId">
                <Route path="client-profile" element={<ClientProfile />} />
                <Route path="data-model" element={<DataModel />} />
                <Route path="tags" element={<TagLibrary />} />
                <Route path="simulator" element={<JourneySimulator />} />
                <Route path="export" element={<Exporter />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
