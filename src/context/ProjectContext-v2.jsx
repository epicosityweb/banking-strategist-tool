import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import projectRepository from '../services/ProjectRepository';

/**
 * Project Context V2
 *
 * Refactored to use the service layer (ProjectRepository) with async operations.
 * This version is ready for Supabase migration while maintaining backward compatibility.
 *
 * Key improvements:
 * - Async operations through service layer
 * - Validation enforcement before saves
 * - Error handling and recovery
 * - Loading states for UI feedback
 * - Optimistic updates for better UX
 */

const ProjectContext = createContext();

const initialState = {
  currentProject: null,
  projects: [],
  clientProfile: {
    basicInfo: {},
    integrationSpecs: {},
  },
  dataModel: {
    objects: [],
    fields: [],
    mappings: [],
    associations: [],
  },
  tags: {
    library: [],
    custom: [],
  },
  journeys: [],
  savedAt: null,
  loading: false,
  error: null,
  validationErrors: [],
};

function projectReducer(state, action) {
  switch (action.type) {
    // Loading states
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };

    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        validationErrors: action.payload.validationErrors || [],
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null, validationErrors: [] };

    // Project loading
    case 'LOAD_PROJECTS':
      return {
        ...state,
        projects: action.payload,
        loading: false,
        error: null,
      };

    case 'CREATE_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
        currentProject: action.payload.id,
        loading: false,
        error: null,
      };

    case 'LOAD_PROJECT':
      return {
        ...state,
        currentProject: action.payload.id,
        clientProfile: action.payload.clientProfile || initialState.clientProfile,
        dataModel: action.payload.dataModel || initialState.dataModel,
        tags: action.payload.tags || initialState.tags,
        journeys: action.payload.journeys || [],
        loading: false,
        error: null,
      };

    case 'UPDATE_PROJECT_IN_LIST':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        currentProject:
          state.currentProject === action.payload ? null : state.currentProject,
        loading: false,
        error: null,
      };

    // Client profile updates
    case 'UPDATE_CLIENT_PROFILE':
      return {
        ...state,
        clientProfile: { ...state.clientProfile, ...action.payload },
      };

    // Data model updates (optimistic)
    case 'ADD_OBJECT':
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: [...(state.dataModel.objects || []), action.payload],
        },
      };

    case 'UPDATE_OBJECT':
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).map((obj) =>
            obj.id === action.payload.id ? action.payload : obj
          ),
        },
      };

    case 'DELETE_OBJECT':
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).filter(
            (obj) => obj.id !== action.payload
          ),
        },
      };

    case 'ADD_FIELD': {
      const { objectId, field } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).map((obj) =>
            obj.id === objectId
              ? { ...obj, fields: [...(obj.fields || []), field] }
              : obj
          ),
        },
      };
    }

    case 'UPDATE_FIELD': {
      const { objectId, field } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).map((obj) =>
            obj.id === objectId
              ? {
                  ...obj,
                  fields: (obj.fields || []).map((f) =>
                    f.id === field.id ? field : f
                  ),
                }
              : obj
          ),
        },
      };
    }

    case 'DELETE_FIELD': {
      const { objectId, fieldId } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).map((obj) =>
            obj.id === objectId
              ? {
                  ...obj,
                  fields: (obj.fields || []).filter((f) => f.id !== fieldId),
                }
              : obj
          ),
        },
      };
    }

    // Tags updates
    case 'UPDATE_TAGS':
      return {
        ...state,
        tags: { ...state.tags, ...action.payload },
      };

    // Journeys updates
    case 'UPDATE_JOURNEYS':
      return {
        ...state,
        journeys: action.payload,
      };

    // Save timestamp
    case 'UPDATE_SAVED_AT':
      return {
        ...state,
        savedAt: action.payload,
      };

    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Load projects from storage on mount
  useEffect(() => {
    const loadProjects = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = await projectRepository.getAllProjects();

      if (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error.message },
        });
      } else {
        dispatch({ type: 'LOAD_PROJECTS', payload: data });
      }
    };

    loadProjects();
  }, []);

  // Auto-save current project every 30 seconds
  useEffect(() => {
    if (!state.currentProject) return;

    const interval = setInterval(() => {
      saveProject();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.currentProject, state.clientProfile, state.dataModel, state.tags, state.journeys]);

  /**
   * Save current project to storage
   */
  const saveProject = useCallback(async () => {
    if (!state.currentProject) return { data: null, error: 'No project selected' };

    const updates = {
      clientProfile: state.clientProfile,
      dataModel: state.dataModel,
      tags: state.tags,
      journeys: state.journeys,
    };

    const { data, error, validationErrors } = await projectRepository.updateProject(
      state.currentProject,
      updates
    );

    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error.message, validationErrors },
      });
      return { data: null, error };
    }

    dispatch({ type: 'UPDATE_SAVED_AT', payload: new Date().toISOString() });
    dispatch({ type: 'UPDATE_PROJECT_IN_LIST', payload: data });

    return { data, error: null };
  }, [state.currentProject, state.clientProfile, state.dataModel, state.tags, state.journeys]);

  /**
   * Create a new project
   */
  const createProject = useCallback(async (projectData) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const { data, error, validationErrors } = await projectRepository.createProject(
      projectData
    );

    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error.message, validationErrors },
      });
      return { data: null, error };
    }

    dispatch({ type: 'CREATE_PROJECT', payload: data });
    return { data, error: null };
  }, []);

  /**
   * Load a project
   */
  const loadProject = useCallback(async (projectId) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const { data, error } = await projectRepository.getProject(projectId);

    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error.message },
      });
      return { data: null, error };
    }

    dispatch({ type: 'LOAD_PROJECT', payload: data });
    return { data, error: null };
  }, []);

  /**
   * Delete a project
   */
  const deleteProject = useCallback(async (projectId) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const { data, error } = await projectRepository.deleteProject(projectId);

    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error.message },
      });
      return { data: null, error };
    }

    dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    return { data, error: null };
  }, []);

  /**
   * Add a custom object
   */
  const addCustomObject = useCallback(
    async (objectData) => {
      if (!state.currentProject) {
        return { data: null, error: 'No project selected' };
      }

      // Optimistic update
      dispatch({ type: 'ADD_OBJECT', payload: objectData });

      const { data, error, validationErrors } =
        await projectRepository.addCustomObject(state.currentProject, objectData);

      if (error) {
        // Rollback optimistic update
        dispatch({ type: 'DELETE_OBJECT', payload: objectData.id });
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error.message, validationErrors },
        });
        return { data: null, error };
      }

      // Update with server data
      dispatch({ type: 'UPDATE_OBJECT', payload: data });
      return { data, error: null };
    },
    [state.currentProject]
  );

  /**
   * Update a custom object
   */
  const updateCustomObject = useCallback(
    async (objectId, updates) => {
      if (!state.currentProject) {
        return { data: null, error: 'No project selected' };
      }

      // Store original for rollback
      const original = state.dataModel.objects?.find((o) => o.id === objectId);

      // Optimistic update
      dispatch({ type: 'UPDATE_OBJECT', payload: { id: objectId, ...updates } });

      const { data, error, validationErrors } =
        await projectRepository.updateCustomObject(
          state.currentProject,
          objectId,
          updates
        );

      if (error) {
        // Rollback optimistic update
        if (original) {
          dispatch({ type: 'UPDATE_OBJECT', payload: original });
        }
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error.message, validationErrors },
        });
        return { data: null, error };
      }

      // Update with server data
      dispatch({ type: 'UPDATE_OBJECT', payload: data });
      return { data, error: null };
    },
    [state.currentProject, state.dataModel.objects]
  );

  /**
   * Delete a custom object
   */
  const deleteCustomObject = useCallback(
    async (objectId) => {
      if (!state.currentProject) {
        return { data: null, error: 'No project selected' };
      }

      // Store original for rollback
      const original = state.dataModel.objects?.find((o) => o.id === objectId);

      // Optimistic update
      dispatch({ type: 'DELETE_OBJECT', payload: objectId });

      const { data, error } = await projectRepository.deleteCustomObject(
        state.currentProject,
        objectId
      );

      if (error) {
        // Rollback optimistic update
        if (original) {
          dispatch({ type: 'ADD_OBJECT', payload: original });
        }
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error.message },
        });
        return { data: null, error };
      }

      return { data, error: null };
    },
    [state.currentProject, state.dataModel.objects]
  );

  /**
   * Duplicate a custom object
   */
  const duplicateCustomObject = useCallback(
    async (objectId) => {
      if (!state.currentProject) {
        return { data: null, error: 'No project selected' };
      }

      const { data, error } = await projectRepository.duplicateCustomObject(
        state.currentProject,
        objectId
      );

      if (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error.message },
        });
        return { data: null, error };
      }

      dispatch({ type: 'ADD_OBJECT', payload: data });
      return { data, error: null };
    },
    [state.currentProject]
  );

  /**
   * Add a field to an object
   */
  const addField = useCallback(
    async (objectId, fieldData) => {
      if (!state.currentProject) {
        return { data: null, error: 'No project selected' };
      }

      // Optimistic update
      dispatch({ type: 'ADD_FIELD', payload: { objectId, field: fieldData } });

      const { data, error, validationErrors } = await projectRepository.addField(
        state.currentProject,
        objectId,
        fieldData
      );

      if (error) {
        // Rollback optimistic update
        dispatch({ type: 'DELETE_FIELD', payload: { objectId, fieldId: fieldData.id } });
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error.message, validationErrors },
        });
        return { data: null, error };
      }

      // Update with server data
      dispatch({ type: 'UPDATE_FIELD', payload: { objectId, field: data } });
      return { data, error: null };
    },
    [state.currentProject]
  );

  /**
   * Update a field
   */
  const updateField = useCallback(
    async (objectId, fieldId, updates) => {
      if (!state.currentProject) {
        return { data: null, error: 'No project selected' };
      }

      // Store original for rollback
      const object = state.dataModel.objects?.find((o) => o.id === objectId);
      const original = object?.fields?.find((f) => f.id === fieldId);

      // Optimistic update
      dispatch({
        type: 'UPDATE_FIELD',
        payload: { objectId, field: { id: fieldId, ...updates } },
      });

      const { data, error, validationErrors } = await projectRepository.updateField(
        state.currentProject,
        objectId,
        fieldId,
        updates
      );

      if (error) {
        // Rollback optimistic update
        if (original) {
          dispatch({ type: 'UPDATE_FIELD', payload: { objectId, field: original } });
        }
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error.message, validationErrors },
        });
        return { data: null, error };
      }

      // Update with server data
      dispatch({ type: 'UPDATE_FIELD', payload: { objectId, field: data } });
      return { data, error: null };
    },
    [state.currentProject, state.dataModel.objects]
  );

  /**
   * Delete a field
   */
  const deleteField = useCallback(
    async (objectId, fieldId) => {
      if (!state.currentProject) {
        return { data: null, error: 'No project selected' };
      }

      // Store original for rollback
      const object = state.dataModel.objects?.find((o) => o.id === objectId);
      const original = object?.fields?.find((f) => f.id === fieldId);

      // Optimistic update
      dispatch({ type: 'DELETE_FIELD', payload: { objectId, fieldId } });

      const { data, error } = await projectRepository.deleteField(
        state.currentProject,
        objectId,
        fieldId
      );

      if (error) {
        // Rollback optimistic update
        if (original) {
          dispatch({ type: 'ADD_FIELD', payload: { objectId, field: original } });
        }
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error.message },
        });
        return { data: null, error };
      }

      return { data, error: null };
    },
    [state.currentProject, state.dataModel.objects]
  );

  const value = {
    state,
    dispatch,
    // Async actions
    saveProject,
    createProject,
    loadProject,
    deleteProject,
    addCustomObject,
    updateCustomObject,
    deleteCustomObject,
    duplicateCustomObject,
    addField,
    updateField,
    deleteField,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
