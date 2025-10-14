import { useState } from 'react';
import { Check, Plus, Eye } from 'lucide-react';
import { Tag } from '../../../types/tag';

/**
 * TagCard Component
 *
 * Displays a single tag with preview functionality.
 * Shows tag metadata, qualification rules summary, and add/added state.
 */

interface TagCardProps {
  tag: Tag;
  isAdded: boolean;
  onAdd: (tag: Tag) => void;
}

export default function TagCard({ tag, isAdded, onAdd }: TagCardProps) {
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const categoryColors = {
    origin: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      badge: 'bg-blue-100',
    },
    behavior: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      badge: 'bg-green-100',
    },
    opportunity: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      badge: 'bg-purple-100',
    },
  };

  const colors = categoryColors[tag.category] || categoryColors.origin;

  const handleAddClick = () => {
    if (!isAdded) {
      onAdd(tag);
    }
  };

  return (
    <div
      className={`relative bg-white border-2 ${colors.border} rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
    >
      {/* Header with Category Badge */}
      <div className={`${colors.bg} px-4 py-3 border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge} ${colors.text}`}
          >
            {tag.category.charAt(0).toUpperCase() + tag.category.slice(1)}
          </span>
          <div className="flex items-center gap-2">
            {isAdded && (
              <span className="inline-flex items-center text-xs text-green-600 font-medium">
                <Check className="h-4 w-4 mr-1" />
                Added
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Tag Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tag.name}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tag.description}</p>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium mr-2">Behavior:</span>
            <span className="capitalize">
              {tag.behavior === 'set_once'
                ? 'Set Once, Permanent'
                : tag.behavior === 'dynamic'
                  ? 'Dynamic, Multiple Active'
                  : 'Evolving, Multiple Possible'}
            </span>
          </div>
          {tag.qualificationRules && (
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium mr-2">Rule Type:</span>
              <span className="capitalize">{tag.qualificationRules.ruleType}</span>
              <span className="mx-2">•</span>
              <span>
                {tag.qualificationRules.conditions.length}{' '}
                {tag.qualificationRules.conditions.length === 1
                  ? 'condition'
                  : 'conditions'}
              </span>
            </div>
          )}
        </div>

        {/* Preview Toggle */}
        {showPreview && tag.qualificationRules && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Qualification Rules
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Logic:</span> {tag.qualificationRules.logic}
              </div>
              <div>
                <span className="font-medium">Conditions:</span>
              </div>
              <ul className="list-disc list-inside pl-2 space-y-1">
                {tag.qualificationRules.conditions.slice(0, 3).map((condition, idx) => (
                  <li key={idx} className="text-gray-500">
                    {/* @ts-ignore - Union type narrowing issue with qualification rules */}
                    {condition.object && condition.field && (
                      <span>
                        {/* @ts-ignore */}
                        {condition.object}.{condition.field} {condition.operator}{' '}
                        {typeof condition.value === 'object'
                          ? JSON.stringify(condition.value)
                          : condition.value}
                      </span>
                    )}
                    {/* @ts-ignore */}
                    {condition.eventType && (
                      <span>
                        {/* @ts-ignore */}
                        {condition.eventType} {condition.occurrence}
                      </span>
                    )}
                    {/* @ts-ignore */}
                    {condition.scoreField && (
                      <span>
                        {/* @ts-ignore */}
                        {condition.scoreField} {condition.operator} {condition.threshold}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {tag.qualificationRules.conditions.length > 3 && (
                <p className="text-gray-400 italic">
                  +{tag.qualificationRules.conditions.length - 3} more conditions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={handleAddClick}
            disabled={isAdded}
            className={`flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isAdded
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Implementation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
