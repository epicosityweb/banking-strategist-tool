/**
 * PropertyRuleForm Component
 *
 * Provides a step-by-step form for creating property-based qualification rules:
 * 1. Select custom object
 * 2. Select field from object
 * 3. Choose operator (filtered by field type)
 * 4. Enter value (input type adapts to operator)
 *
 * Follows the compounding engineering principle with reusable components
 * and TypeScript safety throughout.
 */

import { useState, memo } from 'react';
import toast from 'react-hot-toast';
import type { PropertyRuleCondition } from '../../../types/tag';
import type { CustomObject } from '../../../types/project';
import { getUserFriendlyError, logError } from '../../../utils/errorMessages';

export interface PropertyRuleFormProps {
  /** Current property rule condition being edited */
  condition?: PropertyRuleCondition;
  /** Callback when condition is updated */
  onChange: (condition: PropertyRuleCondition) => void;
  /** Available custom objects from data model */
  objects: CustomObject[];
  /** Optional callback when form is cancelled */
  onCancel?: () => void;
}

/**
 * Maps field data types to applicable operators
 */
const OPERATORS_BY_TYPE: Record<string, PropertyRuleCondition['operator'][]> = {
  text: [
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'is_known',
    'is_unknown',
  ],
  number: [
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
    'between',
    'is_known',
    'is_unknown',
  ],
  boolean: ['equals', 'not_equals', 'is_known', 'is_unknown'],
  date: [
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
    'between',
    'is_known',
    'is_unknown',
  ],
  enum: ['equals', 'not_equals', 'in', 'not_in', 'is_known', 'is_unknown'],
};

/**
 * Operator labels for display
 */
const OPERATOR_LABELS: Record<PropertyRuleCondition['operator'], string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  greater_than: 'is greater than',
  greater_than_or_equal: 'is greater than or equal to',
  less_than: 'is less than',
  less_than_or_equal: 'is less than or equal to',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  in: 'is in list',
  not_in: 'is not in list',
  between: 'is between',
  is_known: 'is known (has value)',
  is_unknown: 'is unknown (no value)',
};

