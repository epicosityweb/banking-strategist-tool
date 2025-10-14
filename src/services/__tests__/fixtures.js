/**
 * Test Fixtures
 *
 * Reusable test data for unit tests
 */

export const validUUID = '550e8400-e29b-41d4-a716-446655440000';
export const validUUID2 = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
export const validUUID3 = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

export const validCustomObject = {
  id: validUUID,
  name: 'member_object',
  label: 'Member Object',
  description: 'Core member data',
  apiName: 'p_client_member_object',
  icon: 'Users',
  fields: [],
  associations: [],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  isTemplate: false,
};

export const validField = {
  id: validUUID2,
  name: 'member_id',
  label: 'Member ID',
  description: 'Unique member identifier',
  dataType: 'text',
  fieldType: 'standard',
  required: true,
  unique: true,
  indexed: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const validEnumerationField = {
  id: validUUID3,
  name: 'status',
  label: 'Status',
  description: 'Member status',
  dataType: 'enumeration',
  fieldType: 'standard',
  required: false,
  unique: false,
  indexed: false,
  options: [
    { label: 'Active', value: 'active', isDefault: true },
    { label: 'Inactive', value: 'inactive', isDefault: false },
  ],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const validAssociation = {
  id: validUUID,
  fromObjectId: validUUID,
  toObjectId: validUUID2,
  type: 'one_to_many',
  label: 'Member to Accounts',
  createdAt: new Date('2025-01-01'),
};

export const validProject = {
  id: validUUID,
  name: 'Test Project',
  status: 'draft',
  clientProfile: {
    basicInfo: {
      name: 'Test Client',
    },
  },
  dataModel: {
    objects: [validCustomObject],
    associations: [],
  },
  tags: [],
  journeys: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const invalidCustomObject = {
  // Missing required id
  name: '123invalid', // Must start with letter
  label: '', // Required
  apiName: 'too_short', // Must be at least 5 characters
  icon: 'Users',
  fields: [],
};

export const invalidField = {
  // Missing id
  name: '123invalid', // Must start with letter
  label: '', // Required
  dataType: 'invalid_type', // Not in enum
  fieldType: 'standard',
};

export const duplicateField = {
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  name: 'member_id', // Duplicate of validField.name
  label: 'Duplicate Field',
  dataType: 'text',
  fieldType: 'standard',
  required: false,
  unique: false,
  indexed: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const invalidEnumerationField = {
  id: validUUID,
  name: 'status',
  label: 'Status',
  dataType: 'enumeration',
  fieldType: 'standard',
  required: false,
  unique: false,
  indexed: false,
  options: [], // Must have at least one option
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
