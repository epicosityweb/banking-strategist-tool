/**
 * Type definitions for Data Model entities
 * Using JSDoc for type safety without TypeScript
 */

/**
 * @typedef {Object} CustomObject
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Object name (no spaces, snake_case)
 * @property {string} label - Display label for UI
 * @property {string} description - Object description
 * @property {string} apiName - HubSpot API name (auto-generated, editable)
 * @property {string} icon - Icon name from lucide-react
 * @property {Field[]} fields - Array of fields in this object
 * @property {Association[]} associations - Array of associations to other objects
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {boolean} isTemplate - Whether this is from a template
 * @property {string} [templateId] - Original template ID if cloned from template
 */

/**
 * @typedef {Object} Field
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Field name (snake_case)
 * @property {string} label - Display label for UI
 * @property {string} description - Field description
 * @property {FieldDataType} dataType - Field data type
 * @property {FieldType} fieldType - Standard, Calculated, or Lookup
 * @property {boolean} required - Whether field is required
 * @property {boolean} unique - Whether field must be unique
 * @property {boolean} indexed - Whether field is indexed for performance
 * @property {*} [defaultValue] - Default value (type varies by dataType)
 * @property {EnumerationOption[]} [options] - For enumeration type fields
 * @property {CalculatedFieldConfig} [calculation] - For calculated fields
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {'text' | 'multiline_text' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'enumeration' | 'email' | 'phone' | 'url'} FieldDataType
 */

/**
 * @typedef {'standard' | 'calculated' | 'lookup'} FieldType
 */

/**
 * @typedef {Object} EnumerationOption
 * @property {string} label - Display label
 * @property {string} value - Internal value
 * @property {boolean} isDefault - Whether this is the default option
 */

/**
 * @typedef {Object} CalculatedFieldConfig
 * @property {'sum' | 'count' | 'average' | 'date_difference' | 'concatenate' | 'lookup' | 'custom'} calculationType
 * @property {string} [sourceObjectId] - For aggregations from associations
 * @property {string} [sourceFieldId] - Field to aggregate
 * @property {string} [formula] - Custom formula string
 */

/**
 * @typedef {Object} Association
 * @property {string} id - Unique identifier (UUID)
 * @property {string} fromObjectId - Source object ID
 * @property {string} toObjectId - Target object ID
 * @property {AssociationType} type - Association type
 * @property {string} label - Association label
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @typedef {'one_to_one' | 'one_to_many' | 'many_to_many'} AssociationType
 */

/**
 * @typedef {Object} ObjectTemplate
 * @property {string} id - Template identifier
 * @property {string} name - Template name
 * @property {string} label - Template display label
 * @property {string} description - Template description
 * @property {string} icon - Default icon
 * @property {string} category - Template category (core, lending, etc.)
 * @property {FieldTemplate[]} fields - Pre-configured fields
 * @property {string[]} [tags] - Searchable tags
 */

/**
 * @typedef {Object} FieldTemplate
 * @property {string} name - Field name
 * @property {string} label - Field label
 * @property {string} description - Field description
 * @property {FieldDataType} dataType - Field data type
 * @property {FieldType} fieldType - Field type
 * @property {boolean} required - Whether field is required
 * @property {boolean} unique - Whether field must be unique
 * @property {boolean} indexed - Whether field is indexed
 * @property {EnumerationOption[]} [options] - For enumeration fields
 */

export default {};
