import { useState, useEffect } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';
import migrationService, { MigrationStatus } from '../../services/MigrationService';
import { getCurrentUser, signIn, signUp } from '../../lib/supabase';

/**
 * Migration Modal Component
 *
 * Provides UI for migrating data from localStorage to Supabase.
 * Includes authentication, progress tracking, and error handling.
 */
export default function MigrationModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState('check'); // check, auth, migrate, complete
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Migration state
  const [migrationProgress, setMigrationProgress] = useState({
    current: 0,
    total: 0,
    projectName: '',
    status: '',
  });
  const [migrationResults, setMigrationResults] = useState(null);

  // Auth state
  const [authMode, setAuthMode] = useState('signin'); // signin or signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Readiness check state
  const [readinessData, setReadinessData] = useState(null);
  const [supabaseData, setSupabaseData] = useState(null);

  // Check readiness on mount
  useEffect(() => {
    if (isOpen) {
      checkReadiness();
    }
  }, [isOpen]);

  const checkReadiness = async () => {
    setIsLoading(true);
    setError(null);

    // Check if user is authenticated
    const { user: currentUser } = await getCurrentUser();
    setUser(currentUser);

    // Check migration readiness
    const readiness = await migrationService.checkMigrationReadiness();
    setReadinessData(readiness);

    // Check Supabase data
    const supabaseCheck = await migrationService.checkSupabaseData();
    setSupabaseData(supabaseCheck);

    setIsLoading(false);

    // Determine next step
    if (!currentUser) {
      setStep('auth');
    } else if (readiness.projectCount === 0) {
      setError('No projects found in localStorage to migrate.');
      setStep('complete');
    } else if (supabaseCheck.hasData) {
      setStep('confirm');
    } else {
      setStep('ready');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const authFn = authMode === 'signin' ? signIn : signUp;
      const { user: authUser, error: authError } = await authFn(email, password);

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      setUser(authUser);
      setIsLoading(false);

      // Recheck readiness after auth
      await checkReadiness();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    setError(null);
    setStep('migrate');

    // Create backup first
    const { success: backupSuccess, error: backupError } =
      await migrationService.createBackup();

    if (!backupSuccess) {
      setError(`Failed to create backup: ${backupError?.message}`);
      setIsLoading(false);
      return;
    }

    // Perform migration with progress tracking
    const results = await migrationService.migrateToSupabase((progress) => {
      setMigrationProgress(progress);
    });

    setMigrationResults(results);
    setIsLoading(false);

    if (results.success) {
      setStep('complete');

      // Optionally clear localStorage after successful migration
      // await migrationService.clearLocalStorage();

      if (onComplete) {
        onComplete(results);
      }
    } else {
      setStep('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Migrate to Cloud Storage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Check/Loading State */}
          {step === 'check' && (
            <div className="flex flex-col items-center py-8">
              <Loader className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="mt-4 text-gray-600">Checking migration readiness...</p>
            </div>
          )}

          {/* Authentication Step */}
          {step === 'auth' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sign In to Continue
                </h3>
                <p className="text-sm text-gray-600">
                  You need to authenticate to migrate your data to cloud storage.
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Authenticating...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="w-full text-sm text-blue-600 hover:text-blue-700"
                >
                  {authMode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </form>
            </div>
          )}

          {/* Ready to Migrate */}
          {step === 'ready' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Migrate
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your data is ready to be migrated to cloud storage.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Migration Details
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {readinessData?.projectCount || 0} projects will be migrated</li>
                      <li>• A backup will be created automatically</li>
                      <li>• Your local data will be preserved</li>
                      <li>• You can switch between local and cloud storage anytime</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMigration}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Start Migration
                </button>
              </div>
            </div>
          )}

          {/* Confirm (Supabase already has data) */}
          {step === 'confirm' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Existing Data Found
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your Supabase account already has {supabaseData?.projectCount || 0} project(s).
                  Migrating will add {readinessData?.projectCount || 0} more project(s) from your local storage.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      Important
                    </p>
                    <p className="text-sm text-yellow-800">
                      Projects will be added to your existing data. No data will be deleted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMigration}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Continue Migration
                </button>
              </div>
            </div>
          )}

          {/* Migration in Progress */}
          {step === 'migrate' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Migration in Progress
                </h3>
                <p className="text-sm text-gray-600">
                  Please do not close this window...
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      Project {migrationProgress.current} of {migrationProgress.total}
                    </span>
                    <span>
                      {Math.round((migrationProgress.current / migrationProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(migrationProgress.current / migrationProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {migrationProgress.projectName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Migrating: {migrationProgress.projectName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && migrationResults && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Migration Complete
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Successfully migrated {migrationResults.migratedCount} of{' '}
                  {migrationResults.totalProjects} project(s) to cloud storage.
                </p>
              </div>

              {migrationResults.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    Some projects could not be migrated:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {migrationResults.errors.map((err, idx) => (
                      <li key={idx}>• {err.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Next Steps
                    </p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Your data is now safely stored in the cloud</li>
                      <li>• A backup remains in your browser's local storage</li>
                      <li>
                        • To use cloud storage, set VITE_STORAGE_ADAPTER=supabase in .env.local
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          )}

          {/* Error */}
          {step === 'error' && migrationResults && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Migration Failed
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  The migration encountered errors and could not complete.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-red-900 mb-2">Errors:</p>
                <ul className="text-sm text-red-800 space-y-1">
                  {migrationResults.errors.map((err, idx) => (
                    <li key={idx}>• {err.message}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => checkReadiness()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Generic Error */}
          {error && step !== 'auth' && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
