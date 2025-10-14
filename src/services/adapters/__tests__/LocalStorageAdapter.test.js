import { describe, it, expect, beforeEach } from 'vitest';
import LocalStorageAdapter from '../LocalStorageAdapter';
import { setupLocalStorageMock } from '../../__tests__/mocks';
import { validProject, validCustomObject, validField, validUUID, validUUID2 } from '../../__tests__/fixtures';

describe('LocalStorageAdapter', () => {
  let adapter;
  let mockLocalStorage;

  beforeEach(() => {
    // Setup fresh localStorage mock for each test
    mockLocalStorage = setupLocalStorageMock();
    adapter = new LocalStorageAdapter();
  });

  describe('Project Operations', () => {
    describe('getAllProjects', () => {
      it('should return empty array when no projects exist', async () => {
        const { data, error } = await adapter.getAllProjects();

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('should return all projects from localStorage', async () => {
        const projects = [validProject, { ...validProject, id: validUUID2 }];
        mockLocalStorage.setItem('strategist-projects', JSON.stringify(projects));

        const { data, error } = await adapter.getAllProjects();

        expect(error).toBeNull();
        expect(data).toHaveLength(2);
        expect(data[0].id).toBe(validUUID);
      });

      it('should handle corrupt JSON gracefully', async () => {
        mockLocalStorage.setItem('strategist-projects', 'invalid json{{{');

        const { data, error } = await adapter.getAllProjects();

        expect(error).toBeNull();
        expect(data).toEqual([]); // Returns empty array on error
      });
    });

    describe('getProject', () => {
      it('should return project by ID', async () => {
        const projects = [validProject];
        mockLocalStorage.setItem('strategist-projects', JSON.stringify(projects));

        const { data, error } = await adapter.getProject(validUUID);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.id).toBe(validUUID);
      });

      it('should return error when project not found', async () => {
        mockLocalStorage.setItem('strategist-projects', JSON.stringify([]));

        const { data, error } = await adapter.getProject('non-existent-id');

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error.message).toContain('not found');
      });
    });

    describe('createProject', () => {
      it('should create a new project', async () => {
        const newProject = {
          name: 'New Project',
          status: 'draft',
        };

        const { data, error } = await adapter.createProject(newProject);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.id).toBeDefined(); // ID should be generated
        expect(data.name).toBe('New Project');
        expect(data.createdAt).toBeDefined();
        expect(data.updatedAt).toBeDefined();
      });

      it('should use provided ID if given', async () => {
        const newProject = {
          id: validUUID,
          name: 'New Project',
        };

        const { data, error } = await adapter.createProject(newProject);

        expect(error).toBeNull();
        expect(data.id).toBe(validUUID);
      });

      it('should set default values for missing fields', async () => {
        const newProject = {
          name: 'New Project',
        };

        const { data, error } = await adapter.createProject(newProject);

        expect(error).toBeNull();
        expect(data.status).toBe('draft');
        expect(data.clientProfile).toEqual({});
        expect(data.dataModel).toEqual({ objects: [], associations: [] });
        expect(data.tags).toEqual([]);
        expect(data.journeys).toEqual([]);
      });

      it('should handle localStorage quota exceeded error', async () => {
        mockLocalStorage.simulateQuotaExceeded();

        const { data, error } = await adapter.createProject({ name: 'Test' });

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });
    });

    describe('updateProject', () => {
      beforeEach(async () => {
        await adapter.createProject(validProject);
      });

      it('should update existing project', async () => {
        const updates = { name: 'Updated Name' };

        const { data, error } = await adapter.updateProject(validUUID, updates);

        expect(error).toBeNull();
        expect(data.name).toBe('Updated Name');
        expect(data.updatedAt).toBeDefined();
      });

      it('should not allow ID to be changed', async () => {
        const updates = { id: 'different-id' };

        const { data, error } = await adapter.updateProject(validUUID, updates);

        expect(error).toBeNull();
        expect(data.id).toBe(validUUID); // ID should remain unchanged
      });

      it('should return error when project not found', async () => {
        const { data, error } = await adapter.updateProject('non-existent', {});

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error.message).toContain('not found');
      });
    });

    describe('deleteProject', () => {
      beforeEach(async () => {
        await adapter.createProject(validProject);
      });

      it('should delete existing project', async () => {
        const { data, error } = await adapter.deleteProject(validUUID);

        expect(error).toBeNull();
        expect(data.id).toBe(validUUID);

        // Verify it's gone
        const { data: projects } = await adapter.getAllProjects();
        expect(projects).toHaveLength(0);
      });

      it('should return error when project not found', async () => {
        const { data, error } = await adapter.deleteProject('non-existent');

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });
    });
  });

  describe('Custom Object Operations', () => {
    beforeEach(async () => {
      await adapter.createProject(validProject);
    });

    describe('addCustomObject', () => {
      it('should add custom object to project', async () => {
        const newObject = { ...validCustomObject, id: validUUID2 };

        const { data, error } = await adapter.addCustomObject(validUUID, newObject);

        expect(error).toBeNull();
        expect(data.id).toBe(validUUID2);
        expect(data.createdAt).toBeDefined();
        expect(data.updatedAt).toBeDefined();
      });

      it('should generate ID if not provided', async () => {
        const newObject = { ...validCustomObject, id: undefined };

        const { data, error } = await adapter.addCustomObject(validUUID, newObject);

        expect(error).toBeNull();
        expect(data.id).toBeDefined();
      });

      it('should return error when project not found', async () => {
        const { data, error } = await adapter.addCustomObject('non-existent', validCustomObject);

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });
    });

    describe('updateCustomObject', () => {
      beforeEach(async () => {
        await adapter.addCustomObject(validUUID, validCustomObject);
      });

      it('should update existing custom object', async () => {
        const updates = { label: 'Updated Label' };

        const { data, error } = await adapter.updateCustomObject(
          validUUID,
          validCustomObject.id,
          updates
        );

        expect(error).toBeNull();
        expect(data.label).toBe('Updated Label');
        expect(data.updatedAt).toBeDefined();
      });

      it('should not allow ID to be changed', async () => {
        const updates = { id: 'different-id' };

        const { data, error } = await adapter.updateCustomObject(
          validUUID,
          validCustomObject.id,
          updates
        );

        expect(error).toBeNull();
        expect(data.id).toBe(validCustomObject.id);
      });

      it('should return error when object not found', async () => {
        const { data, error } = await adapter.updateCustomObject(
          validUUID,
          'non-existent',
          {}
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });
    });

    describe('deleteCustomObject', () => {
      beforeEach(async () => {
        await adapter.addCustomObject(validUUID, validCustomObject);
      });

      it('should delete custom object', async () => {
        const { data, error } = await adapter.deleteCustomObject(
          validUUID,
          validCustomObject.id
        );

        expect(error).toBeNull();
        expect(data.id).toBe(validCustomObject.id);

        // Verify it's gone
        const { data: project } = await adapter.getProject(validUUID);
        expect(project.dataModel.objects).toHaveLength(1); // Still has original from validProject
      });

      it('should remove associated associations', async () => {
        // Add an association
        const { data: project } = await adapter.getProject(validUUID);
        project.dataModel.associations = [
          {
            id: validUUID2,
            fromObjectId: validCustomObject.id,
            toObjectId: 'other-object-id',
            type: 'one_to_many',
          },
        ];
        await adapter.updateProject(validUUID, { dataModel: project.dataModel });

        // Delete the object
        await adapter.deleteCustomObject(validUUID, validCustomObject.id);

        // Verify association is gone
        const { data: updatedProject } = await adapter.getProject(validUUID);
        expect(updatedProject.dataModel.associations).toHaveLength(0);
      });
    });

    describe('duplicateCustomObject', () => {
      beforeEach(async () => {
        await adapter.addCustomObject(validUUID, validCustomObject);
      });

      it('should duplicate custom object with new ID', async () => {
        const { data, error } = await adapter.duplicateCustomObject(
          validUUID,
          validCustomObject.id
        );

        expect(error).toBeNull();
        expect(data.id).not.toBe(validCustomObject.id);
        expect(data.name).toBe(validCustomObject.name + '_copy');
        expect(data.label).toContain('(Copy)');
      });

      it('should duplicate all fields with new IDs', async () => {
        // Add a field first
        await adapter.addField(validUUID, validCustomObject.id, validField);

        const { data, error } = await adapter.duplicateCustomObject(
          validUUID,
          validCustomObject.id
        );

        expect(error).toBeNull();
        expect(data.fields).toHaveLength(1);
        expect(data.fields[0].id).not.toBe(validField.id);
      });
    });
  });

  describe('Field Operations', () => {
    beforeEach(async () => {
      await adapter.createProject(validProject);
      await adapter.addCustomObject(validUUID, validCustomObject);
    });

    describe('addField', () => {
      it('should add field to object', async () => {
        const { data, error } = await adapter.addField(
          validUUID,
          validCustomObject.id,
          validField
        );

        expect(error).toBeNull();
        expect(data.id).toBe(validField.id);
        expect(data.createdAt).toBeDefined();
      });

      it('should return error when object not found', async () => {
        const { data, error } = await adapter.addField(
          validUUID,
          'non-existent',
          validField
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });
    });

    describe('updateField', () => {
      beforeEach(async () => {
        await adapter.addField(validUUID, validCustomObject.id, validField);
      });

      it('should update existing field', async () => {
        const updates = { label: 'Updated Field Label' };

        const { data, error } = await adapter.updateField(
          validUUID,
          validCustomObject.id,
          validField.id,
          updates
        );

        expect(error).toBeNull();
        expect(data.label).toBe('Updated Field Label');
        expect(data.updatedAt).toBeDefined();
      });

      it('should not allow ID to be changed', async () => {
        const updates = { id: 'different-id' };

        const { data, error } = await adapter.updateField(
          validUUID,
          validCustomObject.id,
          validField.id,
          updates
        );

        expect(error).toBeNull();
        expect(data.id).toBe(validField.id);
      });

      it('should return error when field not found', async () => {
        const { data, error } = await adapter.updateField(
          validUUID,
          validCustomObject.id,
          'non-existent',
          {}
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });
    });

    describe('deleteField', () => {
      beforeEach(async () => {
        await adapter.addField(validUUID, validCustomObject.id, validField);
      });

      it('should delete field from object', async () => {
        const { data, error } = await adapter.deleteField(
          validUUID,
          validCustomObject.id,
          validField.id
        );

        expect(error).toBeNull();
        expect(data.id).toBe(validField.id);

        // Verify it's gone
        const { data: project } = await adapter.getProject(validUUID);
        const object = project.dataModel.objects.find((o) => o.id === validCustomObject.id);
        expect(object.fields).toHaveLength(0);
      });

      it('should return error when field not found', async () => {
        const { data, error } = await adapter.deleteField(
          validUUID,
          validCustomObject.id,
          'non-existent'
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
      });
    });
  });
});
