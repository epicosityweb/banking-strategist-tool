import React from 'react';
import * as Icons from 'lucide-react';
import Card from '../../../components/ui/Card';

function TemplateCard({ template, onUseTemplate }) {
  const Icon = Icons[template.icon] || Icons.Database;
  const fieldCount = template.fields?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
              {template.label}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                {fieldCount} field{fieldCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-slate-500 capitalize">{template.category}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">
          {template.description}
        </p>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Sample Fields Preview */}
        <div className="mb-4 pb-4 border-b border-slate-200">
          <p className="text-xs font-medium text-slate-700 mb-2">Sample Fields:</p>
          <div className="space-y-1">
            {template.fields.slice(0, 3).map((field, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0"></div>
                <span className="text-slate-600 truncate">
                  {field.label}
                  {field.required && <span className="text-error-500 ml-1">*</span>}
                </span>
                <span className="text-slate-400 text-xs ml-auto">
                  {field.dataType}
                </span>
              </div>
            ))}
            {fieldCount > 3 && (
              <div className="text-xs text-slate-500 italic pl-3.5">
                +{fieldCount - 3} more field{fieldCount - 3 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onUseTemplate(template)}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
        >
          Use This Template
        </button>
      </div>
    </Card>
  );
}

export default TemplateCard;
