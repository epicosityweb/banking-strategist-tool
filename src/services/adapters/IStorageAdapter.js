/**
 * Storage Adapter Interface
 *
 * Defines the contract that all storage adapters must implement.
 * This allows switching between localStorage, Supabase, or other backends
 * without changing business logic.
 */

/**
 * @typedef {Object} ProjectData
 * @property {string} id - Project UUID
 * @property {string} name - Project name
 * @property {Object} clientProfile - Client profile data
 * @property {Object} dataModel - Data model with objects and fields
 * @property {Array} tags - Project tags
 * @property {Array} journeys - Journey definitions
 * @property {string} status - Project status (draft, active, archived)
 * @property {string} createdAt - ISO 8601 timestamp
 * @property {string} updatedAt - ISO 8601 timestamp
 */

/**
 * @typedef {Object} StorageResult
 * @property {*} data - The result data (null on error)
 * @property {Error|null} error - Error object if operation failed
 */

class IStorageAdapter {
  /**
   * Get all projects for the current user
   * @returns {Promise<StorageResult>}
   */
  async getAllProjects() {
    throw new Error('getAllProjects() must be implemented by adapter');
  }

  /**
   * Get a single project by ID
   * @param {string} projectId - Project UUID
   * @returns {Promise<StorageResult>}
   */
  async getProject(projectId) {
    throw new Error('getProject() must be implemented by adapter');
  }

  /**
   * Create a new project
   * @param {ProjectData} projectData - Project data to create
   * @returns {Promise<StorageResult>}
   */
  async createProject(projectData) {
    throw new Error('createProject() must be implemented by adapter');
  }

  /**
   * Update an existing project
   * @param {string} projectId - Project UUID
   * @param {Partial<ProjectData>} updates - Fields to update
   * @returns {Promise<StorageResult>}
   */
  async updateProject(projectId, updates) {
    throw new Error('updateProject() must be implemented by adapter');
  }

  /**
   * Delete a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<StorageResult>}
   */
  async deleteProject(projectId) {
    throw new Error('deleteProject() must be implemented by adapter');
  }

  /**
   * Add a custom object to a project's data model
   * @param {string} projectId - Project UUID
   * @param {Object} objectData - Custom object data
   * @returns {Promise<StorageResult>}
   */
  async addCustomObject(projectId, objectData) {
    throw new Error('addCustomObject() must be implemented by adapter');
  }

  /**
   * Update a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<StorageResult>}
   */
  async updateCustomObject(projectId, objectId, updates) {
    throw new Error('updateCustomObject() must be implemented by adapter');
  }

  /**
   * Delete a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @returns {Promise<StorageResult>}
   */
  async deleteCustomObject(projectId, objectId) {
    throw new Error('deleteCustomObject() must be implemented by adapter');
  }

  /**
   * Add a field to a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @param {Object} fieldData - Field data
   * @returns {Promise<StorageResult>}
   */
  async addField(projectId, objectId, fieldData) {
    throw new Error('addField() must be implemented by adapter');
  }

  /**
   * Update a field in a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @param {string} fieldId - Field UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<StorageResult>}
   */
  async updateField(projectId, objectId, fieldId, updates) {
    throw new Error('updateField() must be implemented by adapter');
  }

  /**
   * Delete a field from a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID
   * @param {string} fieldId - Field UUID
   * @returns {Promise<StorageResult>}
   */
  async deleteField(projectId, objectId, fieldId) {
    throw new Error('deleteField() must be implemented by adapter');
  }

  /**
   * Duplicate a custom object
   * @param {string} projectId - Project UUID
   * @param {string} objectId - Object UUID to duplicate
   * @returns {Promise<StorageResult>}
   */
  async duplicateCustomObject(projectId, objectId) {
    throw new Error('duplicateCustomObject() must be implemented by adapter');
  }
}

export default IStorageAdapter;
