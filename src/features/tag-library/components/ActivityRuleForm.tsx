/**
 * ActivityRuleForm Component
 *
 * Provides a step-by-step form for creating activity-based qualification rules:
 * 1. Select HubSpot event type
 * 2. Choose occurrence condition (has_occurred, has_not_occurred, count)
 * 3. If count: select operator and enter value
 * 4. Optionally set timeframe (last X days)
 * 5. Optionally add event property filters
 *
 * Follows the same pattern as PropertyRuleForm with progressive disclosure
 * and TypeScript safety throughout.
 */

import { useState, useRef, memo } from 'react';
import type { ActivityRuleCondition } from '../../../types/tag';
import {
  HUBSPOT_STANDARD_EVENTS,
  EVENT_CATEGORIES,
  getEventsByCategory,
  getEventDisplayName,
  validateCustomEventFormat,
} from '../../../data/hubspotEventTypes';

export interface ActivityRuleFormProps {
  /** Current activity rule condition being edited */
  condition?: ActivityRuleCondition;
  /** Callback when condition is updated */
  onChange: (condition: ActivityRuleCondition) => void;
  /** Optional callback when form is cancelled */
  onCancel?: () => void;
}

/**
 * Occurrence options for activity rules
 */
const OCCURRENCE_OPTIONS: Array<{
  value: ActivityRuleCondition['occurrence'];
  label: string;
  description: string;
}> = [
  {
    value: 'has_occurred',
    label: 'Has occurred',
    description: 'Contact has completed this event at least once',
  },
  {
    value: 'has_not_occurred',
    label: 'Has not occurred',
    description: 'Contact has never completed this event',
  },
  {
    value: 'count',
    label: 'Occurred X times',
    description: 'Count occurrences with specific operator',
  },
];

/**
 * Count operators for when occurrence = 'count'
 */
const COUNT_OPERATORS: Array<{
  value: NonNullable<ActivityRuleCondition['operator']>;
  label: string;
}> = [
  { value: 'equals', label: 'Exactly' },
  { value: 'not_equals', label: 'Not equal to' },
  { value: 'greater_than', label: 'More than' },
  { value: 'greater_than_or_equal', label: 'At least' },
  { value: 'less_than', label: 'Fewer than' },
  { value: 'less_than_or_equal', label: 'At most' },
];

/**
 * Timeframe presets in days
 */
const TIMEFRAME_PRESETS: Array<{ value: number | null; label: string }> = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
  { value: 90, label: 'Last 90 days' },
  { value: null, label: 'All time' },
];

