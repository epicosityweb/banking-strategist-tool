/**
 * Type definitions for Project Context
 */

import { Tag, TagCollection, ValidationError } from './tag';

// Re-export Tag for convenience
export type { Tag };

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
  | { type: 'UPDATE_SAVED_AT'; payload: string };

// Context Value
export interface ProjectContextValue {
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
  // Tag operations
  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Result<Tag>>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<Result<Tag>>;
  deleteTag: (id: string) => Promise<Result<void>>;
  getTagDependencies: (tagId: string) => TagDependencies;
  // Project operations
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Result<Project>>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Result<Project>>;
  deleteProject: (id: string) => Promise<Result<void>>;
  // Data operations
  fetchProjectData: (projectId: string) => Promise<Result<void>>;
  saveProjectData: () => Promise<Result<void>>;
}

// Result type for async operations
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}

// Tag Dependencies (re-exported for convenience)
export interface TagDependencies {
  requiredBy: Tag[];
  requires: Tag[];
  hasBlockers: boolean;
  dependentCount: number;
}
