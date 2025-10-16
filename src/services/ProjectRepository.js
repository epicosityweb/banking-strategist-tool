import LocalStorageAdapter from './adapters/LocalStorageAdapter';
import SupabaseAdapter from './adapters/SupabaseAdapter';
import validationService from './ValidationService';
import errorTracker from './errorTracking';

/**
 * Project Repository
 *
 * Central service for all project data operations. This provides a single
 * interface for components to interact with project data, abstracting away
 * the underlying storage mechanism (localStorage, Supabase, etc.).
 *
 * This repository implements:
 * - Adapter pattern for storage flexibility
 * - Error handling and recovery
 * - Data validation using Zod schemas
 * - Referential integrity checks
 * - Optimistic updates (for async operations)
 *
 * Usage:
 * ```js
 * import { projectRepository } from './services/ProjectRepository';
 *
 * const { data, error } = await projectRepository.getAllProjects();
 * if (error) {
 *   // Handle error
 * } else {
 *   // Use data
 * }
 * ```
 */
class ProjectRepository {
  constructor(adapter, validator = validationService) {
    this.adapter = adapter;
    this.validator = validator;
  }

  /**
   * Switch to a different storage adapter
   * Useful for migrating from localStorage to Supabase
   */
  setAdapter(adapter) {
    this.adapter = adapter;
  }

  /**
   * Get all projects
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async getAllProjects() {
    return await this.adapter.getAllProjects();
  }

  /**
   * Get a single project by ID
   * @param {string} projectId - Project UUID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getProject(projectId) {
    return await this.adapter.getProject(projectId);
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<{data: Object|null, error: Error|null, validationErrors: Array}>}
   */
  async createProject(projectData) {
    // Validate data model if present
    if (projectData.dataModel) {
      const validation = this.validator.validateDataModel(projectData.dataModel);
      if (!validation.valid) {
        return {
          data: null,
          error: new Error('Data model validation failed'),
          validationErrors: validation.errors,
        };
      }

      // Check referential integrity
      const integrityCheck = this.validator.validateReferentialIntegrity(
        projectData.dataModel
      );
      if (!integrityCheck.valid) {
        return {
          data: null,
          error: new Error('Referential integrity check failed'),
          validationErrors: integrityCheck.errors,
        };
      }
    }

    return await this.adapter.createProject(projectData);
  }

  /**
   * Update an existing project
   * @param {string} projectId - Project UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{data: Object|null, error: Error|null, validationErrors: Array}>}
   */
  async updateProject(projectId, updates) {
    // Validate data model if present in updates
    if (updates.dataModel) {
      const validation = this.validator.validateDataModel(updates.dataModel);
      if (!validation.valid) {
        return {
          data: null,
          error: new Error('Data model validation failed'),
          validationErrors: validation.errors,
        };
      }

      // Check referential integrity
      const integrityCheck = this.validator.validateReferentialIntegrity(
        updates.dataModel
      );
      if (!integrityCheck.valid) {
        return {
          data: null,
          error: new Error('Referential integrity check failed'),
          validationErrors: integrityCheck.errors,
        };
      }
    }

    return await this.adapter.updateProject(projectId, updates);
  }

  /**
   * Delete a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async deleteProject(projectId) {
    return await this.adapter.deleteProject(projectId);
  }

  /**
   * Add a custom object to a project's data model
   * @param {string} projectId - Project UUID
   * @param {Object} objectData - Custom object data
   * @returns {Promise<{data: Object|null, error: Error|null, validationErrors: Array}>}
   */
  async addCustomObject(projectId, objectData) {
    // Validate the custom object
    const validation = this.validator.validateCustomObject(objectData);
    if (!validation.valid) {
      return {
        data: null,
        error: new Error('Custom object validation failed'),
        validationErrors: validation.errors,
      };
    }

    // Get existing project to check for duplicate names
    const { data: project, error: fetchError } = await this.adapter.getProject(
      projectId
    );
    if (fetchError) {
      return { data: null, error: fetchError };
    }

    const existingObjects = project.dataModel?.objects || [];
    if (
      !this.validator.isObjectNameUnique(
        objectData.name,
        objectData.id,
        existingObjects
      )
    ) {
      return {
        data: null,
        error: new Error('An object with this name already exists'),
        validationErrors: [
          {
            field: 'name',
            message: 'An object with this name already exists in this project',
          },
        ],
      };
    }

    // Normalize date fields before saving
    const normalized = this.validator.normalizeDateFields(validation.data);

    return await this.adapter.addCustomObject(projectId, normalized);
  }

