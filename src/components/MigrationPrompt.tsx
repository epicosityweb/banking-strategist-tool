/**
 * Migration Prompt Component
 *
 * Displays a modal prompt when localStorage projects need to be migrated to Supabase.
 * Provides a user-friendly interface for the migration process with progress tracking
 * and clear success/error messaging.
 */

import { useState } from 'react';
import { migrateLocalStorageToSupabase, needsMigration } from '../utils/migrateToSupabase';
import projectRepository from '../services/ProjectRepository';

interface MigrationPromptProps {
  onClose: () => void;
  onSuccess: () => void;
}

type MigrationStatus = 'idle' | 'migrating' | 'success' | 'error';

export default function MigrationPrompt({ onClose, onSuccess }: MigrationPromptProps) {
  const [status, setStatus] = useState<MigrationStatus>('idle');
  const [result, setResult] = useState<{
    migratedCount?: number;
    failedCount?: number;
    error?: string;
  }>({});

  const handleMigrate = async () => {
    setStatus('migrating');

    try {
      const migrationResult = await migrateLocalStorageToSupabase(projectRepository);

      setResult(migrationResult);

      if (migrationResult.success) {
        setStatus('success');
        // Call onSuccess after a short delay to show success message
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const handleDismiss = () => {
    if (status === 'migrating') {
      // Don't allow dismissing during migration
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Migrate to Cloud Storage</h2>
          </div>
          {status !== 'migrating' && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          {status === 'idle' && (
            <>
              <p className="text-gray-700 mb-4">
                We've detected projects in your browser's local storage. For better reliability
                and collaboration, we recommend migrating them to cloud storage.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <h3 className="font-medium text-blue-900 mb-1">What happens during migration?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ All project data validated before transfer</li>
                  <li>✓ Client Profile fields preserved (all 37 fields)</li>
                  <li>✓ Complete rollback if any errors occur</li>
                  <li>✓ Your local data remains as backup</li>
                </ul>
              </div>
            </>
          )}

          {status === 'migrating' && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-700 font-medium">Migrating your projects...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait, this should only take a few seconds</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-900 font-medium text-lg mb-2">Migration Successful!</p>
              <p className="text-gray-600 mb-4">
                {result.migratedCount} {result.migratedCount === 1 ? 'project' : 'projects'}{' '}
                migrated to cloud storage
              </p>
              <p className="text-sm text-gray-500">Redirecting you back to your projects...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-gray-900 font-medium text-lg mb-2">Migration Failed</p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-left">
                <p className="text-sm text-red-800 font-medium mb-1">Error:</p>
                <p className="text-sm text-red-700">{result.error || 'An unknown error occurred'}</p>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Your local data is safe. Please try again or contact support if the problem persists.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {status === 'idle' && (
            <>
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Maybe Later
              </button>
              <button
                onClick={handleMigrate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Migrate Now
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMigrate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if migration is needed
 * Returns true if localStorage has projects that should be migrated
 */
export function useMigrationCheck(): boolean {
  const [showMigration, setShowMigration] = useState(false);

  // Check on mount
  useState(() => {
    const checkMigration = () => {
      try {
        setShowMigration(needsMigration());
      } catch (error) {
        // Ignore errors - migration prompt won't show
        setShowMigration(false);
      }
    };

    checkMigration();
  });

  return showMigration;
}
