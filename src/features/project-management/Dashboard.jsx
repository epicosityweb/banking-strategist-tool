import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Trash2, Calendar } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import Card from '../../components/ui/Card';

function Dashboard() {
  const { state, dispatch } = useProject();
  const navigate = useNavigate();
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    const newProject = {
      id: `project-${Date.now()}`,
      clientProfile: {
        basicInfo: {
          institutionName: projectName,
        },
        integrationSpecs: {},
      },
      dataModel: {
        objects: [],
        fields: [],
        mappings: [],
        associations: [],
      },
      tags: {
        library: [],
        custom: [],
      },
      journeys: [],
      createdAt: new Date().toISOString(),
      savedAt: new Date().toISOString(),
    };

    dispatch({ type: 'CREATE_PROJECT', payload: newProject });
    navigate(`/project/${newProject.id}/client-profile`);
  };

  const handleOpenProject = (projectId) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      dispatch({ type: 'LOAD_PROJECT', payload: project });
      navigate(`/project/${projectId}/client-profile`);
    }
  };

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = state.projects.filter(p => p.id !== projectId);
      localStorage.setItem('strategist-projects', JSON.stringify(updatedProjects));
      dispatch({ type: 'LOAD_PROJECTS', payload: updatedProjects });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Client Implementations</h2>
          <p className="text-slate-600 mt-1">
            Manage and configure banking journey implementations
          </p>
        </div>

        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {showNewProject && (
        <Card className="border-primary-200 bg-primary-50">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Create New Project</h3>
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 mb-1">
                Financial Institution Name
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., First Community Credit Union"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Project
              </button>
              <button
                onClick={() => {
                  setShowNewProject(false);
                  setProjectName('');
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {state.projects.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first client implementation project to get started
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleOpenProject(project.id)}
              className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {project.clientProfile?.basicInfo?.institutionName || 'Untitled Project'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {project.clientProfile?.basicInfo?.fiType || 'Type not set'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-2 text-slate-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {project.savedAt && (
                    <div className="text-xs text-slate-500">
                      Last saved {new Date(project.savedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-primary-600">
                      {calculateProgress(project)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 transition-all"
                      style={{ width: `${calculateProgress(project)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function calculateProgress(project) {
  let completed = 0;
  let total = 5;

  // Check client profile
  if (project.clientProfile?.basicInfo?.institutionName) completed++;

  // Check data model
  if (project.dataModel?.objects?.length > 0) completed++;

  // Check field mappings
  if (project.dataModel?.mappings?.length > 0) completed++;

  // Check tags
  if (project.tags?.custom?.length > 0 || project.tags?.library?.length > 0) completed++;

  // Check journeys
  if (project.journeys?.length > 0) completed++;

  return Math.round((completed / total) * 100);
}

export default Dashboard;
