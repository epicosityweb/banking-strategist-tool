import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, Save, Clock, LogOut, User } from 'lucide-react';
import { useProject } from '../../context/ProjectContext-v2';
import { useAuth } from '../../context/AuthContext';

function Header() {
  const { state, saveProject } = useProject();
  const { user, signOut } = useAuth();
  const { projectId } = useParams();

  const handleSave = async () => {
    await saveProject();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const currentProjectData = state.projects.find(p => p.id === projectId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Banking Journey Strategist
              </h1>
              {currentProjectData && (
                <p className="text-sm text-slate-600">
                  {currentProjectData.clientProfile?.basicInfo?.institutionName || 'Untitled Project'}
                </p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Save button and timestamp (shown when project is open) */}
            {projectId && (
              <>
                {state.savedAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      Saved {new Date(state.savedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </>
            )}

            {/* User Account Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
