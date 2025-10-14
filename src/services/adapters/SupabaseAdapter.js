import IStorageAdapter from './IStorageAdapter';
import { generateId } from '../../utils/idGenerator';
import { supabase } from '../../lib/supabase';

/**
 * Supabase Adapter
 *
 * Implements the storage adapter interface using Supabase backend.
 * This provides cloud persistence with PostgreSQL, authentication,
 * and Row Level Security for multi-user support.
 *
 * Database table: implementations
 * - id: UUID (primary key)
 * - owner_id: UUID (foreign key to auth.users)
 * - name: TEXT
 * - status: TEXT
 * - data: JSONB (contains clientProfile, dataModel, tags, journeys)
 * - created_at: TIMESTAMPTZ
 * - updated_at: TIMESTAMPTZ
 *
 * Database table: project_permissions
 * - id: UUID (primary key)
 * - project_id: UUID (foreign key to implementations)
 * - user_id: UUID (foreign key to auth.users)
 * - role: TEXT ('owner', 'editor', 'viewer')
 * - created_at: TIMESTAMPTZ
 * - updated_at: TIMESTAMPTZ
 */
class SupabaseAdapter extends IStorageAdapter {
  constructor(supabaseClient = supabase) {
    super();
    this.supabase = supabaseClient;

    if (!this.supabase) {
      throw new Error(
        'SupabaseAdapter requires a Supabase client instance. ' +
          'Ensure Supabase is properly configured in src/lib/supabase.js'
      );
    }
  }

  /**
   * Helper to get current user ID
   * Checks for valid session first before getting user
   * @private
   */
  async _getCurrentUserId() {
    // First check if we have a valid session
    const {
      data: { session },
      error: sessionError,
    } = await this.supabase.auth.getSession();

    if (sessionError) {
      return {
        userId: null,
        error: new Error('Session error: ' + sessionError.message),
      };
    }

    if (!session) {
      return {
        userId: null,
        error: new Error('No active session. Please log in.'),
      };
    }

    // If we have a session, get the user
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error || !user) {
      return {
        userId: null,
        error: new Error('User not authenticated: ' + (error?.message || 'Unknown error')),
      };
    }

    return { userId: user.id, error: null };
  }

  /**
   * Get all projects (all authenticated users can see all projects)
   */
  async getAllProjects() {
    try {
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const { data, error } = await this.supabase
        .from('implementations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      // Transform Supabase format to app format
      const projects = data.map((row) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        clientProfile: row.data?.clientProfile || {},
        dataModel: row.data?.dataModel || { objects: [], associations: [] },
        tags: row.data?.tags || [],
        journeys: row.data?.journeys || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

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
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const { data, error } = await this.supabase
        .from('implementations')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Transform Supabase format to app format
      const project = {
        id: data.id,
        name: data.name,
        status: data.status,
        clientProfile: data.data?.clientProfile || {},
        dataModel: data.data?.dataModel || { objects: [], associations: [] },
        tags: data.data?.tags || [],
        journeys: data.data?.journeys || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

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
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const projectId = projectData.id || generateId();

      const { data, error } = await this.supabase
        .from('implementations')
        .insert({
          id: projectId,
          owner_id: userId,
          name: projectData.name,
          status: projectData.status || 'draft',
          data: {
            clientProfile: projectData.clientProfile || {},
            dataModel: projectData.dataModel || { objects: [], associations: [] },
            tags: projectData.tags || [],
            journeys: projectData.journeys || [],
          },
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Transform to app format
      const newProject = {
        id: data.id,
        name: data.name,
        status: data.status,
        clientProfile: data.data?.clientProfile || {},
        dataModel: data.data?.dataModel || { objects: [], associations: [] },
        tags: data.data?.tags || [],
        journeys: data.data?.journeys || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

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
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      // Get existing project first
      const { data: existing, error: fetchError } = await this.getProject(projectId);
      if (fetchError) return { data: null, error: fetchError };

      // Merge updates with existing data
      const updatedData = {
        clientProfile: updates.clientProfile || existing.clientProfile,
        dataModel: updates.dataModel || existing.dataModel,
        tags: updates.tags || existing.tags,
        journeys: updates.journeys || existing.journeys,
      };

      const { data, error } = await this.supabase
        .from('implementations')
        .update({
          name: updates.name !== undefined ? updates.name : existing.name,
          status: updates.status !== undefined ? updates.status : existing.status,
          data: updatedData,
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Transform to app format
      const updatedProject = {
        id: data.id,
        name: data.name,
        status: data.status,
        clientProfile: data.data?.clientProfile || {},
        dataModel: data.data?.dataModel || { objects: [], associations: [] },
        tags: data.data?.tags || [],
        journeys: data.data?.journeys || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return { data: updatedProject, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    try {
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      // Get project before deleting
      const { data: existing, error: fetchError } = await this.getProject(projectId);
      if (fetchError) return { data: null, error: fetchError };

      const { error } = await this.supabase
        .from('implementations')
        .delete()
        .eq('id', projectId);

      if (error) {
        return { data: null, error };
      }

      return { data: existing, error: null };
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

      dataModel.objects[objectIndex] = {
        ...dataModel.objects[objectIndex],
        ...updates,
        id: objectId,
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
      dataModel.objects.splice(objectIndex, 1);

      // Remove associations
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

      object.fields[fieldIndex] = {
        ...object.fields[fieldIndex],
        ...updates,
        id: fieldId,
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

export default SupabaseAdapter;
