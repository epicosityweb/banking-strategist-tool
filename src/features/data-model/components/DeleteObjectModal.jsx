import React, { useMemo } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useProject } from '../../../context/ProjectContext';
import { checkObjectDependencies } from '../../../utils/dependencyChecker';

function DeleteObjectModal({ isOpen, onClose, object }) {
  const { state, dispatch } = useProject();

  const dependencies = useMemo(() => {
    if (!object) return null;
    return checkObjectDependencies(object.id, state);
  }, [object, state]);

  if (!isOpen || !object) return null;

  const handleDelete = (cascade = false) => {
    dispatch({
      type: 'DELETE_OBJECT',
      payload: {
        objectId: object.id,
        cascade,
      },
    });
    onClose();
  };

  const hasDependencies = dependencies && !dependencies.canDelete;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Delete Custom Object</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete <strong className="text-slate-900">{object.label}</strong>?
          </p>

          {/* Dependency Warnings */}
          {hasDependencies ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">
                    Warning: This object has dependencies
                  </p>
                  <p className="text-xs text-amber-700 mb-3">
                    Deleting this object will also remove the following related items:
                  </p>

                  <div className="space-y-2">
                    {dependencies.details.map((dep, idx) => (
                      <div key={idx} className="bg-white rounded p-2 border border-amber-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-700 uppercase">
                            {dep.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-bold text-amber-700">
                            {dep.count}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{dep.message}</p>
                        {dep.items && dep.items.length > 0 && (
                          <ul className="mt-1 text-xs text-slate-500 list-disc list-inside">
                            {dep.items.slice(0, 3).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                            {dep.items.length > 3 && (
                              <li className="italic">+{dep.items.length - 3} more</li>
                            )}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                This object has no dependencies and can be safely deleted.
              </p>
              {object.fields && object.fields.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Note: This will also delete {object.fields.length} field{object.fields.length !== 1 ? 's' : ''} defined in this object.
                </p>
              )}
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-error-50 border-l-4 border-error-500 p-4">
            <p className="text-sm font-medium text-error-900 mb-1">
              This action cannot be undone
            </p>
            <p className="text-xs text-error-700">
              All data associated with this object will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {hasDependencies && (
              <button
                onClick={() => handleDelete(true)}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete with Dependencies
              </button>
            )}
            {!hasDependencies && (
              <button
                onClick={() => handleDelete(false)}
                className="px-6 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Object
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteObjectModal;
