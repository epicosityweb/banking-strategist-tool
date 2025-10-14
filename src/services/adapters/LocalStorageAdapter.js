import IStorageAdapter from './IStorageAdapter';
import { generateId } from '../../utils/idGenerator';

/**
 * LocalStorage Adapter
 *
 * Implements the storage adapter interface using browser localStorage.
 * This maintains backward compatibility with the existing implementation
 * while providing a clean migration path to Supabase.
 */
class LocalStorageAdapter extends IStorageAdapter {
  constructor() {
    super();
    this.storageKey = 'strategist-projects';
  }

  /**
   * Helper to safely read from localStorage
   * @private
   */
  _readStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return [];
    }
  }

  /**
   * Helper to safely write to localStorage
   * @private
   */
  _writeStorage(projects) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
      return { data: true, error: null };
    } catch (error) {
      console.error('Failed to write to localStorage:', error);
      return { data: null, error };
    }
  }

  /**
   * Helper to find project index
   * @private
   */
  _findProjectIndex(projects, projectId) {
    return projects.findIndex((p) => p.id === projectId);
  }

  /**
   * Get all projects
   */
  async getAllProjects() {
    try {
      const projects = this._readStorage();
      return { data: projects, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId) {
    try {
      const projects = this._readStorage();
      const project = projects.find((p) => p.id === projectId);

      if (!project) {
        return {
          data: null,
          error: new Error(`Project not found: ${projectId}`),
        };
      }

      return { data: project, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData) {
    try {
      const projects = this._readStorage();

      const newProject = {
        id: projectData.id || generateId(),
        name: projectData.name,
        status: projectData.status || 'draft',
        clientProfile: projectData.clientProfile || {},
        dataModel: projectData.dataModel || { objects: [], associations: [] },
        tags: projectData.tags || [],
        journeys: projectData.journeys || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      projects.push(newProject);

      const writeResult = this._writeStorage(projects);
      if (writeResult.error) {
        return writeResult;
      }

      return { data: newProject, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId, updates) {
    try {
      const projects = this._readStorage();
      const index = this._findProjectIndex(projects, projectId);

      if (index === -1) {
        return {
          data: null,
          error: new Error(`Project not found: ${projectId}`),
        };
      }

      // Merge updates with existing project
      projects[index] = {
        ...projects[index],
        ...updates,
        id: projectId, // Prevent ID from being changed
        updatedAt: new Date().toISOString(),
      };

      const writeResult = this._writeStorage(projects);
      if (writeResult.error) {
        return writeResult;
      }

      return { data: projects[index], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    try {
      const projects = this._readStorage();
      const index = this._findProjectIndex(projects, projectId);

      if (index === -1) {
        return {
          data: null,
          error: new Error(`Project not found: ${projectId}`),
        };
      }

      const deletedProject = projects[index];
      projects.splice(index, 1);

      const writeResult = this._writeStorage(projects);
      if (writeResult.error) {
        return writeResult;
      }

      return { data: deletedProject, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Add a custom object to a project's data model
   */
  async addCustomObject(projectId, objectData) {
    try {
      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const newObject = {
        id: objectData.id || generateId(),
        ...objectData,
        fields: objectData.fields || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const dataModel = project.dataModel || { objects: [], associations: [] };
      dataModel.objects = [...dataModel.objects, newObject];

      const updateResult = await this.updateProject(projectId, { dataModel });
      if (updateResult.error) {
        return updateResult;
      }

      return { data: newObject, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update a custom object
   */
  async updateCustomObject(projectId, objectId, updates) {
    try {
      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], associations: [] };
      const objectIndex = dataModel.objects.findIndex((o) => o.id === objectId);

      if (objectIndex === -1) {
        return {
          data: null,
          error: new Error(`Object not found: ${objectId}`),
        };
      }

      // Merge updates
      dataModel.objects[objectIndex] = {
        ...dataModel.objects[objectIndex],
        ...updates,
        id: objectId, // Prevent ID from being changed
        updatedAt: new Date().toISOString(),
      };

      const updateResult = await this.updateProject(projectId, { dataModel });
      if (updateResult.error) {
        return updateResult;
      }

      return { data: dataModel.objects[objectIndex], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a custom object
   */
  async deleteCustomObject(projectId, objectId) {
    try {
      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], associations: [] };
      const objectIndex = dataModel.objects.findIndex((o) => o.id === objectId);

      if (objectIndex === -1) {
        return {
          data: null,
          error: new Error(`Object not found: ${objectId}`),
        };
      }

      const deletedObject = dataModel.objects[objectIndex];

      // Remove object
      dataModel.objects.splice(objectIndex, 1);

      // Remove associations involving this object
      dataModel.associations = dataModel.associations.filter(
        (assoc) => assoc.fromObjectId !== objectId && assoc.toObjectId !== objectId
      );

      const updateResult = await this.updateProject(projectId, { dataModel });
      if (updateResult.error) {
        return updateResult;
      }

      return { data: deletedObject, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Add a field to a custom object
   */
  async addField(projectId, objectId, fieldData) {
    try {
      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], associations: [] };
      const object = dataModel.objects.find((o) => o.id === objectId);

      if (!object) {
        return {
          data: null,
          error: new Error(`Object not found: ${objectId}`),
        };
      }

      const newField = {
        id: fieldData.id || generateId(),
        ...fieldData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      object.fields = [...(object.fields || []), newField];
      object.updatedAt = new Date().toISOString();

      const updateResult = await this.updateProject(projectId, { dataModel });
      if (updateResult.error) {
        return updateResult;
      }

      return { data: newField, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update a field in a custom object
   */
  async updateField(projectId, objectId, fieldId, updates) {
    try {
      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], associations: [] };
      const object = dataModel.objects.find((o) => o.id === objectId);

      if (!object) {
        return {
          data: null,
          error: new Error(`Object not found: ${objectId}`),
        };
      }

      const fieldIndex = (object.fields || []).findIndex((f) => f.id === fieldId);

      if (fieldIndex === -1) {
        return {
          data: null,
          error: new Error(`Field not found: ${fieldId}`),
        };
      }

      // Merge updates
      object.fields[fieldIndex] = {
        ...object.fields[fieldIndex],
        ...updates,
        id: fieldId, // Prevent ID from being changed
        updatedAt: new Date().toISOString(),
      };

      object.updatedAt = new Date().toISOString();

      const updateResult = await this.updateProject(projectId, { dataModel });
      if (updateResult.error) {
        return updateResult;
      }

      return { data: object.fields[fieldIndex], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a field from a custom object
   */
  async deleteField(projectId, objectId, fieldId) {
    try {
      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], associations: [] };
      const object = dataModel.objects.find((o) => o.id === objectId);

      if (!object) {
        return {
          data: null,
          error: new Error(`Object not found: ${objectId}`),
        };
      }

      const fieldIndex = (object.fields || []).findIndex((f) => f.id === fieldId);

      if (fieldIndex === -1) {
        return {
          data: null,
          error: new Error(`Field not found: ${fieldId}`),
        };
      }

      const deletedField = object.fields[fieldIndex];
      object.fields.splice(fieldIndex, 1);
      object.updatedAt = new Date().toISOString();

      const updateResult = await this.updateProject(projectId, { dataModel });
      if (updateResult.error) {
        return updateResult;
      }

      return { data: deletedField, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Duplicate a custom object
   */
  async duplicateCustomObject(projectId, objectId) {
    try {
      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], associations: [] };
      const object = dataModel.objects.find((o) => o.id === objectId);

      if (!object) {
        return {
          data: null,
          error: new Error(`Object not found: ${objectId}`),
        };
      }

      // Create a deep copy with new IDs
      const duplicateObject = {
        ...object,
        id: generateId(),
        name: `${object.name}_copy`,
        label: `${object.label} (Copy)`,
        fields: (object.fields || []).map((field) => ({
          ...field,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return await this.addCustomObject(projectId, duplicateObject);
    } catch (error) {
      return { data: null, error };
    }
  }
}

export default LocalStorageAdapter;
