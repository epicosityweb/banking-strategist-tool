import {
  customObjectSchema,
  fieldSchema,
  associationSchema,
} from '../schemas/objectSchema';
import {
  tagSchema,
  tagLibrarySchema,
  validateTagName,
  validateTagColor,
  validateQualificationRules,
  validateTagDependencies,
  analyzeRuleComplexity,
} from '../schemas/tagSchema';

/**
 * Validation Service
 *
 * Centralizes all data validation logic using Zod schemas.
 * Provides consistent validation and error formatting across the application.
 *
 * Benefits:
 * - Catch invalid data before it reaches storage
 * - Provide user-friendly error messages
 * - Enforce business rules consistently
 * - Prevent data corruption
 */
class ValidationService {
  /**
   * Validate a custom object
   * @param {Object} objectData - Object data to validate
   * @returns {{valid: boolean, data: Object|null, errors: Array}}
   */
  validateCustomObject(objectData) {
    try {
      const validated = customObjectSchema.parse(objectData);
      return {
        valid: true,
        data: validated,
        errors: [],
      };
    } catch (error) {
      if (error.name === 'ZodError') {
        return {
          valid: false,
          data: null,
          errors: this._formatZodErrors(error),
        };
      }
      throw error;
    }
  }

  /**
   * Validate a field
   * @param {Object} fieldData - Field data to validate
   * @param {Array} existingFields - Existing fields to check for duplicates
   * @returns {{valid: boolean, data: Object|null, errors: Array}}
   */
  validateField(fieldData, existingFields = []) {
    try {
      // First validate the field structure
      const validated = fieldSchema.parse(fieldData);

      // Additional business rule: Check for duplicate field names
      const normalizedName = validated.name.toLowerCase();
      const duplicate = existingFields.find(
        (f) => f.id !== validated.id && f.name.toLowerCase() === normalizedName
      );

      if (duplicate) {
        return {
          valid: false,
          data: null,
          errors: [
            {
              field: 'name',
              message: 'A field with this name already exists in this object',
            },
          ],
        };
      }

      // Validate enumeration options if dataType is 'enumeration'
      if (validated.dataType === 'enumeration') {
        if (!validated.options || validated.options.length === 0) {
          return {
            valid: false,
            data: null,
            errors: [
              {
                field: 'options',
                message: 'Enumeration fields must have at least one option',
              },
            ],
          };
        }

        const hasEmptyOptions = validated.options.some(
          (opt) => !opt.label || !opt.value
        );
        if (hasEmptyOptions) {
          return {
            valid: false,
            data: null,
            errors: [
              {
                field: 'options',
                message: 'All options must have both a label and value',
              },
            ],
          };
        }
      }

      return {
        valid: true,
        data: validated,
        errors: [],
      };
    } catch (error) {
      if (error.name === 'ZodError') {
        return {
          valid: false,
          data: null,
          errors: this._formatZodErrors(error),
        };
      }
      throw error;
    }
  }

  /**
   * Validate an association
   * @param {Object} associationData - Association data to validate
   * @returns {{valid: boolean, data: Object|null, errors: Array}}
   */
  validateAssociation(associationData) {
    try {
      const validated = associationSchema.parse(associationData);
      return {
        valid: true,
        data: validated,
        errors: [],
      };
    } catch (error) {
      if (error.name === 'ZodError') {
        return {
          valid: false,
          data: null,
          errors: this._formatZodErrors(error),
        };
      }
      throw error;
    }
  }

