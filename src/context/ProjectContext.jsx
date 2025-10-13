import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
};

function projectReducer(state, action) {
  switch (action.type) {
    case 'LOAD_PROJECTS':
      return { ...state, projects: action.payload };

    case 'CREATE_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
        currentProject: action.payload.id,
      };

    case 'LOAD_PROJECT':
      return {
        ...state,
        currentProject: action.payload.id,
        clientProfile: action.payload.clientProfile || initialState.clientProfile,
        dataModel: action.payload.dataModel || initialState.dataModel,
        tags: action.payload.tags || initialState.tags,
        journeys: action.payload.journeys || [],
      };

    case 'UPDATE_CLIENT_PROFILE':
      return {
        ...state,
        clientProfile: { ...state.clientProfile, ...action.payload },
        savedAt: new Date().toISOString(),
      };

    case 'UPDATE_DATA_MODEL':
      return {
        ...state,
        dataModel: { ...state.dataModel, ...action.payload },
        savedAt: new Date().toISOString(),
      };

    case 'UPDATE_TAGS':
      return {
        ...state,
        tags: { ...state.tags, ...action.payload },
        savedAt: new Date().toISOString(),
      };

    case 'UPDATE_JOURNEYS':
      return {
        ...state,
        journeys: action.payload,
        savedAt: new Date().toISOString(),
      };

    case 'ADD_OBJECT':
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: [...(state.dataModel.objects || []), action.payload],
        },
        savedAt: new Date().toISOString(),
      };

    case 'UPDATE_OBJECT':
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).map(obj =>
            obj.id === action.payload.id ? action.payload : obj
          ),
        },
        savedAt: new Date().toISOString(),
      };

    case 'DELETE_OBJECT': {
      const objectId = action.payload.objectId;
      const cascade = action.payload.cascade;
      let updatedDataModel = { ...state.dataModel };

      // Remove the object
      updatedDataModel.objects = (state.dataModel.objects || []).filter(
        obj => obj.id !== objectId
      );

      if (cascade) {
        // Remove associated mappings
        if (state.dataModel.mappings) {
          updatedDataModel.mappings = state.dataModel.mappings.filter(
            mapping => mapping.targetObjectId !== objectId
          );
        }

        // Remove associations (both from and to)
        if (state.dataModel.associations) {
          updatedDataModel.associations = state.dataModel.associations.filter(
            assoc => assoc.fromObjectId !== objectId && assoc.toObjectId !== objectId
          );
        }
      }

      return {
        ...state,
        dataModel: updatedDataModel,
        savedAt: new Date().toISOString(),
      };
    }

    case 'DUPLICATE_OBJECT': {
      const objectToDuplicate = (state.dataModel.objects || []).find(
        obj => obj.id === action.payload
      );

      if (!objectToDuplicate) return state;

      // Generate new ID for duplicate
      const generateId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      };

      const duplicatedObject = {
        ...objectToDuplicate,
        id: generateId(),
        name: `${objectToDuplicate.name}_copy`,
        label: `${objectToDuplicate.label} (Copy)`,
        apiName: `${objectToDuplicate.apiName}_copy`,
        fields: objectToDuplicate.fields?.map(field => ({
          ...field,
          id: generateId(),
        })) || [],
        associations: [], // Don't copy associations
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: [...(state.dataModel.objects || []), duplicatedObject],
        },
        savedAt: new Date().toISOString(),
      };
    }

    case 'ADD_FIELD': {
      const { objectId, field } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).map(obj =>
            obj.id === objectId
              ? { ...obj, fields: [...(obj.fields || []), field], updatedAt: new Date() }
              : obj
          ),
        },
        savedAt: new Date().toISOString(),
      };
    }

    case 'UPDATE_FIELD': {
      const { objectId, field } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).map(obj =>
            obj.id === objectId
              ? {
                  ...obj,
                  fields: (obj.fields || []).map(f => f.id === field.id ? field : f),
                  updatedAt: new Date(),
                }
              : obj
          ),
        },
        savedAt: new Date().toISOString(),
      };
    }

    case 'DELETE_FIELD': {
      const { objectId, fieldId } = action.payload;
      return {
        ...state,
        dataModel: {
          ...state.dataModel,
          objects: (state.dataModel.objects || []).map(obj =>
            obj.id === objectId
              ? {
                  ...obj,
                  fields: (obj.fields || []).filter(f => f.id !== fieldId),
                  updatedAt: new Date(),
                }
              : obj
          ),
        },
        savedAt: new Date().toISOString(),
      };
    }

    case 'SAVE_PROJECT': {
      // Save to localStorage
      const projectData = {
        id: state.currentProject,
        clientProfile: state.clientProfile,
        dataModel: state.dataModel,
        tags: state.tags,
        journeys: state.journeys,
        savedAt: new Date().toISOString(),
      };

      const projects = state.projects.map(p =>
        p.id === state.currentProject ? { ...p, ...projectData } : p
      );

      localStorage.setItem('strategist-projects', JSON.stringify(projects));

      return {
        ...state,
        projects,
        savedAt: projectData.savedAt,
      };
    }

    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Load projects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('strategist-projects');
    if (saved) {
      try {
        const projects = JSON.parse(saved);
        dispatch({ type: 'LOAD_PROJECTS', payload: projects });
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    }
  }, []);

  // Auto-save every 30 seconds if there's a current project
  useEffect(() => {
    if (!state.currentProject) return;

    const interval = setInterval(() => {
      dispatch({ type: 'SAVE_PROJECT' });
    }, 30000);

    return () => clearInterval(interval);
  }, [state.currentProject]);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
