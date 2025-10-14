import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext-v2';
import Layout from './components/layout/Layout';
import Dashboard from './features/project-management/Dashboard';
import ClientProfile from './features/client-profile/ClientProfile';
import DataModel from './features/data-model/DataModel';
import TagDesigner from './features/tag-designer/TagDesigner';
import JourneySimulator from './features/journey-simulator/JourneySimulator';
import Exporter from './features/exporter/Exporter';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="project/:projectId">
              <Route path="client-profile" element={<ClientProfile />} />
              <Route path="data-model" element={<DataModel />} />
              <Route path="tags" element={<TagDesigner />} />
              <Route path="simulator" element={<JourneySimulator />} />
              <Route path="export" element={<Exporter />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ProjectProvider>
  );
}

export default App;