function PropertyRuleForm({
  condition,
  onChange,
  objects,
  onCancel,
}: PropertyRuleFormProps) {
  const [selectedObject, setSelectedObject] = useState<string>(condition?.object || '');
  const [selectedField, setSelectedField] = useState<string>(condition?.field || '');
  const [selectedOperator, setSelectedOperator] = useState<PropertyRuleCondition['operator'] | ''>(
    condition?.operator || ''
  );
  const [value, setValue] = useState<unknown>(condition?.value ?? '');

  // Find selected object details
  const currentObject = objects.find(obj => obj.name === selectedObject);
  const currentField = currentObject?.fields.find(field => field.name === selectedField);

  // Get available operators for selected field type
  const availableOperators = currentField
    ? OPERATORS_BY_TYPE[currentField.type] || OPERATORS_BY_TYPE.text
    : [];

  // Build condition from current form state
  const buildCondition = (): PropertyRuleCondition | null => {
    if (!selectedObject || !selectedField || !selectedOperator) return null;

    const newCondition: PropertyRuleCondition = {
      object: selectedObject,
      field: selectedField,
      operator: selectedOperator,
      value: needsValue(selectedOperator) ? value : undefined,
    };
    return newCondition;
  };

  // Handle Add Condition button click
  const handleAddClick = (): void => {
    const condition = buildCondition();
    if (condition) {
      try {
        onChange(condition);
        // Reset form only on successful add
        setSelectedObject('');
        setSelectedField('');
        setSelectedOperator('');
        setValue('');
      } catch (error) {
        // Preserve form state on error
        logError('PropertyRuleForm', 'add condition', error);

        // Show user-friendly error message (sanitized for security)
        const userMessage = getUserFriendlyError(error);
        toast.error(`Failed to add condition: ${userMessage}`, {
          duration: 5000,
        });
      }
    }
  };

  // Determine if operator needs a value input
  const needsValue = (operator: PropertyRuleCondition['operator']): boolean => {
    return operator !== 'is_known' && operator !== 'is_unknown';
  };

  // Validate value based on operator and field type
  const isValueValid = (
    operator: PropertyRuleCondition['operator'],
    value: unknown,
    fieldType: string
  ): boolean => {
    if (!needsValue(operator)) return true; // is_known/is_unknown don't need values

    // Check existence first
    if (value === '' || value === undefined || value === null) return false;

    // Operator-specific validation
    switch (operator) {
      case 'between':
        // Must be array with 2 valid numbers where min <= max
        if (!Array.isArray(value) || value.length !== 2) return false;
        const [min, max] = value as number[];
        if (!isFinite(min) || !isFinite(max)) return false;
        return min <= max; // Prevent inverted ranges

      case 'in':
      case 'not_in':
        // Must be non-empty array with valid elements
        if (!Array.isArray(value)) return false;
        return value.length > 0 && value.every(v => v !== '' && v !== null);

      default:
        // For standard operators, check type-specific validity
        if (fieldType === 'number') {
          return typeof value === 'number' && isFinite(value);
        }
        if (fieldType === 'text') {
          return typeof value === 'string' && value.trim().length > 0; // Prevent whitespace-only
        }
        return value !== '' && value !== null;
    }
  };

  // Handle object selection
  const handleObjectChange = (objectName: string): void => {
    setSelectedObject(objectName);
    setSelectedField(''); // Reset field when object changes
    setSelectedOperator('');
    setValue('');
  };

  // Handle field selection
  const handleFieldChange = (fieldName: string): void => {
    setSelectedField(fieldName);
    setSelectedOperator(''); // Reset operator when field changes
    setValue('');
  };

  // Handle operator selection
  const handleOperatorChange = (operator: PropertyRuleCondition['operator']): void => {
    setSelectedOperator(operator);
    if (!needsValue(operator)) {
      setValue(undefined);
    }
  };

  // Render value input based on field type and operator
  const renderValueInput = (): React.ReactElement | null => {
    if (!selectedOperator || !needsValue(selectedOperator)) {
      return null;
    }

    if (!currentField) {
      return null;
    }

    // Between operator needs two values
    if (selectedOperator === 'between') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Value Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              onChange={(e) => {
                const current = Array.isArray(value) ? value : [0, 0];
                const parsed = parseFloat(e.target.value);
                setValue([isFinite(parsed) ? parsed : 0, current[1] || 0]);
              }}
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              onChange={(e) => {
                const current = Array.isArray(value) ? value : [0, 0];
                const parsed = parseFloat(e.target.value);
                setValue([current[0] || 0, isFinite(parsed) ? parsed : 0]);
              }}
            />
          </div>
        </div>
      );
    }

    // List operators need array input
    if (selectedOperator === 'in' || selectedOperator === 'not_in') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Values (comma-separated)</label>
          <input
            type="text"
            placeholder="value1, value2, value3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={Array.isArray(value) ? value.join(', ') : ''}
            onChange={(e) => {
              const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
              setValue(values);
            }}
          />
        </div>
      );
    }

    // Standard value input based on field type
    switch (currentField.type) {
      case 'number':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Value</label>
            <input
              type="number"
              placeholder="Enter number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={typeof value === 'number' ? value : ''}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                setValue(isFinite(parsed) ? parsed : 0);
              }}
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Value</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={value === true ? 'true' : value === false ? 'false' : ''}
              onChange={(e) => setValue(e.target.value === 'true')}
            >
              <option value="">Select value...</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Value</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        );

      default: // text
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Value</label>
            <input
              type="text"
              placeholder="Enter value"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Select Object */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          1. Select Custom Object
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedObject}
          onChange={(e) => handleObjectChange(e.target.value)}
        >
          <option value="">Choose an object...</option>
          {objects.map((obj) => (
            <option key={obj.id} value={obj.name}>
              {obj.label || obj.name}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Select Field */}
      {selectedObject && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            2. Select Field
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedField}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            <option value="">Choose a field...</option>
            {currentObject?.fields.map((field) => (
              <option key={field.id} value={field.name}>
                {field.label || field.name} ({field.type})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Select Operator */}
      {selectedField && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            3. Select Operator
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedOperator}
            onChange={(e) => handleOperatorChange(e.target.value as PropertyRuleCondition['operator'])}
          >
            <option value="">Choose an operator...</option>
            {(availableOperators || []).map((op) => (
              <option key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 4: Enter Value */}
      {selectedOperator && renderValueInput()}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleAddClick}
          disabled={
            !selectedObject ||
            !selectedField ||
            !selectedOperator ||
            !isValueValid(selectedOperator, value, currentField?.type || 'text')
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Condition
        </button>
      </div>

      {/* Preview */}
      {selectedObject && selectedField && selectedOperator && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Condition Preview:</h4>
          <p className="text-sm text-blue-800 font-mono">
            {selectedObject}.{selectedField} {OPERATOR_LABELS[selectedOperator]}
            {needsValue(selectedOperator) && value !== undefined && (
              <span> {Array.isArray(value) ? value.join(', ') : String(value)}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(PropertyRuleForm, (prevProps, nextProps) => {
  return (
    prevProps.condition === nextProps.condition &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.objects === nextProps.objects &&
    prevProps.onCancel === nextProps.onCancel
  );
});
