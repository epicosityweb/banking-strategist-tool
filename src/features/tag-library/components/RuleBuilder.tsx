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

import { useState } from 'react';
import type {
  QualificationRules,
  RuleCondition,
  PropertyRuleCondition,
} from '../../../types/tag';
import type { DataModel } from '../../../types/project';
import PropertyRuleForm from './PropertyRuleForm';

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
 */
export default function RuleBuilder({ rules, onChange, dataModel, errors }: RuleBuilderProps) {
  const [activeTab, setActiveTab] = useState<RuleType>(rules.ruleType);

  // Handle tab change
  const handleTabChange = (newTab: RuleType): void => {
    setActiveTab(newTab);

    // Update rule type and clear conditions when switching tabs
    onChange({
      ...rules,
      ruleType: newTab,
      conditions: [], // Clear conditions when switching rule types
    });
  };

  // Handle logic change (AND/OR)
  const handleLogicChange = (logic: 'AND' | 'OR'): void => {
    onChange({
      ...rules,
      logic,
    });
  };

  // Handle adding a new condition
  const handleAddCondition = (condition: PropertyRuleCondition): void => {
    const newConditions = [...rules.conditions, condition];
    onChange({
      ...rules,
      conditions: newConditions,
    });
  };

  // Handle deleting a condition
  const handleDeleteCondition = (index: number): void => {
    const newConditions = rules.conditions.filter((_, i) => i !== index);
    onChange({
      ...rules,
      conditions: newConditions,
    });
  };

  // Render a human-readable summary of a condition
  const renderConditionSummary = (condition: RuleCondition, index: number): string => {
    // Type guard for property conditions
    if ('object' in condition && 'field' in condition) {
      const propCondition = condition as PropertyRuleCondition;
      let summary = `${propCondition.object}.${propCondition.field} ${propCondition.operator}`;
      if (propCondition.value !== undefined) {
        summary += ` ${Array.isArray(propCondition.value)
          ? propCondition.value.join(', ')
          : String(propCondition.value)}`;
      }
      return summary;
    }

    // Placeholder for other condition types
    return `Condition ${index + 1}`;
  };

  // Tab button component
  const TabButton = ({ type, label }: { type: RuleType; label: string }) => (
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
  );

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
          {rules.conditions.map((condition, index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-sm font-mono text-gray-800">
                  {renderConditionSummary(condition, index)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDeleteCondition(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
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
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium mb-2">Activity Rule Builder</p>
            <p className="text-sm">Define conditions based on HubSpot events and user activities</p>
            <p className="text-xs text-gray-400 mt-4">Coming in Phase 5</p>
          </div>
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
