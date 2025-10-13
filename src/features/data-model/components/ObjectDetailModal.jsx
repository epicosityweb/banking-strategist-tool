import React, { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import FieldTable from './FieldTable';
import FieldModal from './FieldModal';
import { useProject } from '../../../context/ProjectContext';

function ObjectDetailModal({ isOpen, onClose, object }) {
  const { dispatch } = useProject();
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  if (!isOpen || !object) return null;

  const Icon = Icons[object.icon] || Icons.Database;
  const fields = object.fields || [];

  const handleAddField = () => {
    setSelectedField(null);
    setShowFieldModal(true);
  };

  const handleEditField = (field) => {
    setSelectedField(field);
    setShowFieldModal(true);
  };

  const handleDeleteField = (field) => {
    if (window.confirm(`Are you sure you want to delete the field "${field.label}"?`)) {
      dispatch({
        type: 'DELETE_FIELD',
        payload: {
          objectId: object.id,
          fieldId: field.id,
        },
      });
    }
  };

  const handleSaveField = (fieldData) => {
    if (selectedField) {
      // Update existing field
      dispatch({
        type: 'UPDATE_FIELD',
        payload: {
          objectId: object.id,
          field: fieldData,
        },
      });
    } else {
      // Add new field
      dispatch({
        type: 'ADD_FIELD',
        payload: {
          objectId: object.id,
          field: fieldData,
        },
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{object.label}</h2>
                  <p className="text-sm text-slate-500 font-mono">{object.apiName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Description */}
            {object.description && (
              <p className="mt-4 text-slate-600">{object.description}</p>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Fields</h3>
              <button
                onClick={() => dispatch({ type: 'UPDATE_OBJECT', payload: { ...object } })}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                title="Edit object properties"
              >
                <Edit2 className="w-4 h-4" />
                Edit Object
              </button>
            </div>

            <FieldTable
              fields={fields}
              onAddField={handleAddField}
              onEditField={handleEditField}
              onDeleteField={handleDeleteField}
            />

            {/* Object Metadata */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Object Information</h4>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500">Internal Name</dt>
                  <dd className="font-mono text-slate-900 mt-1">{object.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total Fields</dt>
                  <dd className="text-slate-900 mt-1">{fields.length}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Created</dt>
                  <dd className="text-slate-900 mt-1">
                    {object.createdAt ? new Date(object.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Last Modified</dt>
                  <dd className="text-slate-900 mt-1">
                    {object.updatedAt ? new Date(object.updatedAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Field Modal */}
      <FieldModal
        isOpen={showFieldModal}
        onClose={() => {
          setShowFieldModal(false);
          setSelectedField(null);
        }}
        onSave={handleSaveField}
        field={selectedField}
        existingFields={fields}
      />
    </>
  );
}

export default ObjectDetailModal;
