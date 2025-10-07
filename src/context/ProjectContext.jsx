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

    case 'SAVE_PROJECT':
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
