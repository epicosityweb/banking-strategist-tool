/**
 * Error Tracking Service
 *
 * Centralized error tracking service that abstracts error reporting
 * implementation from business logic. Provides a testable interface
 * for error tracking with graceful degradation when tracking is not
 * configured.
 *
 * This service follows the Dependency Inversion Principle:
 * - High-level modules (adapters) depend on abstraction (this service)
 * - Low-level modules (Sentry SDK) are hidden behind this abstraction
 *
 * Benefits:
 * - Testable: Can inject mock error tracker in unit tests
 * - Flexible: Can swap tracking implementations (Sentry → DataDog, etc.)
 * - Graceful: No-op fallback when tracking is not configured
 * - Single Responsibility: One place to manage error tracking logic
 *
 * Usage:
 * ```js
 * import errorTracker from './errorTracking';
 *
 * errorTracker.captureException(
 *   new Error('Something went wrong'),
 *   { extra: { context: 'user-action' } }
 * );
 * ```
 */
class ErrorTrackingService {
  constructor() {
    // Check if Sentry is available (only in browser environment)
    this.sentry = typeof window !== 'undefined' ? window.Sentry : null;
  }

  /**
   * Capture an exception with optional context
   *
   * @param {Error} error - The error to capture
   * @param {Object} context - Additional context (extra, tags, fingerprint, etc.)
   * @param {Object} context.extra - Extra data to attach
   * @param {Array<string>} context.fingerprint - Fingerprint for grouping
   * @param {Object} context.tags - Tags for filtering
   */
  captureException(error, context = {}) {
    if (this.sentry) {
      // Production: Send to Sentry
      this.sentry.captureException(error, context);
    } else if (process.env.NODE_ENV === 'development') {
      // Development: Log to console for debugging
      console.error('[ErrorTracking] Exception:', error);
      if (Object.keys(context).length > 0) {
        console.error('[ErrorTracking] Context:', context);
      }
    }
    // Production without Sentry: Silent no-op (graceful degradation)
  }

  /**
   * Capture a message with severity level
   *
   * @param {string} message - The message to capture
   * @param {string} level - Severity: 'info' | 'warning' | 'error'
   * @param {Object} context - Additional context
   */
  captureMessage(message, level = 'info', context = {}) {
    if (this.sentry) {
      // Production: Send to Sentry
      this.sentry.captureMessage(message, { level, extra: context });
    } else if (process.env.NODE_ENV === 'development') {
      // Development: Log to console
      const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
      logFn(`[ErrorTracking] ${level.toUpperCase()}:`, message);
      if (Object.keys(context).length > 0) {
        console.log('[ErrorTracking] Context:', context);
      }
    }
    // Production without Sentry: Silent no-op
  }

  /**
   * Check if error tracking is configured
   *
   * @returns {boolean} True if Sentry is available
   */
  isConfigured() {
    return this.sentry !== null;
  }
}

// Singleton instance
export const errorTracker = new ErrorTrackingService();
export default errorTracker;
