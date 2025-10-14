/**
 * Type declarations for ProjectRepository
 *
 * This file provides TypeScript types for the ProjectRepository.js module
 * until it can be fully migrated to TypeScript.
 */

import { Project, CustomObject, CustomField } from '../types/project';

export interface RepositoryResponse<T> {
  data: T | null;
  error: Error | string | null;
  validationErrors?: Array<{ field: string; message: string }>;
}

export interface ProjectRepository {
  /**
   * Get all projects for the current user
   */
  getAllProjects(): Promise<RepositoryResponse<Project[]>>;

  /**
   * Get a single project by ID
   */
  getProject(projectId: string): Promise<RepositoryResponse<Project>>;

  /**
   * Create a new project
   */
  createProject(projectData: Partial<Project>): Promise<RepositoryResponse<Project>>;

  /**
   * Update an existing project
   */
  updateProject(projectId: string, updates: Partial<Project>): Promise<RepositoryResponse<Project>>;

  /**
   * Delete a project
   */
  deleteProject(projectId: string): Promise<RepositoryResponse<boolean>>;

  /**
   * Add a custom object to a project
   */
  addCustomObject(projectId: string, objectData: CustomObject): Promise<RepositoryResponse<CustomObject>>;

  /**
   * Update a custom object
   */
  updateCustomObject(projectId: string, objectId: string, updates: Partial<CustomObject>): Promise<RepositoryResponse<CustomObject>>;

  /**
   * Delete a custom object
   */
  deleteCustomObject(projectId: string, objectId: string): Promise<RepositoryResponse<boolean>>;

  /**
   * Duplicate a custom object
   */
  duplicateCustomObject(projectId: string, objectId: string): Promise<RepositoryResponse<CustomObject>>;

  /**
   * Add a field to a custom object
   */
  addField(projectId: string, objectId: string, fieldData: CustomField): Promise<RepositoryResponse<CustomField>>;

  /**
   * Update a field in a custom object
   */
  updateField(projectId: string, objectId: string, fieldId: string, updates: Partial<CustomField>): Promise<RepositoryResponse<CustomField>>;

  /**
   * Delete a field from a custom object
   */
  deleteField(projectId: string, objectId: string, fieldId: string): Promise<RepositoryResponse<boolean>>;
}

declare const projectRepository: ProjectRepository;
export default projectRepository;
