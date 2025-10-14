/**
 * Test Mocks
 *
 * Mock implementations for testing
 */

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  constructor() {
    this.store = {};
    this.quotaExceeded = false;
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    if (this.quotaExceeded) {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    }
    this.store[key] = value;
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  // Test helper: simulate quota exceeded
  simulateQuotaExceeded() {
    this.quotaExceeded = true;
  }

  // Test helper: restore normal operation
  restoreQuota() {
    this.quotaExceeded = false;
  }

  // Test helper: get all data
  getAllData() {
    return { ...this.store };
  }
}

/**
 * Mock Storage Adapter for testing
 */
export class MockStorageAdapter {
  constructor() {
    this.projects = [];
    this.shouldFail = false;
    this.errorMessage = 'Mock adapter error';
  }

  async getAllProjects() {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    return { data: [...this.projects], error: null };
  }

  async getProject(projectId) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    return { data: project, error: null };
  }

  async createProject(projectData) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    this.projects.push(projectData);
    return { data: projectData, error: null };
  }

  async updateProject(projectId, updates) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    this.projects[index] = { ...this.projects[index], ...updates };
    return { data: this.projects[index], error: null };
  }

  async deleteProject(projectId) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    const deleted = this.projects.splice(index, 1)[0];
    return { data: deleted, error: null };
  }

  async addCustomObject(projectId, objectData) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    project.dataModel.objects.push(objectData);
    return { data: objectData, error: null };
  }

  async updateCustomObject(projectId, objectId, updates) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    const objectIndex = project.dataModel.objects.findIndex((o) => o.id === objectId);
    if (objectIndex === -1) {
      return { data: null, error: new Error(`Object not found: ${objectId}`) };
    }
    project.dataModel.objects[objectIndex] = {
      ...project.dataModel.objects[objectIndex],
      ...updates,
    };
    return { data: project.dataModel.objects[objectIndex], error: null };
  }

  async deleteCustomObject(projectId, objectId) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    const objectIndex = project.dataModel.objects.findIndex((o) => o.id === objectId);
    if (objectIndex === -1) {
      return { data: null, error: new Error(`Object not found: ${objectId}`) };
    }
    const deleted = project.dataModel.objects.splice(objectIndex, 1)[0];
    return { data: deleted, error: null };
  }

  async addField(projectId, objectId, fieldData) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    const object = project.dataModel.objects.find((o) => o.id === objectId);
    if (!object) {
      return { data: null, error: new Error(`Object not found: ${objectId}`) };
    }
    object.fields.push(fieldData);
    return { data: fieldData, error: null };
  }

  async updateField(projectId, objectId, fieldId, updates) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    const object = project.dataModel.objects.find((o) => o.id === objectId);
    if (!object) {
      return { data: null, error: new Error(`Object not found: ${objectId}`) };
    }
    const fieldIndex = object.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) {
      return { data: null, error: new Error(`Field not found: ${fieldId}`) };
    }
    object.fields[fieldIndex] = { ...object.fields[fieldIndex], ...updates };
    return { data: object.fields[fieldIndex], error: null };
  }

  async deleteField(projectId, objectId, fieldId) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    const object = project.dataModel.objects.find((o) => o.id === objectId);
    if (!object) {
      return { data: null, error: new Error(`Object not found: ${objectId}`) };
    }
    const fieldIndex = object.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) {
      return { data: null, error: new Error(`Field not found: ${fieldId}`) };
    }
    const deleted = object.fields.splice(fieldIndex, 1)[0];
    return { data: deleted, error: null };
  }

  async duplicateCustomObject(projectId, objectId) {
    if (this.shouldFail) {
      return { data: null, error: new Error(this.errorMessage) };
    }
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      return { data: null, error: new Error(`Project not found: ${projectId}`) };
    }
    const object = project.dataModel.objects.find((o) => o.id === objectId);
    if (!object) {
      return { data: null, error: new Error(`Object not found: ${objectId}`) };
    }
    const duplicate = {
      ...object,
      id: 'duplicate-' + objectId,
      name: object.name + '_copy',
    };
    project.dataModel.objects.push(duplicate);
    return { data: duplicate, error: null };
  }

  // Test helpers
  simulateError(message = 'Mock adapter error') {
    this.shouldFail = true;
    this.errorMessage = message;
  }

  restoreNormalOperation() {
    this.shouldFail = false;
  }

  reset() {
    this.projects = [];
    this.shouldFail = false;
    this.errorMessage = 'Mock adapter error';
  }
}

/**
 * Setup global localStorage mock
 */
export function setupLocalStorageMock() {
  const mockLocalStorage = new MockLocalStorage();
  global.localStorage = mockLocalStorage;
  return mockLocalStorage;
}
