/**
 * CorruptDataBanner Component
 *
 * Displays a critical warning banner when corrupt data is detected (Issue #29)
 * Prevents users from unknowingly losing data due to auto-save filtering
 */

import { useProject } from '../../context/ProjectContext-v2';

export default function CorruptDataBanner() {
  const { state } = useProject();

  // Don't render if no corrupt data detected
  if (!state.hasCorruptData || state.corruptDataWarnings.length === 0) {
    return null;
  }

  const totalCorruptCount = state.corruptDataWarnings.reduce(
    (sum, warning) => sum + warning.count,
    0
  );

  return (
    <div
      className="fixed top-16 left-0 right-0 z-50 bg-red-600 text-white shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2">
              🚨 Critical: Corrupt Data Detected
            </h3>
            <p className="text-sm mb-3">
              <strong>Auto-save has been disabled</strong> to prevent permanent data loss.
              {totalCorruptCount} corrupt item{totalCorruptCount > 1 ? 's' : ''} detected in your project:
            </p>

            {/* Corruption Details */}
            <div className="bg-red-700 bg-opacity-50 rounded-md p-3 mb-3">
              <ul className="space-y-2 text-sm">
                {state.corruptDataWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-mono text-xs bg-red-800 px-2 py-1 rounded">
                      {warning.count}
                    </span>
                    <span>
                      <strong className="capitalize">{warning.type.replace('corrupt_', '').replace('_', ' ')}</strong>
                      {' - '}
                      {warning.count} item{warning.count > 1 ? 's' : ''} with validation errors
                      <span className="text-xs opacity-75 block mt-1">
                        Detected at: {new Date(warning.detectedAt).toLocaleString()}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                className="bg-white text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
                onClick={() => {
                  console.warn('Corrupt data details:', state.corruptDataWarnings);
                  alert(
                    `Corrupt Data Details:\n\n${JSON.stringify(state.corruptDataWarnings, null, 2)}\n\nCheck the browser console for full details.`
                  );
                }}
              >
                View Details
              </button>
              <a
                href="https://github.com/epicosityweb/banking-orchestration-framework-explainer/issues/29"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-800 transition-colors"
              >
                Learn More (Issue #29)
              </a>
            </div>

            {/* Warning Notice */}
            <div className="mt-3 text-xs opacity-90">
              <p>
                ⚠️ <strong>Important:</strong> Your corrupted data is still in the database and has not been deleted.
                Do not manually save until you have reviewed and fixed the corruption issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