  /**
   * Validate a project's data model
   * @param {Object} dataModel - Data model to validate
   * @returns {{valid: boolean, data: Object|null, errors: Array}}
   */
  validateDataModel(dataModel) {
    const errors = [];
    const validatedObjects = [];
    const validatedAssociations = [];

    // Validate all objects
    if (dataModel.objects && Array.isArray(dataModel.objects)) {
      dataModel.objects.forEach((object, index) => {
        const result = this.validateCustomObject(object);
        if (!result.valid) {
          errors.push({
            path: `objects[${index}]`,
            objectName: object.label || object.name || 'Unknown',
            errors: result.errors,
          });
        } else {
          validatedObjects.push(result.data);
        }
      });
    }

    // Validate all associations
    if (dataModel.associations && Array.isArray(dataModel.associations)) {
      dataModel.associations.forEach((association, index) => {
        const result = this.validateAssociation(association);
        if (!result.valid) {
          errors.push({
            path: `associations[${index}]`,
            errors: result.errors,
          });
        } else {
          validatedAssociations.push(result.data);
        }
      });
    }

    if (errors.length > 0) {
      return {
        valid: false,
        data: null,
        errors,
      };
    }

    return {
      valid: true,
      data: {
        objects: validatedObjects,
        associations: validatedAssociations,
      },
      errors: [],
    };
  }

