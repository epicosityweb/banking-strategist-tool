import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectRepository } from '../ProjectRepository';
import { MockStorageAdapter } from './mocks';
import validationService from '../ValidationService';
import {
  validProject,
  validCustomObject,
  validField,
  invalidCustomObject,
  invalidField,
  validUUID,
  validUUID2,
} from './fixtures';

describe('ProjectRepository', () => {
  let repository;
  let mockAdapter;

  beforeEach(() => {
    mockAdapter = new MockStorageAdapter();
    repository = new ProjectRepository(mockAdapter, validationService);
  });

  describe('Adapter Management', () => {
    it('should use provided adapter', async () => {
      mockAdapter.projects = [validProject];

      const { data, error } = await repository.getAllProjects();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });

    it('should allow switching adapters', async () => {
      const newAdapter = new MockStorageAdapter();
      newAdapter.projects = [validProject, { ...validProject, id: validUUID2 }];

      repository.setAdapter(newAdapter);

      const { data } = await repository.getAllProjects();
      expect(data).toHaveLength(2);
    });
  });

  describe('Project Operations', () => {
    describe('createProject', () => {
      it('should create project with valid data model', async () => {
        const projectData = {
          ...validProject,
          dataModel: {
            objects: [validCustomObject],
            associations: [],
          },
        };

        const { data, error } = await repository.createProject(projectData);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(mockAdapter.projects).toHaveLength(1);
      });

      it('should reject project with invalid data model', async () => {
        const projectData = {
          ...validProject,
          dataModel: {
            objects: [invalidCustomObject],
            associations: [],
          },
        };

        const { data, error, validationErrors } = await repository.createProject(projectData);

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error.message).toContain('validation failed');
        expect(validationErrors).toBeDefined();
        expect(mockAdapter.projects).toHaveLength(0); // Should not have been created
      });

      it('should reject project with referential integrity issues', async () => {
        const projectData = {
          ...validProject,
          dataModel: {
            objects: [{ ...validCustomObject, id: validUUID }],
            associations: [
              {
                id: validUUID2,
                fromObjectId: validUUID,
                toObjectId: 'non-existent-object-id',
                type: 'one_to_many',
                label: 'Test Association',
                createdAt: new Date(),
              },
            ],
          },
        };

        const { data, error, validationErrors } = await repository.createProject(projectData);

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error.message).toContain('integrity');
        expect(validationErrors).toBeDefined();
      });
    });

    describe('updateProject', () => {
      beforeEach(() => {
        mockAdapter.projects = [validProject];
      });

      it('should update project with valid data model', async () => {
        const updates = {
          dataModel: {
            objects: [validCustomObject],
            associations: [],
          },
        };

        const { data, error } = await repository.updateProject(validUUID, updates);

        expect(error).toBeNull();
        expect(data).toBeDefined();
      });

      it('should reject update with invalid data model', async () => {
        const updates = {
          dataModel: {
            objects: [invalidCustomObject],
            associations: [],
          },
        };

        const { data, error, validationErrors } = await repository.updateProject(
          validUUID,
          updates
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(validationErrors).toBeDefined();
      });
    });
  });

  describe('Custom Object Operations', () => {
    beforeEach(() => {
      mockAdapter.projects = [validProject];
    });

    describe('addCustomObject', () => {
      it('should add valid custom object', async () => {
        const { data, error } = await repository.addCustomObject(
          validUUID,
          validCustomObject
        );

        expect(error).toBeNull();
        expect(data).toBeDefined();
      });

      it('should reject invalid custom object', async () => {
        const { data, error, validationErrors } = await repository.addCustomObject(
          validUUID,
          invalidCustomObject
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error.message).toContain('validation failed');
        expect(validationErrors).toBeDefined();
        expect(validationErrors.length).toBeGreaterThan(0);
      });

      it('should reject duplicate object name', async () => {
        // First add is successful
        await repository.addCustomObject(validUUID, validCustomObject);

        // Second add with same name should fail
        const duplicate = { ...validCustomObject, id: validUUID2 };
        const { data, error, validationErrors } = await repository.addCustomObject(
          validUUID,
          duplicate
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error.message).toContain('already exists');
        expect(validationErrors).toBeDefined();
      });

      it('should normalize date fields before saving', async () => {
        const objectWithDateObjects = {
          ...validCustomObject,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-02'),
        };

        const { data, error } = await repository.addCustomObject(
          validUUID,
          objectWithDateObjects
        );

        expect(error).toBeNull();
        expect(typeof data.createdAt).toBe('string');
        expect(typeof data.updatedAt).toBe('string');
      });

      it('should propagate adapter errors', async () => {
        mockAdapter.simulateError('Storage full');

        const { data, error } = await repository.addCustomObject(
          validUUID,
          validCustomObject
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error.message).toContain('Storage full');
      });
    });
  });

  describe('Field Operations', () => {
    beforeEach(async () => {
      mockAdapter.projects = [
        {
          ...validProject,
          dataModel: {
            objects: [validCustomObject],
            associations: [],
          },
        },
      ];
    });

    describe('addField', () => {
      it('should add valid field', async () => {
        const { data, error } = await repository.addField(
          validUUID,
          validCustomObject.id,
          validField
        );

        expect(error).toBeNull();
        expect(data).toBeDefined();
      });

      it('should reject invalid field', async () => {
        const { data, error, validationErrors } = await repository.addField(
          validUUID,
          validCustomObject.id,
          invalidField
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(error.message).toContain('validation failed');
        expect(validationErrors).toBeDefined();
      });

      it('should reject duplicate field name', async () => {
        // First add is successful
        await repository.addField(validUUID, validCustomObject.id, validField);

        // Second add with same name should fail
        const duplicate = { ...validField, id: validUUID2 };
        const { data, error, validationErrors } = await repository.addField(
          validUUID,
          validCustomObject.id,
          duplicate
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(validationErrors).toBeDefined();
        expect(validationErrors[0].message).toContain('already exists');
      });

      it('should normalize date fields before saving', async () => {
        const fieldWithDateObjects = {
          ...validField,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-02'),
        };

        const { data, error } = await repository.addField(
          validUUID,
          validCustomObject.id,
          fieldWithDateObjects
        );

        expect(error).toBeNull();
        expect(typeof data.createdAt).toBe('string');
        expect(typeof data.updatedAt).toBe('string');
      });
    });

    describe('updateField', () => {
      beforeEach(async () => {
        // Add a field first
        await mockAdapter.addField(validUUID, validCustomObject.id, validField);
      });

      it('should update valid field', async () => {
        const updates = { label: 'Updated Label' };

        const { data, error } = await repository.updateField(
          validUUID,
          validCustomObject.id,
          validField.id,
          updates
        );

        expect(error).toBeNull();
        expect(data.label).toBe('Updated Label');
      });

      it('should reject invalid field updates', async () => {
        const updates = { dataType: 'invalid_type' };

        const { data, error, validationErrors } = await repository.updateField(
          validUUID,
          validCustomObject.id,
          validField.id,
          updates
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(validationErrors).toBeDefined();
      });

      it('should allow updating field with same name', async () => {
        const updates = { name: validField.name, label: 'Updated Label' };

        const { data, error } = await repository.updateField(
          validUUID,
          validCustomObject.id,
          validField.id,
          updates
        );

        expect(error).toBeNull();
        expect(data.label).toBe('Updated Label');
      });

      it('should reject duplicate field name', async () => {
        // Add another field
        const field2 = { ...validField, id: validUUID2, name: 'other_field' };
        await mockAdapter.addField(validUUID, validCustomObject.id, field2);

        // Try to rename field2 to field1's name
        const updates = { name: validField.name };

        const { data, error, validationErrors } = await repository.updateField(
          validUUID,
          validCustomObject.id,
          field2.id,
          updates
        );

        expect(data).toBeNull();
        expect(error).toBeDefined();
        expect(validationErrors).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle adapter errors gracefully', async () => {
      mockAdapter.simulateError('Database connection failed');

      const { data, error } = await repository.getAllProjects();

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.message).toContain('Database connection failed');
    });

    it('should return validation errors in correct format', async () => {
      mockAdapter.projects = [validProject];

      const { data, error, validationErrors } = await repository.addCustomObject(
        validUUID,
        invalidCustomObject
      );

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(Array.isArray(validationErrors)).toBe(true);
      expect(validationErrors.length).toBeGreaterThan(0);
      expect(validationErrors[0]).toHaveProperty('field');
      expect(validationErrors[0]).toHaveProperty('message');
    });
  });

  describe('Integration with ValidationService', () => {
    beforeEach(() => {
      mockAdapter.projects = [validProject];
    });

    it('should enforce validation before creating projects', async () => {
      const invalidProject = {
        ...validProject,
        dataModel: {
          objects: [invalidCustomObject],
          associations: [],
        },
      };

      const { data, error } = await repository.createProject(invalidProject);

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(mockAdapter.projects).toHaveLength(1); // Only the initial project
    });

    it('should enforce validation before adding objects', async () => {
      const { data, error } = await repository.addCustomObject(
        validUUID,
        invalidCustomObject
      );

      expect(data).toBeNull();
      expect(error).toBeDefined();

      // Verify object was not added
      const { data: project } = await mockAdapter.getProject(validUUID);
      expect(project.dataModel.objects).toHaveLength(1); // Only original objects
    });

    it('should enforce validation before adding fields', async () => {
      await mockAdapter.addCustomObject(validUUID, validCustomObject);

      const { data, error } = await repository.addField(
        validUUID,
        validCustomObject.id,
        invalidField
      );

      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });
});
