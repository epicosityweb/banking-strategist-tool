import { z } from 'zod';

/**
 * Validation schemas for Data Model entities using Zod
 */

// Helper function to generate API name from object name
export const generateApiName = (name: string, projectId: string = 'client'): string => {
  return `p_${projectId}_${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')}`;
};

// Helper function to validate API name format
const apiNameRegex = /^[a-z][a-z0-9_]*$/;

// Enumeration Option Schema
export const enumerationOptionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  isDefault: z.boolean().default(false),
});

// Calculated Field Configuration Schema
export const calculatedFieldConfigSchema = z.object({
  calculationType: z.enum(['sum', 'count', 'average', 'date_difference', 'concatenate', 'lookup', 'custom']),
  sourceObjectId: z.string().optional(),
  sourceFieldId: z.string().optional(),
  formula: z.string().optional(),
});

// Field Schema
export const fieldSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(2, 'Field name must be at least 2 characters')
    .max(100, 'Field name must be less than 100 characters')
    .regex(/^[a-z][a-z0-9_]*$/, 'Field name must be lowercase, start with a letter, and contain only letters, numbers, and underscores'),
  label: z.string().min(1, 'Field label is required').max(200, 'Field label must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').default(''),
  dataType: z.enum(['text', 'multiline_text', 'number', 'currency', 'date', 'datetime', 'boolean', 'enumeration', 'email', 'phone', 'url']),
  fieldType: z.enum(['standard', 'calculated', 'lookup']).default('standard'),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  indexed: z.boolean().default(false),
  defaultValue: z.any().optional(),
  options: z.array(enumerationOptionSchema).optional(),
  calculation: calculatedFieldConfigSchema.optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Association Schema
export const associationSchema = z.object({
  id: z.string().uuid(),
  fromObjectId: z.string().uuid(),
  toObjectId: z.string().uuid(),
  type: z.enum(['one_to_one', 'one_to_many', 'many_to_many']),
  label: z.string().min(1, 'Association label is required'),
  createdAt: z.date().default(() => new Date()),
});

// Custom Object Schema
export const customObjectSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(2, 'Object name must be at least 2 characters')
    .max(100, 'Object name must be less than 100 characters')
    .regex(/^[a-z][a-z0-9_]*$/, 'Object name must be lowercase, start with a letter, and contain only letters, numbers, and underscores'),
  label: z.string().min(1, 'Display label is required').max(200, 'Display label must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').default(''),
  apiName: z
    .string()
    .regex(apiNameRegex, 'API name must be lowercase and contain only letters, numbers, and underscores')
    .min(5, 'API name must be at least 5 characters'),
  icon: z.string().default('Database'),
  fields: z.array(fieldSchema).default([]),
  associations: z.array(associationSchema).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  isTemplate: z.boolean().default(false),
  templateId: z.string().optional(),
});

// Form-specific schemas (for creating/editing)
export const createObjectFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Object name must be at least 2 characters')
    .max(100, 'Object name must be less than 100 characters')
    .regex(/^[A-Za-z][A-Za-z0-9_\s]*$/, 'Object name must start with a letter and contain only letters, numbers, underscores, and spaces'),
  label: z.string().min(1, 'Display label is required').max(200, 'Display label must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  icon: z.string().default('Database'),
});

export const editObjectFormSchema = createObjectFormSchema.extend({
  apiName: z
    .string()
    .regex(apiNameRegex, 'API name must be lowercase and contain only letters, numbers, and underscores')
    .min(5, 'API name must be at least 5 characters'),
});

// Validation helpers
export const validateObjectName = (name: string, existingObjects: any[] = []): string[] => {
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push('Object name must be at least 2 characters');
  }

  if (name && name.length > 100) {
    errors.push('Object name must be less than 100 characters');
  }

  const normalizedName = name?.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const duplicate = existingObjects.find(
    (obj: any) => obj.name.toLowerCase() === normalizedName
  );

  if (duplicate) {
    errors.push('An object with this name already exists');
  }

  return errors;
};

export const validateApiName = (apiName: string): string[] => {
  const errors: string[] = [];

  if (!apiName) {
    errors.push('API name is required');
  }

  if (apiName && !apiNameRegex.test(apiName)) {
    errors.push('API name must be lowercase and contain only letters, numbers, and underscores');
  }

  if (apiName && apiName.length < 5) {
    errors.push('API name must be at least 5 characters');
  }

  return errors;
};