  /**
   * Update a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateCustomObject(projectId, objectId, updates) {
    return await this.adapter.updateCustomObject(projectId, objectId, updates);
  }

  /**
   * Delete a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async deleteCustomObject(projectId, objectId) {
    return await this.adapter.deleteCustomObject(projectId, objectId);
  }

  /**
   * Add a field to a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @param {Object} fieldData - Field data
   * @returns {Promise<{data: Object|null, error: Error|null, validationErrors: Array}>}
   */
  async addField(projectId, objectId, fieldData) {
    // Get existing project and object to validate against existing fields
    const { data: project, error: fetchError } = await this.adapter.getProject(
      projectId
    );
    if (fetchError) {
      return { data: null, error: fetchError };
    }

    const object = project.dataModel?.objects?.find((o) => o.id === objectId);
    if (!object) {
      return {
        data: null,
        error: new Error(`Object not found: ${objectId}`),
      };
    }

    const existingFields = object.fields || [];

    // Validate the field
    const validation = this.validator.validateField(fieldData, existingFields);
    if (!validation.valid) {
      return {
        data: null,
        error: new Error('Field validation failed'),
        validationErrors: validation.errors,
      };
    }

    // Normalize date fields before saving
    const normalized = this.validator.normalizeDateFields(validation.data);

    return await this.adapter.addField(projectId, objectId, normalized);
  }

  /**
   * Update a field in a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @param {string} fieldId - Field UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{data: Object|null, error: Error|null, validationErrors: Array}>}
   */
  async updateField(projectId, objectId, fieldId, updates) {
    // Get existing project and object to validate against existing fields
    const { data: project, error: fetchError } = await this.adapter.getProject(
      projectId
    );
    if (fetchError) {
      return { data: null, error: fetchError };
    }

    const object = project.dataModel?.objects?.find((o) => o.id === objectId);
    if (!object) {
      return {
        data: null,
        error: new Error(`Object not found: ${objectId}`),
      };
    }

    const existingFields = object.fields || [];

    // Merge existing field data with updates for validation
    const existingField = existingFields.find((f) => f.id === fieldId);
    if (!existingField) {
      return {
        data: null,
        error: new Error(`Field not found: ${fieldId}`),
      };
    }

    const updatedField = { ...existingField, ...updates, id: fieldId };

    // Validate the updated field
    const validation = this.validator.validateField(updatedField, existingFields);
    if (!validation.valid) {
      return {
        data: null,
        error: new Error('Field validation failed'),
        validationErrors: validation.errors,
      };
    }

    // Normalize date fields
    const normalized = this.validator.normalizeDateFields(validation.data);

    return await this.adapter.updateField(projectId, objectId, fieldId, normalized);
  }

  /**
   * Delete a field from a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @param {string} fieldId - Field UUID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async deleteField(projectId, objectId, fieldId) {
    return await this.adapter.deleteField(projectId, objectId, fieldId);
  }

  /**
   * Duplicate a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID to duplicate
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async duplicateCustomObject(projectId, objectId) {
    return await this.adapter.duplicateCustomObject(projectId, objectId);
  }
}

/**
 * Adapter Factory
 *
 * Creates the appropriate storage adapter based on configuration.
 * Defaults to localStorage for backward compatibility.
 *
 * Note: Injects errorTracker into SupabaseAdapter for testability
 * and separation of concerns (Dependency Inversion Principle).
 */
function createAdapter() {
  const adapterType = import.meta.env.VITE_STORAGE_ADAPTER || 'localStorage';

  switch (adapterType.toLowerCase()) {
    case 'supabase':
      // Inject error tracker dependency for testability
      return new SupabaseAdapter(undefined, errorTracker);
    case 'localstorage':
    default:
      return new LocalStorageAdapter();
  }
}

// Create and export a singleton instance with configured adapter
const projectRepository = new ProjectRepository(createAdapter());

export { projectRepository, ProjectRepository, createAdapter };
export default projectRepository;
