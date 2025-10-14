import React, { useState, useMemo } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useProject } from '../../../context/ProjectContext-v2';

/**
 * DeleteTagModal Component
 *
 * Modal for deleting tags with dependency checking.
 * Warns users if deleting a tag will affect other tags or journeys.
 */
export default function DeleteTagModal({ isOpen, onClose, tag }) {
  const { state, deleteTag } = useProject();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Check for dependencies
  const dependencies = useMemo(() => {
    if (!tag) return { tags: [], journeys: [], hasBlockers: false };

    const allTags = [...(state.tags?.library || []), ...(state.tags?.custom || [])];

    // Find tags that depend on this tag
    const dependentTags = allTags.filter((t) =>
      t.dependencies && t.dependencies.includes(tag.id)
    );

    // TODO: Check journeys that use this tag
    const dependentJourneys = [];

    return {
      tags: dependentTags,
      journeys: dependentJourneys,
      hasBlockers: dependentTags.length > 0 || dependentJourneys.length > 0,
    };
  }, [tag, state.tags]);

  const handleDelete = async () => {
    if (!tag) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteTag(tag.id);

      if (result.error) {
        setError(result.error.message || 'Failed to delete tag');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !tag) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Tag
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the tag{' '}
                    <span className="font-semibold text-gray-900">{tag.name}</span>?
                  </p>

                  {/* Dependency Warnings */}
                  {dependencies.hasBlockers && (
                    <div className="mt-4 rounded-md bg-yellow-50 p-4 border border-yellow-200">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Warning: This tag is in use
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            {dependencies.tags.length > 0 && (
                              <div className="mb-2">
                                <p className="font-medium">
                                  {dependencies.tags.length} tag
                                  {dependencies.tags.length === 1 ? '' : 's'} depend on this
                                  tag:
                                </p>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {dependencies.tags.slice(0, 5).map((t) => (
                                    <li key={t.id}>{t.name}</li>
                                  ))}
                                  {dependencies.tags.length > 5 && (
                                    <li className="text-yellow-600">
                                      +{dependencies.tags.length - 5} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            {dependencies.journeys.length > 0 && (
                              <div>
                                <p className="font-medium">
                                  {dependencies.journeys.length} journey
                                  {dependencies.journeys.length === 1 ? '' : 's'} use this
                                  tag:
                                </p>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {dependencies.journeys.map((j) => (
                                    <li key={j.id}>{j.name}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p className="mt-2 font-medium">
                              Deleting this tag may break dependent functionality.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Permanent Tag Warning */}
                  {tag.isPermanent && (
                    <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Permanent Tag
                          </h3>
                          <p className="mt-2 text-sm text-red-700">
                            This is a permanent tag. Members who have this tag assigned
                            will keep it even after deletion from the library.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Error deleting tag
                          </h3>
                          <p className="mt-2 text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Tag'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
