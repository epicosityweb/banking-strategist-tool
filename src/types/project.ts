/**
 * Type definitions for Project Context
 */

import { Tag, TagCollection, ValidationError } from './tag';

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Client Profile Types
export interface ClientProfile {
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
  customObjects: CustomObject[];
  customFields: CustomField[];
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

// Project Actions
export type ProjectAction =
  | { type: 'SET_CURRENT_PROJECT'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CLIENT_PROFILE'; payload: ClientProfile }
  | { type: 'SET_DATA_MODEL'; payload: DataModel }
  | { type: 'ADD_CUSTOM_OBJECT'; payload: CustomObject }
  | { type: 'UPDATE_CUSTOM_OBJECT'; payload: CustomObject }
  | { type: 'DELETE_CUSTOM_OBJECT'; payload: string }
  | { type: 'ADD_CUSTOM_FIELD'; payload: { objectId: string; field: CustomField } }
  | { type: 'UPDATE_CUSTOM_FIELD'; payload: { objectId: string; field: CustomField } }
  | { type: 'DELETE_CUSTOM_FIELD'; payload: { objectId: string; fieldId: string } }
  | { type: 'SET_TAGS'; payload: TagCollection }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'SET_JOURNEYS'; payload: Journey[] }
  | { type: 'ADD_JOURNEY'; payload: Journey }
  | { type: 'UPDATE_JOURNEY'; payload: Journey }
  | { type: 'DELETE_JOURNEY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { type: 'SET_SAVED_AT'; payload: string };

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
