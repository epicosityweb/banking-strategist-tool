/**
 * Type definitions for Tag Library
 *
 * These types are inferred from Zod schemas to ensure runtime validation
 * and compile-time type safety are always in sync.
 */

import { z } from 'zod';
import {
  tagSchema,
  tagCategorySchema,
  tagBehaviorSchema,
  qualificationRulesSchema,
  ruleConditionSchema,
  propertyRuleConditionSchema,
  activityRuleConditionSchema,
  associationRuleConditionSchema,
  scoreRuleConditionSchema,
  tagLibrarySchema,
  tagLibraryMetadataSchema,
  createTagFormSchema,
  editTagFormSchema,
} from '../schemas/tagSchema';

// Re-export types from project for convenience
export type { CustomObject, CustomField } from './project';

// Core Tag Types
export type Tag = z.infer<typeof tagSchema>;
export type TagCategory = z.infer<typeof tagCategorySchema>;
export type TagBehavior = z.infer<typeof tagBehaviorSchema>;

// Qualification Rules Types
export type QualificationRules = z.infer<typeof qualificationRulesSchema>;
export type RuleCondition = z.infer<typeof ruleConditionSchema>;
export type PropertyRuleCondition = z.infer<typeof propertyRuleConditionSchema>;
export type ActivityRuleCondition = z.infer<typeof activityRuleConditionSchema>;
export type AssociationRuleCondition = z.infer<typeof associationRuleConditionSchema>;
export type ScoreRuleCondition = z.infer<typeof scoreRuleConditionSchema>;

// Library Types
export type TagLibrary = z.infer<typeof tagLibrarySchema>;
export type TagLibraryMetadata = z.infer<typeof tagLibraryMetadataSchema>;

// Form Types
export type CreateTagFormData = z.infer<typeof createTagFormSchema>;
export type EditTagFormData = z.infer<typeof editTagFormSchema>;

// Collection Types
export interface TagCollection {
  library: Tag[];
  custom: Tag[];
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Result Types
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}

// Tag Dependencies
export interface TagDependencies {
  requiredBy: Tag[]; // Tags that depend on this tag
  requires: Tag[]; // Tags this tag depends on
  hasBlockers: boolean; // True if cannot be deleted due to dependencies
  dependentCount: number;
}

// Tag Operations
export type TagOperation = 'create' | 'update' | 'delete' | 'duplicate';

export interface TagOperationResult {
  success: boolean;
  tag?: Tag;
  error?: string;
  operation: TagOperation;
}

// Search and Filter Types
export interface TagFilters {
  category?: TagCategory;
  behavior?: TagBehavior;
  isCustom?: boolean;
  searchQuery?: string;
}

export interface TagSearchResult {
  tags: Tag[];
  totalCount: number;
  filteredCount: number;
}
