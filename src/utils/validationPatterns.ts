/**
 * Centralized Validation Patterns
 *
 * Ensures consistent validation between Zod schemas (backend/service layer)
 * and HTML form inputs (frontend/UI layer).
 *
 * Each pattern includes:
 * - regex: For Zod schema validation
 * - htmlPattern: For HTML input pattern attribute (escaped for HTML)
 * - errorMessage: User-friendly error message
 */

export interface ValidationPattern {
  regex: RegExp;
  htmlPattern: string;
  errorMessage: string;
  description?: string;
}

/**
 * Object name pattern
 * - Must start with a letter
 * - Can contain letters, numbers, and underscores
 * - Used for custom objects in data model
 */
export const OBJECT_NAME_PATTERN: ValidationPattern = {
  regex: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  htmlPattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
  errorMessage: 'Name must start with a letter and contain only letters, numbers, and underscores',
  description: 'Valid examples: Customer, AccountData, contact_info',
};

/**
 * Field name pattern
 * - Same rules as object names
 */
export const FIELD_NAME_PATTERN: ValidationPattern = {
  regex: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  htmlPattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
  errorMessage: 'Field name must start with a letter and contain only letters, numbers, and underscores',
  description: 'Valid examples: firstName, account_balance, totalScore',
};

/**
 * Tag name pattern
 * - Must start with a letter
 * - Can contain letters, numbers, spaces, hyphens, and underscores
 * - More permissive than object/field names for better UX
 */
export const TAG_NAME_PATTERN: ValidationPattern = {
  regex: /^[a-zA-Z][a-zA-Z0-9_\- ]*$/,
  htmlPattern: '^[a-zA-Z][a-zA-Z0-9_\\- ]*$',
  errorMessage: 'Tag name must start with a letter and can contain letters, numbers, spaces, hyphens, and underscores',
  description: 'Valid examples: High Value, VIP-Customer, preferred_status',
};

/**
 * Association name pattern
 * - Same rules as object names
 */
export const ASSOCIATION_NAME_PATTERN: ValidationPattern = {
  regex: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  htmlPattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
  errorMessage: 'Association name must start with a letter and contain only letters, numbers, and underscores',
  description: 'Valid examples: hasAccount, belongsTo, owns',
};

/**
 * Email pattern (simple validation)
 */
export const EMAIL_PATTERN: ValidationPattern = {
  regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  htmlPattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
  errorMessage: 'Please enter a valid email address',
  description: 'Valid example: user@example.com',
};

/**
 * Color hex pattern (for tag colors)
 */
export const COLOR_HEX_PATTERN: ValidationPattern = {
  regex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  htmlPattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
  errorMessage: 'Please enter a valid hex color (e.g., #FF5733 or #F57)',
  description: 'Valid examples: #FF5733, #F57',
};

/**
 * Validation helper functions
 */

/**
 * Validate a string against a pattern
 */
export function validatePattern(value: string, pattern: ValidationPattern): boolean {
  return pattern.regex.test(value);
}

/**
 * Get validation error message if pattern doesn't match
 */
export function getValidationError(value: string, pattern: ValidationPattern): string | null {
  return validatePattern(value, pattern) ? null : pattern.errorMessage;
}

/**
 * Format pattern for display in documentation
 */
export function formatPatternForDocs(pattern: ValidationPattern): string {
  return `Pattern: ${pattern.regex.toString()}\n${pattern.description || ''}\nExample error: "${pattern.errorMessage}"`;
}
