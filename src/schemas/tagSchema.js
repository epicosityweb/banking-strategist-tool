import { z } from 'zod';

/**
 * Validation schemas for Tag Library entities using Zod
 *
 * Tags enable intelligent journey orchestration by qualifying members
 * based on properties, activities, associations, and scores.
 */

// Qualification Rule Condition Schemas

// Property Rule Condition
export const propertyRuleConditionSchema = z.object({
  object: z.string().min(1, 'Object name is required'),
  field: z.string().min(1, 'Field name is required'),
  operator: z.enum([
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'in',
    'not_in',
    'between',
    'is_known',
    'is_unknown',
  ]),
  value: z.any().optional(), // Value can be string, number, boolean, array, etc.
});

// Activity Rule Condition
export const activityRuleConditionSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  occurrence: z.enum(['has_occurred', 'has_not_occurred', 'count']),
  operator: z.enum([
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
  ]).optional(),
  value: z.number().optional(),
  timeframe: z.number().positive('Timeframe must be positive').optional(), // days
  filters: z.array(propertyRuleConditionSchema).optional(), // Additional filters on event properties
});

// Association Rule Condition
export const associationRuleConditionSchema = z.object({
  associationType: z.string().min(1, 'Association type is required'),
  relatedObject: z.string().min(1, 'Related object is required'),
  conditionType: z.enum(['has_any', 'has_none', 'count']),
  operator: z.enum([
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
  ]).optional(),
  value: z.number().optional(),
  nestedFilters: z.array(propertyRuleConditionSchema).optional(), // Recursive property rules
});

// Score Rule Condition with Hysteresis
export const scoreRuleConditionSchema = z.object({
  scoreField: z.string().min(1, 'Score field is required'),
  operator: z.enum([
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
    'between',
  ]),
  threshold: z.number().optional(),
  value: z.union([z.number(), z.array(z.number())]).optional(), // Single value or array for 'between'
  hysteresis: z.object({
    addThreshold: z.number(),
    removeThreshold: z.number(),
  }).optional(),
});

// Combined Rule Condition (union type)
export const ruleConditionSchema = z.union([
  propertyRuleConditionSchema,
  activityRuleConditionSchema,
  associationRuleConditionSchema,
  scoreRuleConditionSchema,
]);

// Qualification Rules Schema
export const qualificationRulesSchema = z.object({
  ruleType: z.enum(['property', 'activity', 'association', 'score']),
  logic: z.enum(['AND', 'OR']).default('AND'),
  conditions: z.array(ruleConditionSchema).min(1, 'At least one condition is required'),
});

// Tag Category
export const tagCategorySchema = z.enum(['origin', 'behavior', 'opportunity']);

// Tag Behavior
export const tagBehaviorSchema = z.enum(['set_once', 'dynamic', 'evolving']);

