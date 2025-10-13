/**
 * Dependency checking utilities for safe deletion operations
 */

/**
 * Check if an object has any dependencies that would prevent deletion
 * @param {string} objectId - The object ID to check
 * @param {Object} state - Current project state from ProjectContext
 * @returns {Object} - Dependency information
 */
export const checkObjectDependencies = (objectId, state) => {
  const dependencies = {
    hasFieldMappings: false,
    hasAssociations: false,
    hasTagRules: false,
    fieldMappingCount: 0,
    associationCount: 0,
    tagRuleCount: 0,
    details: [],
  };

  // Check field mappings
  if (state.dataModel?.mappings) {
    const mappings = state.dataModel.mappings.filter(
      mapping => mapping.targetObjectId === objectId
    );
    if (mappings.length > 0) {
      dependencies.hasFieldMappings = true;
      dependencies.fieldMappingCount = mappings.length;
      dependencies.details.push({
        type: 'field_mapping',
        count: mappings.length,
        message: `${mappings.length} field mapping${mappings.length > 1 ? 's' : ''}`,
        items: mappings.map(m => m.exportFileName),
      });
    }
  }

  // Check associations (both from and to this object)
  if (state.dataModel?.associations) {
    const associations = state.dataModel.associations.filter(
      assoc => assoc.fromObjectId === objectId || assoc.toObjectId === objectId
    );
    if (associations.length > 0) {
      dependencies.hasAssociations = true;
      dependencies.associationCount = associations.length;
      dependencies.details.push({
        type: 'association',
        count: associations.length,
        message: `${associations.length} association${associations.length > 1 ? 's' : ''} to other objects`,
        items: associations.map(a => a.label),
      });
    }
  }

  // Check tag rules (future-proofing)
  if (state.tags?.library) {
    const tagRules = state.tags.library.filter(tag => {
      // Check if tag rules reference this object
      if (tag.rules) {
        return tag.rules.some(rule => rule.objectId === objectId);
      }
      return false;
    });
    if (tagRules.length > 0) {
      dependencies.hasTagRules = true;
      dependencies.tagRuleCount = tagRules.length;
      dependencies.details.push({
        type: 'tag_rule',
        count: tagRules.length,
        message: `${tagRules.length} tag rule${tagRules.length > 1 ? 's' : ''}`,
        items: tagRules.map(t => t.name),
      });
    }
  }

  dependencies.canDelete = !dependencies.hasFieldMappings && !dependencies.hasAssociations && !dependencies.hasTagRules;
  dependencies.totalDependencies = dependencies.fieldMappingCount + dependencies.associationCount + dependencies.tagRuleCount;

  return dependencies;
};

/**
 * Check if a field has any dependencies that would prevent deletion
 * @param {string} fieldId - The field ID to check
 * @param {string} objectId - The parent object ID
 * @param {Object} state - Current project state from ProjectContext
 * @returns {Object} - Dependency information
 */
export const checkFieldDependencies = (fieldId, objectId, state) => {
  const dependencies = {
    hasFieldMappings: false,
    hasTagRules: false,
    hasCalculations: false,
    mappingCount: 0,
    tagRuleCount: 0,
    calculationCount: 0,
    details: [],
  };

  // Check if field is used in mappings
  if (state.dataModel?.mappings) {
    const mappings = state.dataModel.mappings.filter(
      mapping => mapping.targetObjectId === objectId &&
                 mapping.mappings?.some(m => m.targetFieldId === fieldId)
    );
    if (mappings.length > 0) {
      dependencies.hasFieldMappings = true;
      dependencies.mappingCount = mappings.length;
      dependencies.details.push({
        type: 'field_mapping',
        count: mappings.length,
        message: `Used in ${mappings.length} field mapping${mappings.length > 1 ? 's' : ''}`,
      });
    }
  }

  // Check if field is used in tag rules
  if (state.tags?.library) {
    const tagRules = state.tags.library.filter(tag => {
      if (tag.rules) {
        return tag.rules.some(rule =>
          rule.objectId === objectId && rule.fieldId === fieldId
        );
      }
      return false;
    });
    if (tagRules.length > 0) {
      dependencies.hasTagRules = true;
      dependencies.tagRuleCount = tagRules.length;
      dependencies.details.push({
        type: 'tag_rule',
        count: tagRules.length,
        message: `Used in ${tagRules.length} tag rule${tagRules.length > 1 ? 's' : ''}`,
      });
    }
  }

  // Check if field is used in calculated fields
  const object = state.dataModel?.objects.find(obj => obj.id === objectId);
  if (object?.fields) {
    const calculatedFields = object.fields.filter(f =>
      f.fieldType === 'calculated' &&
      f.calculation?.sourceFieldId === fieldId
    );
    if (calculatedFields.length > 0) {
      dependencies.hasCalculations = true;
      dependencies.calculationCount = calculatedFields.length;
      dependencies.details.push({
        type: 'calculated_field',
        count: calculatedFields.length,
        message: `Used in ${calculatedFields.length} calculated field${calculatedFields.length > 1 ? 's' : ''}`,
      });
    }
  }

  dependencies.canDelete = !dependencies.hasFieldMappings && !dependencies.hasTagRules && !dependencies.hasCalculations;
  dependencies.totalDependencies = dependencies.mappingCount + dependencies.tagRuleCount + dependencies.calculationCount;

  return dependencies;
};

/**
 * Get the count of fields in an object
 * @param {Object} object - The custom object
 * @returns {number} - Number of fields
 */
export const getFieldCount = (object) => {
  return object?.fields?.length || 0;
};

/**
 * Get the count of associations for an object
 * @param {string} objectId - The object ID
 * @param {Array} associations - All associations
 * @returns {number} - Number of associations
 */
export const getAssociationCount = (objectId, associations = []) => {
  return associations.filter(
    assoc => assoc.fromObjectId === objectId || assoc.toObjectId === objectId
  ).length;
};
