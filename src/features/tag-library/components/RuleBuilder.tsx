/**
 * RuleBuilder Component
 *
 * Provides a tabbed interface for building different types of qualification rules:
 * - Property Rules: Conditions based on custom object field values
 * - Activity Rules: Conditions based on HubSpot events
 * - Association Rules: Conditions based on related objects
 * - Score Rules: Conditions based on score thresholds with hysteresis
 *
 * Follows compounding engineering principles with TypeScript safety and reusable patterns.
 */

import { useState, useCallback, memo, useMemo } from 'react';
import DOMPurify from 'dompurify';
import type {
  QualificationRules,
  RuleCondition,
  PropertyRuleCondition,
  ActivityRuleCondition,
} from '../../../types/tag';
import type { DataModel } from '../../../types/project';
import PropertyRuleForm from './PropertyRuleForm';
import ActivityRuleForm from './ActivityRuleForm';
import { generateId } from '../../../utils/idGenerator';
import { getEventDisplayName } from '../../../data/hubspotEventTypes';

/**
 * Type guard for PropertyRuleCondition
 * Validates all required fields exist and have correct types
 */
function isPropertyRuleCondition(condition: RuleCondition): condition is PropertyRuleCondition {
  return (
    'object' in condition &&
    typeof condition.object === 'string' &&
    'field' in condition &&
    typeof condition.field === 'string' &&
    'operator' in condition &&
    typeof condition.operator === 'string'
  );
}

/**
 * Type guard for ActivityRuleCondition
 * Validates all required fields exist and have correct types
 */
function isActivityRuleCondition(condition: RuleCondition): condition is ActivityRuleCondition {
  return (
    'eventType' in condition &&
    typeof condition.eventType === 'string' &&
    'occurrence' in condition &&
    typeof condition.occurrence === 'string'
  );
}

export interface RuleBuilderProps {
  /** Current qualification rules being edited */
  rules: QualificationRules;
  /** Callback when rules are updated */
  onChange: (rules: QualificationRules) => void;
  /** Data model containing available objects and fields */
  dataModel: DataModel;
  /** Optional validation errors to display */
  errors?: string[];
}

type RuleType = 'property' | 'activity' | 'association' | 'score';

/**
 * Main RuleBuilder component with tabbed interface
 * Memoized to prevent unnecessary re-renders
 */
