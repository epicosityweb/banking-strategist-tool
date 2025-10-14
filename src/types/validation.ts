/**
 * Type definitions for Validation Service
 */

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
}

// Validation Result (generic)
export interface ValidationResult<T = any> {
  valid: boolean;
  data: T | null;
  errors: ValidationError[];
}

// Context for tag validation
export interface TagValidationContext {
  existingTags?: any[];
  availableObjects?: any[];
}

// Zod Error Formatting
export interface ZodErrorWithIssues extends Error {
  issues: Array<{
    path: (string | number)[];
    message: string;
    code?: string;
  }>;
}