// Main Tag Schema
export const tagSchema = z.object({
  id: z.string().min(1, 'Tag ID is required'),
  name: z
    .string()
    .min(2, 'Tag name must be at least 2 characters')
    .max(100, 'Tag name must be less than 100 characters')
    .regex(
      /^[A-Z][A-Za-z0-9_]*$/,
      'Tag name must start with uppercase letter and contain only letters, numbers, and underscores'
    ),
  category: tagCategorySchema,
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  icon: z.string().min(1, 'Icon is required'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code (e.g., #1D4ED8)'),
  behavior: tagBehaviorSchema,
  isPermanent: z.boolean(),
  qualificationRules: qualificationRulesSchema,
  dependencies: z.array(z.string()).optional().default([]), // IDs of other tags this tag depends on
  isCustom: z.boolean().default(false), // true for user-created tags, false for pre-built
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Tag Library Metadata Schema
export const tagLibraryMetadataSchema = z.object({
  version: z.string(),
  totalTags: z.number().int().positive(),
  categories: z.object({
    origin: z.number().int().nonnegative(),
    behavior: z.number().int().nonnegative(),
    opportunity: z.number().int().nonnegative(),
  }),
  lastUpdated: z.string(),
});

// Tag Library Schema (full library structure)
export const tagLibrarySchema = z.object({
  tags: z.array(tagSchema),
  metadata: tagLibraryMetadataSchema,
});

// Form-specific schemas

// Create Tag Form Schema
export const createTagFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Tag name must be at least 2 characters')
    .max(100, 'Tag name must be less than 100 characters'),
  category: tagCategorySchema,
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'),
  behavior: tagBehaviorSchema,
  isPermanent: z.boolean(),
});

// Edit Tag Form Schema
export const editTagFormSchema = createTagFormSchema.extend({
  id: z.string().min(1, 'Tag ID is required'),
  qualificationRules: qualificationRulesSchema.optional(),
});

// Validation helpers

/**
 * Validate tag name uniqueness
 * @param {string} name - Tag name to validate
 * @param {Array} existingTags - Existing tags to check against
 * @param {string} currentTagId - ID of tag being edited (optional)
 * @returns {Array<string>} Array of error messages
 */
export const validateTagName = (name, existingTags = [], currentTagId = null) => {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Tag name must be at least 2 characters');
  }

  if (name && name.length > 100) {
    errors.push('Tag name must be less than 100 characters');
  }

  // Check for duplicates (case-insensitive)
  const normalizedName = name?.toLowerCase();
  const duplicate = existingTags.find(
    (tag) => tag.id !== currentTagId && tag.name.toLowerCase() === normalizedName
  );

  if (duplicate) {
    errors.push('A tag with this name already exists');
  }

  return errors;
};

/**
 * Validate tag color format
 * @param {string} color - Hex color code to validate
 * @returns {Array<string>} Array of error messages
 */
export const validateTagColor = (color) => {
  const errors = [];

  if (!color) {
    errors.push('Color is required');
  }

  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (color && !hexColorRegex.test(color)) {
    errors.push('Color must be a valid hex color code (e.g., #1D4ED8)');
  }

  return errors;
};

/**
 * Validate qualification rules completeness
 * @param {Object} rules - Qualification rules to validate
 * @param {Array} availableObjects - Available custom objects
 * @returns {Array<string>} Array of error messages
 */
export const validateQualificationRules = (rules, availableObjects = []) => {
  const errors = [];

  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    errors.push('At least one qualification rule condition is required');
    return errors;
  }

  // Validate property rules reference existing objects/fields
  if (rules.ruleType === 'property') {
    rules.conditions.forEach((condition, index) => {
      const objectExists = availableObjects.some(
        (obj) => obj.name === condition.object || obj.label === condition.object
      );

      if (!objectExists) {
        errors.push(
          `Condition ${index + 1}: Object "${condition.object}" does not exist in data model`
        );
      }

      // Check if field exists in the object
      if (objectExists) {
        const object = availableObjects.find(
          (obj) => obj.name === condition.object || obj.label === condition.object
        );
        const fieldExists = object?.fields?.some(
          (field) => field.name === condition.field || field.label === condition.field
        );

        if (!fieldExists) {
          errors.push(
            `Condition ${index + 1}: Field "${condition.field}" does not exist in object "${condition.object}"`
          );
        }
      }
    });
  }

  return errors;
};

/**
 * Validate tag dependencies (circular dependency check)
 * @param {string} tagId - Tag ID being validated
 * @param {Array<string>} dependencies - Array of dependency tag IDs
 * @param {Array} allTags - All available tags
 * @returns {Array<string>} Array of error messages
 */
export const validateTagDependencies = (tagId, dependencies = [], allTags = []) => {
  const errors = [];

  if (!dependencies || dependencies.length === 0) {
    return errors;
  }

  // Check for circular dependencies (recursive check)
  const checkCircular = (currentTagId, visited = new Set()) => {
    if (visited.has(currentTagId)) {
      return true; // Circular dependency found
    }

    visited.add(currentTagId);

    const currentTag = allTags.find((tag) => tag.id === currentTagId);
    if (!currentTag || !currentTag.dependencies) {
      return false;
    }

    return currentTag.dependencies.some((depId) => checkCircular(depId, new Set(visited)));
  };

  dependencies.forEach((depId) => {
    const dependencyTag = allTags.find((tag) => tag.id === depId);

    if (!dependencyTag) {
      errors.push(`Dependency tag "${depId}" does not exist`);
    } else if (checkCircular(depId)) {
      errors.push(`Circular dependency detected with tag "${dependencyTag.name}"`);
    }
  });

  return errors;
};

/**
 * Calculate rule complexity score
 * @param {Object} rules - Qualification rules
 * @returns {Object} Complexity analysis
 */
export const analyzeRuleComplexity = (rules) => {
  if (!rules || !rules.conditions) {
    return { score: 0, level: 'none', warnings: [] };
  }

  let score = 0;
  const warnings = [];

  // Base score per condition
  score += rules.conditions.length;

  // Additional complexity for nested filters
  rules.conditions.forEach((condition) => {
    if (condition.nestedFilters && condition.nestedFilters.length > 0) {
      score += condition.nestedFilters.length * 2; // Nested filters are more complex
      if (condition.nestedFilters.length > 5) {
        warnings.push('Very deep nesting may impact performance');
      }
    }

    if (condition.filters && condition.filters.length > 0) {
      score += condition.filters.length;
    }
  });

  // Determine complexity level
  let level = 'simple';
  if (score > 10) {
    level = 'complex';
    warnings.push('Consider breaking this into multiple tags');
  } else if (score > 5) {
    level = 'moderate';
  }

  return { score, level, warnings };
};
