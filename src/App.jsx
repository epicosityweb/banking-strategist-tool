import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import MigrationPrompt from './components/MigrationPrompt';
import CorruptDataBanner from './components/ui/CorruptDataBanner';
import { needsMigration } from './utils/migrateToSupabase';

/**
 * Wrapper component that checks for migration needs after authentication
 */
function AppContent() {
  const { user } = useAuth();
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    // Only check for migration if user is authenticated
    if (user) {
      try {
        setShowMigration(needsMigration());
      } catch (error) {
        // Ignore errors - migration prompt won't show
        setShowMigration(false);
      }
    }
  }, [user]);

  const handleCloseMigration = () => {
    setShowMigration(false);
  };

  const handleMigrationSuccess = () => {
    setShowMigration(false);
    // Optionally reload the page to refresh projects
    window.location.reload();
  };

  return (
    <>
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

      {/* Corrupt Data Banner - Critical warning for data integrity (Issue #29) */}
      <CorruptDataBanner />

      {/* Migration Prompt - shows when localStorage projects detected */}
      {showMigration && (
        <MigrationPrompt onClose={handleCloseMigration} onSuccess={handleMigrationSuccess} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
