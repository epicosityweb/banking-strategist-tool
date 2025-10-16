import IStorageAdapter from './IStorageAdapter';
import { generateId } from '../../utils/idGenerator';
import { supabase } from '../../lib/supabase';
import { customObjectSchema, fieldSchema as customFieldSchema } from '../../schemas/objectSchema';
import {
  tagCategorySchema,
  tagBehaviorSchema,
  qualificationRulesSchema,
} from '../../schemas/tagSchema';
import { z } from 'zod';

// Storage-compatible tag schema (dates as ISO strings)
// Based on tagSchema but adapted for JSONB storage
const storageTagSchema = z.object({
  id: z.string().min(1, 'Tag ID is required'),
  name: z.string().min(2).max(100),
  category: tagCategorySchema,
  description: z.string().min(10).max(500),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  behavior: tagBehaviorSchema,
  isPermanent: z.boolean(),
  qualificationRules: qualificationRulesSchema,
  dependencies: z.array(z.string()).optional().default([]),
  isCustom: z.boolean().default(false),
  createdAt: z.union([z.date(), z.string().datetime()]).optional(), // Accept Date or ISO 8601 string
  updatedAt: z.union([z.date(), z.string().datetime()]).optional(), // Accept Date or ISO 8601 string
});

// Project schema for validation
// Must match TypeScript Project interface (src/types/project.ts)
const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required'),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  clientProfile: z.record(z.any()).optional(),
  dataModel: z.object({
    objects: z.array(z.any()).optional(),
    fields: z.array(z.any()).optional(),      // Added to match DataModel interface
    mappings: z.array(z.any()).optional(),    // Added to match DataModel interface
    associations: z.array(z.any()).optional(),
  }).optional(),
  tags: z.object({                            // Changed from array to object to match TagCollection interface
    library: z.array(storageTagSchema),       // Validate using storage-compatible tag schema
    custom: z.array(storageTagSchema),        // Validate using storage-compatible tag schema
  }).optional(),
  journeys: z.array(z.any()).optional(),
  createdAt: z.string().optional(),
  savedAt: z.string().optional(),
});

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
  constructor(supabaseClient = supabase, errorTracker = null) {
    super();
    this.supabase = supabaseClient;

    // Inject error tracker as dependency (Dependency Inversion Principle)
    // Falls back to no-op when not provided
    this.errorTracker = errorTracker || {
      captureException: () => {
        // No-op fallback when error tracker not configured
        // Allows code to work without throwing errors
      }
    };

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
   * Validate tag array and filter out invalid tags with warnings
   * Provides defensive validation when loading tags from database
   * @private
   * @param {Array} tags - Tags to validate
   * @param {string} arrayName - 'library' or 'custom' for error context
   * @returns {Array} Valid tags only
   */
  _validateTagArray(tags, arrayName) {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags.filter((tag, index) => {
      const validation = storageTagSchema.safeParse(tag);

      if (!validation.success) {
        // Environment-specific logging to prevent information disclosure
        if (process.env.NODE_ENV === 'development') {
          // Development: detailed errors for debugging
          console.warn(
            `Invalid ${arrayName} tag (id: ${tag?.id || 'unknown'}):`,
            validation.error.errors
          );
        } else {
          // Production: generic message only
          console.warn(
            `Data validation issue detected. Tag will be skipped.`
          );
        }

        // Log to error tracking service (injected dependency)
        // Sanitized: Only non-sensitive metadata
        this.errorTracker.captureException(
          new Error(`Invalid tag schema in ${arrayName}`),
          {
            extra: {
              // Safe metadata only
              arrayName,
              errorCount: validation.error.errors?.length || 0,
              errorFields: validation.error.errors?.map(e => e.path.join('.')).slice(0, 5) || [],
              // DO NOT INCLUDE: tagId, tagName, or full validation.error.format()
            },
            fingerprint: ['invalid-tag-schema', arrayName],
          }
        );

        return false; // Exclude invalid tag from results
      }

      return true; // Include valid tag
    });
  }

  /**
   * Check if user has permission to access/modify a project
   * @private
   * @param {string} userId - Current user ID
   * @param {string} projectId - Project ID to check
   * @param {string} requiredRole - Required role: 'viewer', 'editor', or 'owner'
   * @returns {Promise<boolean>} True if user has permission
   */
  async _checkProjectPermission(userId, projectId, requiredRole = 'viewer') {
    try {
      // Get project to check ownership
      const { data: project, error: projectError } = await this.supabase
        .from('implementations')
        .select('owner_id')
        .eq('id', projectId)
        .single();

      if (projectError) {
        return false;
      }

      // Owner has all permissions
      if (project.owner_id === userId) {
        return true;
      }

      // Check project_permissions table for shared access
      const { data: permission, error: permissionError } = await this.supabase
        .from('project_permissions')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (permissionError || !permission) {
        return false;
      }

      // Map roles to permission levels
      const roleHierarchy = {
        viewer: 1,
        editor: 2,
        owner: 3,
      };

      const userLevel = roleHierarchy[permission.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      return userLevel >= requiredLevel;
    } catch (error) {
      console.error('Error checking project permission:', error);
      return false;
    }
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
        dataModel: row.data?.dataModel || { objects: [], fields: [], mappings: [], associations: [] },
        tags: {
          library: this._validateTagArray(row.data?.tags?.library || [], 'library'),
          custom: this._validateTagArray(row.data?.tags?.custom || [], 'custom'),
        },
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
        dataModel: data.data?.dataModel || { objects: [], fields: [], mappings: [], associations: [] },
        tags: {
          library: this._validateTagArray(data.data?.tags?.library || [], 'library'),
          custom: this._validateTagArray(data.data?.tags?.custom || [], 'custom'),
        },
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
      // Server-side validation
      const validation = projectSchema.safeParse(projectData);
      if (!validation.success) {
        return {
          data: null,
          error: new Error(`Validation failed: ${validation.error.message}`),
        };
      }

      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) {
        return { data: null, error: authError };
      }

      const projectId = projectData.id || generateId();

      const insertData = {
        id: projectId,
        owner_id: userId,
        name: projectData.name,
        status: projectData.status || 'draft',
        data: {
          clientProfile: projectData.clientProfile || {},
          dataModel: projectData.dataModel || { objects: [], fields: [], mappings: [], associations: [] },
          tags: projectData.tags || { library: [], custom: [] },
          journeys: projectData.journeys || [],
        },
      };

      const { data, error } = await this.supabase
        .from('implementations')
        .insert(insertData)
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
        dataModel: data.data?.dataModel || { objects: [], fields: [], mappings: [], associations: [] },
        tags: data.data?.tags || { library: [], custom: [] },
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
      // Server-side validation for updates (partial validation)
      const validation = projectSchema.partial().safeParse(updates);
      if (!validation.success) {
        return {
          data: null,
          error: new Error(`Validation failed: ${validation.error.message}`),
        };
      }

      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      // Authorization check: user must have editor role or be owner
      const hasPermission = await this._checkProjectPermission(userId, projectId, 'editor');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: You do not have permission to edit this project'),
        };
      }

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
        dataModel: data.data?.dataModel || { objects: [], fields: [], mappings: [], associations: [] },
        tags: data.data?.tags || { library: [], custom: [] },
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

      // Authorization check: only owner can delete project
      const hasPermission = await this._checkProjectPermission(userId, projectId, 'owner');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: Only the project owner can delete this project'),
        };
      }

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
      // Server-side validation
      const validation = customObjectSchema.safeParse(objectData);
      if (!validation.success) {
        return {
          data: null,
          error: new Error(`Validation failed: ${validation.error.message}`),
        };
      }

      // Authorization check
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const hasPermission = await this._checkProjectPermission(userId, projectId, 'editor');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: You do not have permission to modify this project'),
        };
      }

      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const newObject = {
        id: objectData.id || generateId(),
        ...objectData,
        fields: objectData.fields || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const dataModel = project.dataModel || { objects: [], fields: [], mappings: [], associations: [] };
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
      // Authorization check
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const hasPermission = await this._checkProjectPermission(userId, projectId, 'editor');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: You do not have permission to modify this project'),
        };
      }

      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], fields: [], mappings: [], associations: [] };
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
      // Authorization check
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const hasPermission = await this._checkProjectPermission(userId, projectId, 'editor');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: You do not have permission to modify this project'),
        };
      }

      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], fields: [], mappings: [], associations: [] };
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
      // Server-side validation
      const validation = customFieldSchema.safeParse(fieldData);
      if (!validation.success) {
        return {
          data: null,
          error: new Error(`Validation failed: ${validation.error.message}`),
        };
      }

      // Authorization check
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const hasPermission = await this._checkProjectPermission(userId, projectId, 'editor');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: You do not have permission to modify this project'),
        };
      }

      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], fields: [], mappings: [], associations: [] };
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
      // Authorization check
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const hasPermission = await this._checkProjectPermission(userId, projectId, 'editor');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: You do not have permission to modify this project'),
        };
      }

      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], fields: [], mappings: [], associations: [] };
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
      // Authorization check
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const hasPermission = await this._checkProjectPermission(userId, projectId, 'editor');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: You do not have permission to modify this project'),
        };
      }

      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], fields: [], mappings: [], associations: [] };
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
      // Authorization check
      const { userId, error: authError } = await this._getCurrentUserId();
      if (authError) return { data: null, error: authError };

      const hasPermission = await this._checkProjectPermission(userId, projectId, 'editor');
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Unauthorized: You do not have permission to modify this project'),
        };
      }

      const { data: project, error } = await this.getProject(projectId);
      if (error) return { data: null, error };

      const dataModel = project.dataModel || { objects: [], fields: [], mappings: [], associations: [] };
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
