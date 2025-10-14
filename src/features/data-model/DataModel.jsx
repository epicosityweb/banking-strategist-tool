import React, { useState } from 'react';
import { Plus, Database } from 'lucide-react';
import { useProject } from '../../context/ProjectContext-v2';
import Card from '../../components/ui/Card';
import ObjectCard from './components/ObjectCard';
import TemplateLibrary from './components/TemplateLibrary';
import ObjectModal from './components/ObjectModal';
import DeleteObjectModal from './components/DeleteObjectModal';
import ObjectDetailModal from './components/ObjectDetailModal';

function DataModel() {
  const { state, duplicateCustomObject } = useProject();
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const objects = state.dataModel?.objects || [];
  const associations = state.dataModel?.associations || [];

  const handleAddObject = () => {
    setShowTemplateLibrary(true);
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setSelectedObject(null);
    setShowObjectModal(true);
  };

  const handleEditObject = (object) => {
    setSelectedObject(object);
    setSelectedTemplate(null);
    setShowObjectModal(true);
  };

  const handleDuplicateObject = async (object) => {
    setIsLoading(true);
    setError(null);

    const { data, error: duplicateError } = await duplicateCustomObject(object.id);

    setIsLoading(false);

    if (duplicateError) {
      setError(`Failed to duplicate object: ${duplicateError}`);
      return;
    }

    // Success - object was duplicated (optimistic update already applied)
    console.log('Object duplicated successfully:', data.label);
  };

  const handleDeleteObject = (object) => {
    setSelectedObject(object);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (object) => {
    setSelectedObject(object);
    setShowDetailModal(true);
  };

  const handleCloseObjectModal = () => {
    setShowObjectModal(false);
    setSelectedObject(null);
    setSelectedTemplate(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedObject(null);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedObject(null);
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          Processing...
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Data Model Designer</h2>
          <p className="text-slate-600 mt-1">
            Define custom objects, fields, mappings, and associations
          </p>
        </div>
        <button
          onClick={handleAddObject}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Custom Object
        </button>
      </div>

      {/* Objects Grid or Empty State */}
      {objects.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {objects.length} custom object{objects.length !== 1 ? 's' : ''}
            </p>
            <div className="text-sm text-slate-500">
              {objects.reduce((sum, obj) => sum + (obj.fields?.length || 0), 0)} total fields
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objects.map((object) => (
              <ObjectCard
                key={object.id}
                object={object}
                associations={associations}
                onEdit={handleEditObject}
                onDuplicate={handleDuplicateObject}
                onDelete={handleDeleteObject}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Custom Objects Yet</h3>
            <p className="text-slate-600 mb-6">
              Start by adding a custom object from our template library or create one from scratch
            </p>
            <button
              onClick={handleAddObject}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Your First Object
            </button>
          </div>
        </Card>
      )}

      {/* Template Library Modal */}
      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onUseTemplate={handleUseTemplate}
      />

      {/* Object Modal */}
      <ObjectModal
        isOpen={showObjectModal}
        onClose={handleCloseObjectModal}
        object={selectedObject}
        template={selectedTemplate}
      />

      {/* Delete Modal */}
      <DeleteObjectModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        object={selectedObject}
      />

      {/* Object Detail Modal */}
      <ObjectDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        object={selectedObject}
      />
    </div>
  );
}

export default DataModel;
