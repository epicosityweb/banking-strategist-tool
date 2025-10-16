/**
 * Type definitions for Project Context
 */

import { Tag, TagCollection, ValidationError } from './tag';

// Re-export Tag for convenience
export type { Tag };
export type { CorruptDataWarning };

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  clientProfile?: ClientProfile;
  dataModel?: DataModel;
  tags?: TagCollection;
  journeys?: Journey[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  owner_id?: string;
}

// Client Profile Types
export interface ClientProfile {
  basicInfo?: Record<string, unknown>;
  integrationSpecs?: Record<string, unknown>;
  industry?: string;
  size?: string;
  objectives?: string[];
}

// Data Model Types
export interface CustomField {
  id: string;
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  label?: string; // Optional label for display
}

export interface CustomObject {
  id: string;
  name: string;
  fields: CustomField[];
  description?: string;
  label?: string; // Optional label for display
}

export interface DataModel {
  objects?: CustomObject[];
  fields?: CustomField[];
  mappings?: unknown[];
  associations?: unknown[];
  customObjects?: CustomObject[];
  customFields?: CustomField[];
}

// Journey Types
export interface Journey {
  id: string;
  name: string;
  description?: string;
  stages: JourneyStage[];
  tags: string[]; // Tag IDs
  createdAt: string;
  updatedAt: string;
}

export interface JourneyStage {
  id: string;
  name: string;
  order: number;
  description?: string;
}

// Data Corruption Tracking Types
export interface CorruptDataWarning {
  type: 'corrupt_tags' | 'corrupt_objects' | 'corrupt_fields';
  count: number;
  details: Array<{
    id: string;
    errors: unknown;
  }>;
  severity: 'critical' | 'warning';
  detectedAt: string;
}

// Project State
export interface ProjectState {
  currentProject: string | null;
  projects: Project[];
  clientProfile: ClientProfile;
  dataModel: DataModel;
  tags: TagCollection;
  journeys: Journey[];
  savedAt: string | null;
  loading: boolean;
  error: string | null;
  validationErrors: ValidationError[];
  // Data corruption tracking (Issue #29)
  hasCorruptData: boolean;
  corruptDataWarnings: CorruptDataWarning[];
}

// Project Actions (matching actual reducer implementation)
export type ProjectAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { error: string; validationErrors?: ValidationError[] } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOAD_PROJECTS'; payload: Project[] }
  | { type: 'CREATE_PROJECT'; payload: Project }
  | { type: 'LOAD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT_IN_LIST'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'UPDATE_CLIENT_PROFILE'; payload: Partial<ClientProfile> }
  | { type: 'ADD_OBJECT'; payload: CustomObject }
  | { type: 'UPDATE_OBJECT'; payload: CustomObject }
  | { type: 'DELETE_OBJECT'; payload: string }
  | { type: 'ADD_FIELD'; payload: { objectId: string; field: CustomField } }
  | { type: 'UPDATE_FIELD'; payload: { objectId: string; field: CustomField } }
  | { type: 'DELETE_FIELD'; payload: { objectId: string; fieldId: string } }
  | { type: 'UPDATE_TAGS'; payload: Partial<TagCollection> }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'ADD_TAG_FROM_LIBRARY'; payload: Tag }
  | { type: 'UPDATE_JOURNEYS'; payload: Journey[] }
  | { type: 'UPDATE_SAVED_AT'; payload: string }
  // Data corruption actions (Issue #29)
  | { type: 'SET_CORRUPT_DATA_WARNING'; payload: CorruptDataWarning }
  | { type: 'CLEAR_CORRUPT_DATA_WARNINGS' };

// ProjectContextValue is defined and exported from ProjectContext-v2.tsx
// to ensure types match the actual implementation