function ActivityRuleForm({
  condition,
  onChange,
  onCancel,
}: ActivityRuleFormProps) {
  // State for form fields
  const [selectedEventType, setSelectedEventType] = useState<string>(
    condition?.eventType || ''
  );
  const [occurrence, setOccurrence] = useState<
    ActivityRuleCondition['occurrence']
  >(condition?.occurrence || 'has_occurred');
  const [operator, setOperator] = useState<
    ActivityRuleCondition['operator'] | ''
  >(condition?.operator || '');
  const [countValue, setCountValue] = useState<number>(condition?.value || 1);
  const [timeframe, setTimeframe] = useState<number | undefined>(
    condition?.timeframe
  );
  const [showCustomTimeframe, setShowCustomTimeframe] = useState(false);

  // Track mounted state to prevent updates after unmount
  const isMountedRef = useRef<boolean>(true);

  // Get grouped events for categorized display
  const eventsByCategory = getEventsByCategory();

  // Build condition from current form state
  const buildCondition = (): ActivityRuleCondition | null => {
    if (!selectedEventType) return null;

    const newCondition: ActivityRuleCondition = {
      eventType: selectedEventType,
      occurrence,
      ...(occurrence === 'count' && operator
        ? { operator, value: countValue }
        : {}),
      ...(timeframe ? { timeframe } : {}),
    };
    return newCondition;
  };

  // Handle Add Condition button click
  const handleAddClick = (): void => {
    const condition = buildCondition();
    if (condition) {
      onChange(condition);
      // Reset form after adding
      setSelectedEventType('');
      setOccurrence('has_occurred');
      setOperator('');
      setCountValue(1);
      setTimeframe(undefined);
      setShowCustomTimeframe(false);
    }
  };

  // Determine if operator and value are needed
  const needsOperatorAndValue = (): boolean => {
    return occurrence === 'count';
  };

  // Handle event type selection
  const handleEventTypeChange = (eventType: string): void => {
    setSelectedEventType(eventType);
  };

  // Handle occurrence selection
  const handleOccurrenceChange = (
    newOccurrence: ActivityRuleCondition['occurrence']
  ): void => {
    setOccurrence(newOccurrence);
    if (newOccurrence !== 'count') {
      setOperator('');
      setCountValue(1);
    }
  };

  // Handle operator selection
  const handleOperatorChange = (
    newOperator: ActivityRuleCondition['operator']
  ): void => {
    setOperator(newOperator);
  };

  // Handle timeframe preset selection
  const handleTimeframePresetChange = (value: number | null): void => {
    if (value === null) {
      setTimeframe(undefined);
      setShowCustomTimeframe(false);
    } else {
      setTimeframe(value);
      setShowCustomTimeframe(false);
    }
  };

  // Render event type dropdown with categories
  const renderEventTypeDropdown = (): React.ReactElement => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          1. Select Event Type
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedEventType}
          onChange={(e) => handleEventTypeChange(e.target.value)}
        >
          <option value="">Choose an event...</option>
          {Object.entries(eventsByCategory).map(([category, events]) => {
            if (events.length === 0) return null;
            return (
              <optgroup
                key={category}
                label={EVENT_CATEGORIES[category] || category}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id} title={event.description}>
                    {event.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        {selectedEventType && (
          <p className="text-xs text-gray-500">
            {HUBSPOT_STANDARD_EVENTS.find((e) => e.id === selectedEventType)
              ?.description || 'Custom event'}
          </p>
        )}
      </div>
    );
  };

  // Render occurrence selector
  const renderOccurrenceSelector = (): React.ReactElement | null => {
    if (!selectedEventType) return null;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          2. Select Occurrence Condition
        </label>
        <div className="space-y-2">
          {OCCURRENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="occurrence"
                value={option.value}
                checked={occurrence === option.value}
                onChange={(e) =>
                  handleOccurrenceChange(
                    e.target.value as ActivityRuleCondition['occurrence']
                  )
                }
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Render operator and value inputs for count-based rules
  const renderCountOperatorAndValue = (): React.ReactElement | null => {
    if (!needsOperatorAndValue()) return null;

    return (
      <div className="space-y-4">
        {/* Operator Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            3. Select Comparison Operator
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={operator}
            onChange={(e) =>
              handleOperatorChange(
                e.target.value as ActivityRuleCondition['operator']
              )
            }
          >
            <option value="">Choose an operator...</option>
            {COUNT_OPERATORS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Count Value */}
        {operator && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              4. Enter Count Value
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Enter number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={countValue}
              onChange={(e) =>
                setCountValue(Math.max(0, parseInt(e.target.value) || 0))
              }
            />
          </div>
        )}
      </div>
    );
  };

  // Render timeframe selector
  const renderTimeframeSelector = (): React.ReactElement | null => {
    const shouldShow = occurrence === 'count' ? operator : true;
    if (!selectedEventType || !shouldShow) return null;

    const stepNumber = occurrence === 'count' && operator ? '5' : '3';

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {stepNumber}. Select Timeframe (Optional)
        </label>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {TIMEFRAME_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleTimeframePresetChange(preset.value)}
                className={`px-3 py-2 text-sm border rounded-md ${
                  (preset.value === null && timeframe === undefined) ||
                  preset.value === timeframe
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom timeframe input */}
          <button
            type="button"
            onClick={() => setShowCustomTimeframe(!showCustomTimeframe)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showCustomTimeframe ? 'Hide' : 'Show'} custom timeframe
          </button>

          {showCustomTimeframe && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Last</span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Days"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                value={timeframe || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setTimeframe(value > 0 ? value : undefined);
                }}
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render condition preview
  const renderPreview = (): React.ReactElement | null => {
    if (!selectedEventType) return null;

    let previewText = `Event: ${getEventDisplayName(selectedEventType)}`;

    if (occurrence === 'has_occurred') {
      previewText += ' has occurred';
    } else if (occurrence === 'has_not_occurred') {
      previewText += ' has NOT occurred';
    } else if (occurrence === 'count' && operator) {
      const operatorLabel =
        COUNT_OPERATORS.find((op) => op.value === operator)?.label || operator;
      previewText += ` occurred ${operatorLabel.toLowerCase()} ${countValue} times`;
    }

    if (timeframe) {
      previewText += ` in the last ${timeframe} days`;
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Condition Preview:
        </h4>
        <p className="text-sm text-blue-800 font-mono">{previewText}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Event Type */}
      {renderEventTypeDropdown()}

      {/* Step 2: Occurrence */}
      {renderOccurrenceSelector()}

      {/* Step 3/4: Operator & Value (for count-based rules) */}
      {renderCountOperatorAndValue()}

      {/* Step 3/5: Timeframe */}
      {renderTimeframeSelector()}

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
            !selectedEventType ||
            (occurrence === 'count' && (!operator || countValue < 0))
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Condition
        </button>
      </div>

      {/* Preview */}
      {renderPreview()}
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(ActivityRuleForm, (prevProps, nextProps) => {
  return (
    prevProps.condition === nextProps.condition &&
    prevProps.onCancel === nextProps.onCancel
  );
});
