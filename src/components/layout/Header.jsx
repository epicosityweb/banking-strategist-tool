import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, Save, Clock, Upload } from 'lucide-react';
import { useProject } from '../../context/ProjectContext-v2';
import MigrationModal from '../migration/MigrationModal';

function Header() {
  const { state, saveProject } = useProject();
  const { projectId } = useParams();
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  const handleSave = async () => {
    await saveProject();
  };

  const handleMigrationComplete = (results) => {
    console.log('Migration complete:', results);
    // You could show a success toast here
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
            {/* Migration Button (shown on dashboard) */}
            {!projectId && (
              <button
                onClick={() => setShowMigrationModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Migrate to Cloud</span>
              </button>
            )}

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
          </div>
        </div>
      </div>

      {/* Migration Modal */}
      <MigrationModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        onComplete={handleMigrationComplete}
      />
    </header>
  );
}

export default Header;
