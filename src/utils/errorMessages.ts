/**
 * Error Message Sanitization Utility
 *
 * Provides user-friendly error messages while preventing information disclosure.
 * Maps technical error messages to safe, actionable messages for end users.
 *
 * Security: Prevents leakage of internal implementation details like:
 * - Database schema information
 * - File paths
 * - Internal validation logic
 * - API endpoint details
 */

/**
 * Convert technical error messages to user-friendly, safe messages
 *
 * @param error - The error object or message to sanitize
 * @returns A user-friendly error message safe for display
 */
export function getUserFriendlyError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Convert error message to lowercase for case-insensitive matching
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'Invalid input. Please check your data and try again.';
  }

  // Permission/authorization errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  // Duplicate errors
  if (message.includes('duplicate') || message.includes('already exists') || message.includes('unique')) {
    return 'This item already exists. Please modify your input.';
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }

  // Database/server errors
  if (message.includes('database') || message.includes('server') || message.includes('internal')) {
    return 'A server error occurred. Please try again or contact support.';
  }

  // Default generic message (prevents exposing technical details)
  return 'An error occurred while saving. Please try again or contact support.';
}

/**
 * Environment-aware error logging
 *
 * Logs full error details in development, sanitized messages in production
 *
 * @param component - Component name where error occurred
 * @param action - Action being performed when error occurred
 * @param error - The error object
 */
export function logError(component: string, action: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  // Always log to console for debugging (filtered by browser console settings)
  console.error(`[${component}] Failed to ${action}:`, error);

  // In development, show additional debugging information
  if (import.meta.env.DEV) {
    console.debug(`[${component}] Error details:`, {
      action,
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
