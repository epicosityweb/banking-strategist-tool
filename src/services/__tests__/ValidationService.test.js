import { describe, it, expect } from 'vitest';
import validationService from '../ValidationService';
import {
  validCustomObject,
  validField,
  validEnumerationField,
  validAssociation,
  invalidCustomObject,
  invalidField,
  duplicateField,
  invalidEnumerationField,
  validUUID,
  validUUID2,
} from './fixtures';

describe('ValidationService', () => {
  describe('validateCustomObject', () => {
    it('should validate a valid custom object', () => {
      const result = validationService.validateCustomObject(validCustomObject);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toEqual([]);
    });

    it('should reject object with invalid name format', () => {
      const invalidObject = {
        ...validCustomObject,
        name: '123invalid', // Must start with letter
      };

      const result = validationService.validateCustomObject(invalidObject);

      expect(result.valid).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toContain('name');
    });

    it('should reject object with missing required fields', () => {
      const result = validationService.validateCustomObject(invalidCustomObject);

      expect(result.valid).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject object with invalid UUID', () => {
      const invalidObject = {
        ...validCustomObject,
        id: 'not-a-uuid',
      };

      const result = validationService.validateCustomObject(invalidObject);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'id')).toBe(true);
    });

    it('should reject object with short API name', () => {
      const invalidObject = {
        ...validCustomObject,
        apiName: 'abc', // Too short (min 5)
      };

      const result = validationService.validateCustomObject(invalidObject);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'apiName')).toBe(true);
    });
  });

  describe('validateField', () => {
    it('should validate a valid field', () => {
      const result = validationService.validateField(validField);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toEqual([]);
    });

    it('should reject field with invalid name format', () => {
      const invalidFieldData = {
        ...validField,
        name: '123invalid', // Must start with letter
      };

      const result = validationService.validateField(invalidFieldData);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.includes('name'))).toBe(true);
    });

    it('should reject field with invalid data type', () => {
      const result = validationService.validateField(invalidField);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'dataType')).toBe(true);
    });

    it('should detect duplicate field names', () => {
      const existingFields = [validField];
      const result = validationService.validateField(duplicateField, existingFields);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].message).toContain('already exists');
    });

    it('should allow updating field with same name', () => {
      const existingFields = [validField];
      const updatedField = { ...validField, label: 'Updated Label' };
      const result = validationService.validateField(updatedField, existingFields);

      expect(result.valid).toBe(true);
    });

    it('should validate enumeration field with options', () => {
      const result = validationService.validateField(validEnumerationField);

      expect(result.valid).toBe(true);
      expect(result.data.options.length).toBe(2);
    });

    it('should reject enumeration field without options', () => {
      const result = validationService.validateField(invalidEnumerationField);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('options');
      expect(result.errors[0].message).toContain('at least one option');
    });

    it('should reject enumeration field with empty option values', () => {
      const invalidField = {
        ...validEnumerationField,
        options: [{ label: '', value: '' }],
      };

      const result = validationService.validateField(invalidField);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('options');
    });
  });

  describe('validateAssociation', () => {
    it('should validate a valid association', () => {
      const result = validationService.validateAssociation(validAssociation);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toEqual([]);
    });

    it('should reject association with invalid type', () => {
      const invalidAssoc = {
        ...validAssociation,
        type: 'invalid_type',
      };

      const result = validationService.validateAssociation(invalidAssoc);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'type')).toBe(true);
    });

    it('should reject association with invalid UUIDs', () => {
      const invalidAssoc = {
        ...validAssociation,
        fromObjectId: 'not-a-uuid',
      };

      const result = validationService.validateAssociation(invalidAssoc);

      expect(result.valid).toBe(false);
    });
  });

  describe('validateDataModel', () => {
    it('should validate a valid data model', () => {
      const dataModel = {
        objects: [validCustomObject],
        associations: [validAssociation],
      };

      const result = validationService.validateDataModel(dataModel);

      expect(result.valid).toBe(true);
      expect(result.data.objects.length).toBe(1);
      expect(result.data.associations.length).toBe(1);
    });

    it('should collect errors from multiple invalid objects', () => {
      const dataModel = {
        objects: [invalidCustomObject, { ...invalidCustomObject, name: 'another_invalid' }],
        associations: [],
      };

      const result = validationService.validateDataModel(dataModel);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2); // Two invalid objects
    });

    it('should validate empty data model', () => {
      const dataModel = {
        objects: [],
        associations: [],
      };

      const result = validationService.validateDataModel(dataModel);

      expect(result.valid).toBe(true);
      expect(result.data.objects).toEqual([]);
      expect(result.data.associations).toEqual([]);
    });
  });

  describe('validateReferentialIntegrity', () => {
    it('should pass when all associations reference valid objects', () => {
      const dataModel = {
        objects: [
          { ...validCustomObject, id: validUUID },
          { ...validCustomObject, id: validUUID2, name: 'account_object' },
        ],
        associations: [
          {
            ...validAssociation,
            fromObjectId: validUUID,
            toObjectId: validUUID2,
          },
        ],
      };

      const result = validationService.validateReferentialIntegrity(dataModel);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail when association references non-existent fromObject', () => {
      const dataModel = {
        objects: [{ ...validCustomObject, id: validUUID }],
        associations: [
          {
            ...validAssociation,
            fromObjectId: 'non-existent-id',
            toObjectId: validUUID,
          },
        ],
      };

      const result = validationService.validateReferentialIntegrity(dataModel);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('non-existent');
    });

    it('should fail when association references non-existent toObject', () => {
      const dataModel = {
        objects: [{ ...validCustomObject, id: validUUID }],
        associations: [
          {
            ...validAssociation,
            fromObjectId: validUUID,
            toObjectId: 'non-existent-id',
          },
        ],
      };

      const result = validationService.validateReferentialIntegrity(dataModel);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('non-existent');
    });
  });

  describe('normalizeDateFields', () => {
    it('should convert Date objects to ISO strings', () => {
      const data = {
        id: validUUID,
        name: 'test',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-02T00:00:00.000Z'),
      };

      const normalized = validationService.normalizeDateFields(data);

      expect(normalized.createdAt).toBe('2025-01-01T00:00:00.000Z');
      expect(normalized.updatedAt).toBe('2025-01-02T00:00:00.000Z');
    });

    it('should preserve ISO strings', () => {
      const data = {
        id: validUUID,
        name: 'test',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      };

      const normalized = validationService.normalizeDateFields(data);

      expect(normalized.createdAt).toBe('2025-01-01T00:00:00.000Z');
      expect(normalized.updatedAt).toBe('2025-01-02T00:00:00.000Z');
    });

    it('should normalize dates in nested fields array', () => {
      const data = {
        id: validUUID,
        name: 'test',
        fields: [
          {
            id: validUUID2,
            name: 'field1',
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-02'),
          },
        ],
      };

      const normalized = validationService.normalizeDateFields(data);

      expect(normalized.fields[0].createdAt).toMatch(/2025-01-01/);
      expect(normalized.fields[0].updatedAt).toMatch(/2025-01-02/);
    });
  });

  describe('isFieldNameUnique', () => {
    it('should return true for unique field name', () => {
      const existingFields = [validField];
      const isUnique = validationService.isFieldNameUnique(
        'new_field',
        'new-id',
        existingFields
      );

      expect(isUnique).toBe(true);
    });

    it('should return false for duplicate field name', () => {
      const existingFields = [validField];
      const isUnique = validationService.isFieldNameUnique(
        'member_id',
        'new-id',
        existingFields
      );

      expect(isUnique).toBe(false);
    });

    it('should return true when updating same field', () => {
      const existingFields = [validField];
      const isUnique = validationService.isFieldNameUnique(
        'member_id',
        validField.id,
        existingFields
      );

      expect(isUnique).toBe(true);
    });

    it('should be case-insensitive', () => {
      const existingFields = [validField];
      const isUnique = validationService.isFieldNameUnique(
        'MEMBER_ID',
        'new-id',
        existingFields
      );

      expect(isUnique).toBe(false);
    });
  });

  describe('isObjectNameUnique', () => {
    it('should return true for unique object name', () => {
      const existingObjects = [validCustomObject];
      const isUnique = validationService.isObjectNameUnique(
        'new_object',
        'new-id',
        existingObjects
      );

      expect(isUnique).toBe(true);
    });

    it('should return false for duplicate object name', () => {
      const existingObjects = [validCustomObject];
      const isUnique = validationService.isObjectNameUnique(
        'member_object',
        'new-id',
        existingObjects
      );

      expect(isUnique).toBe(false);
    });

    it('should return true when updating same object', () => {
      const existingObjects = [validCustomObject];
      const isUnique = validationService.isObjectNameUnique(
        'member_object',
        validCustomObject.id,
        existingObjects
      );

      expect(isUnique).toBe(true);
    });

    it('should normalize name for comparison', () => {
      const existingObjects = [validCustomObject];
      const isUnique = validationService.isObjectNameUnique(
        'Member Object', // Has spaces
        'new-id',
        existingObjects
      );

      expect(isUnique).toBe(false);
    });
  });
});
