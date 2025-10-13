import React from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';

function FieldTable({ fields = [], onAddField, onEditField, onDeleteField }) {
  const getDataTypeLabel = (dataType) => {
    const typeMap = {
      text: 'Text',
      multiline_text: 'Multi-line Text',
      number: 'Number',
      currency: 'Currency',
      date: 'Date',
      datetime: 'Date/Time',
      boolean: 'Boolean',
      enumeration: 'Enumeration',
      email: 'Email',
      phone: 'Phone',
      url: 'URL',
    };
    return typeMap[dataType] || dataType;
  };

  const getFieldTypeLabel = (fieldType) => {
    const typeMap = {
      standard: 'Standard',
      calculated: 'Calculated',
      lookup: 'Lookup',
    };
    return typeMap[fieldType] || fieldType;
  };

  const getFieldTypeBadgeColor = (fieldType) => {
    const colorMap = {
      standard: 'bg-slate-100 text-slate-700',
      calculated: 'bg-purple-100 text-purple-700',
      lookup: 'bg-blue-100 text-blue-700',
    };
    return colorMap[fieldType] || 'bg-slate-100 text-slate-700';
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <p className="text-slate-600 mb-4">No fields defined yet</p>
        <button
          onClick={onAddField}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add First Field
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {fields.length} field{fields.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onAddField}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Label
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Data Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Field Type
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Required
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Unique
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Indexed
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {fields.map((field) => (
              <tr key={field.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <code className="text-sm font-mono text-slate-900">{field.name}</code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-900">{field.label}</span>
                  {field.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1" title={field.description}>
                      {field.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-700">{getDataTypeLabel(field.dataType)}</span>
                  {field.dataType === 'enumeration' && field.options && (
                    <span className="ml-1 text-xs text-slate-500">
                      ({field.options.length} options)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getFieldTypeBadgeColor(field.fieldType)}`}>
                    {getFieldTypeLabel(field.fieldType)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {field.required ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700">
                      ✓
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {field.unique ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700">
                      ✓
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {field.indexed ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700">
                      ✓
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditField(field)}
                      className="p-1.5 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      title="Edit field"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteField(field)}
                      className="p-1.5 text-slate-600 hover:text-error-600 hover:bg-error-50 rounded transition-colors"
                      title="Delete field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FieldTable;
