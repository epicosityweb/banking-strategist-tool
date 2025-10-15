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
 * SQL Reserved Words Blacklist
 * Prevents use of SQL keywords as object/field names to avoid potential SQL injection
 * and query construction issues if server-side rule evaluation is added.
 *
 * Defense in depth: Even though Supabase uses parameterized queries,
 * this prevents issues with dynamic identifier construction.
 */
export const SQL_RESERVED_WORDS = new Set([
  // SQL Commands
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
  'GRANT', 'REVOKE', 'EXECUTE', 'EXPLAIN', 'DESCRIBE',

  // SQL Clauses
  'FROM', 'WHERE', 'JOIN', 'INNER', 'OUTER', 'LEFT', 'RIGHT', 'FULL', 'CROSS',
  'ON', 'USING', 'UNION', 'INTERSECT', 'EXCEPT', 'ORDER', 'GROUP', 'HAVING',
  'LIMIT', 'OFFSET', 'FETCH', 'WITH', 'AS', 'INTO', 'VALUES', 'SET',

  // SQL Operators
  'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'IS',
  'NULL', 'TRUE', 'FALSE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',

  // SQL Functions
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'COALESCE', 'NULLIF',
  'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'NOW',

  // SQL Data Types
  'INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'DECIMAL', 'NUMERIC', 'REAL', 'DOUBLE',
  'VARCHAR', 'CHAR', 'TEXT', 'BOOLEAN', 'BOOL', 'DATE', 'TIME', 'TIMESTAMP',
  'INTERVAL', 'UUID', 'JSON', 'JSONB', 'ARRAY', 'BYTEA',

  // PostgreSQL Specific
  'SERIAL', 'BIGSERIAL', 'SMALLSERIAL', 'RETURNING', 'CONFLICT', 'NOTHING',
  'EXCLUDED', 'LATERAL', 'ORDINALITY', 'WITHIN', 'FILTER', 'OVER', 'PARTITION',
  'WINDOW', 'RANGE', 'ROWS', 'PRECEDING', 'FOLLOWING', 'UNBOUNDED', 'CURRENT',

  // Table/Database Operations
  'TABLE', 'DATABASE', 'SCHEMA', 'INDEX', 'VIEW', 'SEQUENCE', 'TRIGGER',
  'FUNCTION', 'PROCEDURE', 'DOMAIN', 'TYPE', 'CONSTRAINT', 'FOREIGN', 'KEY',
  'PRIMARY', 'UNIQUE', 'CHECK', 'DEFAULT', 'REFERENCES', 'CASCADE', 'RESTRICT',

  // Transaction Control
  'BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'TRANSACTION', 'ISOLATION', 'LEVEL',

  // User/Role Management
  'USER', 'ROLE', 'LOGIN', 'PASSWORD', 'SUPERUSER', 'CREATEDB', 'CREATEROLE',

  // System
  'TEMP', 'TEMPORARY', 'GLOBAL', 'LOCAL', 'SESSION', 'SYSTEM', 'CATALOG',
  'INFORMATION_SCHEMA', 'PG_CATALOG',
]);

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
 * Check if a name is a SQL reserved word (case-insensitive)
 */
export function isSqlReservedWord(value: string): boolean {
  return SQL_RESERVED_WORDS.has(value.toUpperCase());
}

/**
 * Validate that a name is not a SQL reserved word
 */
export function validateNotReservedWord(value: string): string | null {
  if (isSqlReservedWord(value)) {
    return `"${value}" is a SQL reserved word and cannot be used as a name`;
  }
  return null;
}

/**
 * Get validation error message if pattern doesn't match
 */
export function getValidationError(value: string, pattern: ValidationPattern): string | null {
  return validatePattern(value, pattern) ? null : pattern.errorMessage;
}

/**
 * Comprehensive validation: pattern + reserved word check
 */
export function validateName(value: string, pattern: ValidationPattern): string | null {
  // First check pattern
  const patternError = getValidationError(value, pattern);
  if (patternError) {
    return patternError;
  }

  // Then check reserved words
  return validateNotReservedWord(value);
}

/**
 * Format pattern for display in documentation
 */
export function formatPatternForDocs(pattern: ValidationPattern): string {
  return `Pattern: ${pattern.regex.toString()}\n${pattern.description || ''}\nExample error: "${pattern.errorMessage}"`;
}