  /**
   * Validate referential integrity between objects and associations
   * @param {Object} dataModel - Data model to check
   * @returns {{valid: boolean, errors: Array}}
   */
  validateReferentialIntegrity(dataModel) {
    const errors = [];
    const objectIds = new Set(
      (dataModel.objects || []).map((obj) => obj.id)
    );

    // Check if all associations reference valid objects
    (dataModel.associations || []).forEach((assoc, index) => {
      if (!objectIds.has(assoc.fromObjectId)) {
        errors.push({
          path: `associations[${index}].fromObjectId`,
          message: `Association references non-existent object: ${assoc.fromObjectId}`,
        });
      }
      if (!objectIds.has(assoc.toObjectId)) {
        errors.push({
          path: `associations[${index}].toObjectId`,
          message: `Association references non-existent object: ${assoc.toObjectId}`,
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format Zod validation errors into a user-friendly format
   * @private
   */
  _formatZodErrors(zodError) {
    if (!zodError.errors || !Array.isArray(zodError.errors)) {
      return [{ field: 'unknown', message: zodError.message || 'Validation error', code: 'unknown' }];
    }
    return zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }

  /**
   * Convert Date objects to ISO strings for storage
   * @param {Object} data - Data object to normalize
   * @returns {Object} Normalized data
   */
  normalizeDateFields(data) {
    const normalized = { ...data };

    if (normalized.createdAt instanceof Date) {
      normalized.createdAt = normalized.createdAt.toISOString();
    }

    if (normalized.updatedAt instanceof Date) {
      normalized.updatedAt = normalized.updatedAt.toISOString();
    }

    if (normalized.fields && Array.isArray(normalized.fields)) {
      normalized.fields = normalized.fields.map((field) =>
        this.normalizeDateFields(field)
      );
    }

    return normalized;
  }

  /**
   * Check if field name is unique within an object
   * @param {string} fieldName - Field name to check
   * @param {string} fieldId - Current field ID (for updates)
   * @param {Array} existingFields - Existing fields
   * @returns {boolean}
   */
  isFieldNameUnique(fieldName, fieldId, existingFields = []) {
    const normalizedName = fieldName.toLowerCase();
    return !existingFields.some(
      (f) => f.id !== fieldId && f.name.toLowerCase() === normalizedName
    );
  }

  /**
   * Check if object name is unique within a project
   * @param {string} objectName - Object name to check
   * @param {string} objectId - Current object ID (for updates)
   * @param {Array} existingObjects - Existing objects
   * @returns {boolean}
   */
  isObjectNameUnique(objectName, objectId, existingObjects = []) {
    const normalizedName = objectName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return !existingObjects.some(
      (obj) => obj.id !== objectId && obj.name.toLowerCase() === normalizedName
    );
  }

  // ========== Tag Validation Methods ==========

  /**
   * Validate a tag
   * @param {Object} tagData - Tag data to validate
   * @param {Object} context - Validation context (existingTags, availableObjects)
   * @returns {{valid: boolean, data: Object|null, errors: Array}}
   */
  validateTag(tagData, context = {}) {
    try {
      // First validate the tag structure
      const validated = tagSchema.parse(tagData);

      // Additional business rules
      const errors = [];

      // Check for duplicate tag names
      if (context.existingTags) {
        const nameErrors = validateTagName(
          validated.name,
          context.existingTags,
          validated.id
        );
        if (nameErrors.length > 0) {
          errors.push(...nameErrors.map((msg) => ({ field: 'name', message: msg })));
        }
      }

      // Validate qualification rules
      if (validated.qualificationRules && context.availableObjects) {
        const ruleErrors = validateQualificationRules(
          validated.qualificationRules,
          context.availableObjects
        );
        if (ruleErrors.length > 0) {
          errors.push(
            ...ruleErrors.map((msg) => ({ field: 'qualificationRules', message: msg }))
          );
        }
      }

      // Validate tag dependencies
      if (validated.dependencies && context.existingTags) {
        const depErrors = validateTagDependencies(
          validated.id,
          validated.dependencies,
          context.existingTags
        );
        if (depErrors.length > 0) {
          errors.push(
            ...depErrors.map((msg) => ({ field: 'dependencies', message: msg }))
          );
        }
      }

      if (errors.length > 0) {
        return {
          valid: false,
          data: null,
          errors,
        };
      }

      return {
        valid: true,
        data: validated,
        errors: [],
      };
    } catch (error) {
      if (error.name === 'ZodError') {
        return {
          valid: false,
          data: null,
          errors: this._formatZodErrors(error),
        };
      }
      throw error;
    }
  }

  /**
   * Validate a tag library
   * @param {Object} libraryData - Tag library data to validate
   * @returns {{valid: boolean, data: Object|null, errors: Array}}
   */
  validateTagLibrary(libraryData) {
    try {
      const validated = tagLibrarySchema.parse(libraryData);
      return {
        valid: true,
        data: validated,
        errors: [],
      };
    } catch (error) {
      if (error.name === 'ZodError') {
        return {
          valid: false,
          data: null,
          errors: this._formatZodErrors(error),
        };
      }
      throw error;
    }
  }

  /**
   * Validate all tags in a project
   * @param {Array} tags - Tags to validate
   * @param {Array} availableObjects - Available custom objects for validation
   * @returns {{valid: boolean, data: Array|null, errors: Array}}
   */
  validateAllTags(tags, availableObjects = []) {
    const errors = [];
    const validatedTags = [];

    tags.forEach((tag, index) => {
      const result = this.validateTag(tag, {
        existingTags: tags,
        availableObjects,
      });

      if (!result.valid) {
        errors.push({
          path: `tags[${index}]`,
          tagName: tag.name || 'Unknown',
          errors: result.errors,
        });
      } else {
        validatedTags.push(result.data);
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        data: null,
        errors,
      };
    }

    return {
      valid: true,
      data: validatedTags,
      errors: [],
    };
  }

  /**
   * Analyze tag qualification rule complexity
   * @param {Object} qualificationRules - Rules to analyze
   * @returns {Object} Complexity analysis
   */
  analyzeTagComplexity(qualificationRules) {
    return analyzeRuleComplexity(qualificationRules);
  }

  /**
   * Check if tag name is unique within a project
   * @param {string} tagName - Tag name to check
   * @param {string} tagId - Current tag ID (for updates)
   * @param {Array} existingTags - Existing tags
   * @returns {boolean}
   */
  isTagNameUnique(tagName, tagId, existingTags = []) {
    const normalizedName = tagName.toLowerCase();
    return !existingTags.some(
      (tag) => tag.id !== tagId && tag.name.toLowerCase() === normalizedName
    );
  }

  /**
   * Validate tag color format
   * @param {string} color - Hex color code to validate
   * @returns {{valid: boolean, errors: Array}}
   */
  validateColor(color) {
    const errors = validateTagColor(color);
    return {
      valid: errors.length === 0,
      errors: errors.map((msg) => ({ field: 'color', message: msg })),
    };
  }
}

// Create and export a singleton instance
const validationService = new ValidationService();

export { validationService, ValidationService };
export default validationService;
