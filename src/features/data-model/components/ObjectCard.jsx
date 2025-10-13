import React from 'react';
import * as Icons from 'lucide-react';
import { Copy, Edit2, Trash2, ChevronRight } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { getFieldCount, getAssociationCount } from '../../../utils/dependencyChecker';

function ObjectCard({ object, associations = [], onEdit, onDuplicate, onDelete, onViewDetails }) {
  const Icon = Icons[object.icon] || Icons.Database;
  const fieldCount = getFieldCount(object);
  const associationCount = getAssociationCount(object.id, associations);

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <div className="flex flex-col h-full">
        {/* Header with Icon and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                {object.label}
              </h3>
              <p className="text-sm text-slate-500 font-mono text-xs truncate">
                {object.apiName}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(object)}
              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="Edit object"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(object)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Duplicate object"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(object)}
              className="p-2 text-slate-400 hover:text-error-600 hover:bg-error-50 rounded transition-colors"
              title="Delete object"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">
          {object.description || 'No description provided'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{fieldCount}</span> field{fieldCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary-400 rounded-full"></div>
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{associationCount}</span> association{associationCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Template Badge */}
        {object.isTemplate && (
          <div className="mt-3">
            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
              From Template
            </span>
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={() => onViewDetails(object)}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
        >
          Manage Fields
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

export default ObjectCard;