function RuleBuilder({ rules, onChange, dataModel, errors }: RuleBuilderProps) {
  const [activeTab, setActiveTab] = useState<RuleType>(rules.ruleType);

  // Handle tab change with confirmation if conditions exist
  const handleTabChange = useCallback((newTab: RuleType): void => {
    // If switching away from current tab and there are conditions
    if (newTab !== activeTab && rules.conditions.length > 0) {
      const confirmed = window.confirm(
        `Switching rule types will clear your ${rules.conditions.length} existing condition(s). Continue?`
      );

      if (!confirmed) {
        return; // User cancelled, don't switch tabs
      }
    }

    setActiveTab(newTab);
    onChange({
      ...rules,
      ruleType: newTab,
      conditions: [],
    });
  }, [activeTab, rules, onChange]);

  // Handle logic change (AND/OR)
  const handleLogicChange = useCallback((logic: 'AND' | 'OR'): void => {
    onChange({
      ...rules,
      logic,
    });
  }, [rules, onChange]);

  // Handle adding a new condition with unique ID
  // Accepts any RuleCondition type (Property, Activity, Association, Score)
  const handleAddCondition = useCallback((condition: RuleCondition): void => {
    // Check for duplicate conditions to prevent rapid double-clicks
    // Compare essential fields (excluding id) to detect duplicates
    const isDuplicate = rules.conditions.some(existing => {
      // Create comparison objects without id fields
      const existingWithoutId = { ...existing };
      delete existingWithoutId.id;
      const newWithoutId = { ...condition };
      delete newWithoutId.id;

      // Deep comparison using JSON.stringify
      return JSON.stringify(existingWithoutId) === JSON.stringify(newWithoutId);
    });

    if (isDuplicate) {
      console.warn('[RuleBuilder] Duplicate condition ignored (rapid click detected)');
      return; // Prevent duplicate submission
    }

    const conditionWithId = {
      ...condition,
      id: condition.id || generateId(), // Ensure every condition has a unique ID
    };
    const newConditions = [...rules.conditions, conditionWithId];
    onChange({
      ...rules,
      conditions: newConditions,
    });
  }, [rules, onChange]);

  // Handle deleting a condition by ID
  const handleDeleteCondition = useCallback((conditionId: string): void => {
    const newConditions = rules.conditions.filter((c) => {
      // Support both ID-based and index-based filtering for backward compatibility
      if ('id' in c && c.id) {
        return c.id !== conditionId;
      }
      return true;
    });
    onChange({
      ...rules,
      conditions: newConditions,
    });
  }, [rules, onChange]);

  // Memoize condition summaries to avoid expensive DOMPurify operations on every render
  const conditionSummaries = useMemo(() => {
    return rules.conditions.map((condition, index) => {
      // Use proper type guard instead of unsafe assertion
      if (isPropertyRuleCondition(condition)) {
        // Sanitize all string values to prevent XSS
        const safeObject = DOMPurify.sanitize(condition.object, { ALLOWED_TAGS: [] });
        const safeField = DOMPurify.sanitize(condition.field, { ALLOWED_TAGS: [] });
        const safeOperator = DOMPurify.sanitize(condition.operator, { ALLOWED_TAGS: [] });

        let summary = `${safeObject}.${safeField} ${safeOperator}`;

        if (condition.value !== undefined) {
          const valueStr = Array.isArray(condition.value)
            ? condition.value.map(v => DOMPurify.sanitize(String(v), { ALLOWED_TAGS: [] })).join(', ')
            : DOMPurify.sanitize(String(condition.value), { ALLOWED_TAGS: [] });
          summary += ` ${valueStr}`;
        }
        return summary;
      }

      if (isActivityRuleCondition(condition)) {
        // Sanitize event type
        const safeEventType = DOMPurify.sanitize(condition.eventType, { ALLOWED_TAGS: [] });
        const eventName = getEventDisplayName(safeEventType);

        let summary = `Event: ${eventName}`;

        // Add occurrence info
        if (condition.occurrence === 'has_occurred') {
          summary += ' has occurred';
        } else if (condition.occurrence === 'has_not_occurred') {
          summary += ' has NOT occurred';
        } else if (condition.occurrence === 'count' && condition.operator && condition.value !== undefined) {
          const safeOperator = DOMPurify.sanitize(condition.operator, { ALLOWED_TAGS: [] });
          summary += ` occurred ${safeOperator} ${condition.value} times`;
        }

        // Add timeframe if present
        if (condition.timeframe) {
          summary += ` in last ${condition.timeframe} days`;
        }

        return summary;
      }

      // Placeholder for other condition types
      return `Condition ${index + 1}`;
    });
  }, [rules.conditions]); // Only recompute when conditions array changes

  // Memoized tab button component
  const TabButton = memo(({ type, label }: { type: RuleType; label: string }) => (
    <button
      type="button"
      onClick={() => handleTabChange(type)}
      className={`
        px-4 py-2 font-medium text-sm rounded-t-lg transition-colors
        ${activeTab === type
          ? 'bg-white text-blue-600 border-b-2 border-blue-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
      `}
    >
      {label}
    </button>
  ));

  TabButton.displayName = 'TabButton';

  return (
    <div className="space-y-4">
      {/* Header with Rule Type Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          <TabButton type="property" label="Property Rules" />
          <TabButton type="activity" label="Activity Rules" />
          <TabButton type="association" label="Association Rules" />
          <TabButton type="score" label="Score Rules" />
        </div>
      </div>

      {/* Logic Selector (AND/OR) */}
      <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
        <label className="text-sm font-medium text-gray-700">
          Condition Logic:
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleLogicChange('AND')}
            className={`
              px-3 py-1 text-sm font-medium rounded transition-colors
              ${rules.logic === 'AND'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            AND (All must match)
          </button>
          <button
            type="button"
            onClick={() => handleLogicChange('OR')}
            className={`
              px-3 py-1 text-sm font-medium rounded transition-colors
              ${rules.logic === 'OR'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            OR (Any can match)
          </button>
        </div>
        <div className="flex-1 text-sm text-gray-500">
          {rules.logic === 'AND'
            ? 'All conditions must be true to qualify'
            : 'At least one condition must be true to qualify'
          }
        </div>
      </div>

      {/* Existing Conditions List */}
      {rules.conditions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Current Conditions:</h3>
          {rules.conditions.map((condition, index) => {
            // Get condition ID, generate one if missing (backward compatibility)
            const conditionId = ('id' in condition && condition.id) ? condition.id : `temp-${index}`;

            return (
              <div
                key={conditionId}
                className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-mono text-gray-800">
                    {conditionSummaries[index]}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteCondition(conditionId)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rule Form Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          {rules.conditions.length === 0 ? 'Add' : 'Add Another'} Condition
        </h3>

        {activeTab === 'property' && (
          <PropertyRuleForm
            objects={dataModel.objects || []}
            onChange={handleAddCondition}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityRuleForm
            onChange={handleAddCondition}
          />
        )}

        {activeTab === 'association' && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium mb-2">Association Rule Builder</p>
            <p className="text-sm">Create rules based on relationships between objects</p>
            <p className="text-xs text-gray-400 mt-4">Coming in Phase 6</p>
          </div>
        )}

        {activeTab === 'score' && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium mb-2">Score Rule Builder</p>
            <p className="text-sm">Set score thresholds with optional hysteresis for tag assignment</p>
            <p className="text-xs text-gray-400 mt-4">Coming in Phase 6</p>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {errors && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Validation Errors:
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conditions Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm">
          <span className="font-medium text-gray-700">Conditions: </span>
          <span className="text-gray-600">
            {rules.conditions.length === 0
              ? 'No conditions defined yet'
              : `${rules.conditions.length} condition${rules.conditions.length > 1 ? 's' : ''} defined`
            }
          </span>
        </div>
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(RuleBuilder, (prevProps, nextProps) => {
  return (
    prevProps.rules === nextProps.rules &&
    prevProps.dataModel === nextProps.dataModel &&
    JSON.stringify(prevProps.errors) === JSON.stringify(nextProps.errors)
  );
});
