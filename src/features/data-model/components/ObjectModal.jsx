import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useProject } from '../../../context/ProjectContext-v2';
import { generateId } from '../../../utils/idGenerator';
import { generateApiName, validateObjectName, validateApiName } from '../../../schemas/objectSchema';
import FormField from '../../../components/ui/FormField';
import IconPicker from './IconPicker';

function ObjectModal({ isOpen, onClose, object = null, template = null }) {
  const { state, dispatch } = useProject();
  const isEditing = !!object;
  const currentProjectId = state.currentProject || 'client';

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    apiName: '',
    icon: 'Database',
  });

  const [errors, setErrors] = useState({});
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [apiNameManuallyEdited, setApiNameManuallyEdited] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (object) {
      // Editing existing object
      setFormData({
        name: object.name,
        label: object.label,
        description: object.description || '',
        apiName: object.apiName,
        icon: object.icon || 'Database',
      });
      setApiNameManuallyEdited(true);
    } else if (template) {
      // Creating from template
      setFormData({
        name: template.name,
        label: template.label,
        description: template.description || '',
        apiName: generateApiName(template.name, currentProjectId),
        icon: template.icon || 'Database',
      });
    } else {
      // Creating from scratch
      setFormData({
        name: '',
        label: '',
        description: '',
        apiName: '',
        icon: 'Database',
      });
      setApiNameManuallyEdited(false);
    }
  }, [object, template, currentProjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate API name from object name if not manually edited
    if (name === 'name' && !apiNameManuallyEdited) {
      const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      setFormData(prev => ({
        ...prev,
        apiName: normalized ? generateApiName(normalized, currentProjectId) : '',
      }));
    }

    // Auto-generate label from name if label is empty
    if (name === 'name' && !formData.label) {
      const labelText = value.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      setFormData(prev => ({
        ...prev,
        label: labelText,
      }));
    }

    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleApiNameChange = (e) => {
    setFormData(prev => ({ ...prev, apiName: e.target.value }));
    setApiNameManuallyEdited(true);
    setErrors(prev => ({ ...prev, apiName: null }));
  };

  const validate = () => {
    const newErrors = {};

    // Validate object name
    const existingObjects = object
      ? state.dataModel?.objects?.filter(o => o.id !== object.id) || []
      : state.dataModel?.objects || [];

    const nameErrors = validateObjectName(formData.name, existingObjects);
    if (nameErrors.length > 0) {
      newErrors.name = nameErrors[0];
    }

    // Validate label
    if (!formData.label?.trim()) {
      newErrors.label = 'Display label is required';
    }

    // Validate API name
    const apiNameErrors = validateApiName(formData.apiName);
    if (apiNameErrors.length > 0) {
      newErrors.apiName = apiNameErrors[0];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const normalizedName = formData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    if (object) {
      // Update existing object
      dispatch({
        type: 'UPDATE_OBJECT',
        payload: {
          ...object,
          name: normalizedName,
          label: formData.label,
          description: formData.description,
          apiName: formData.apiName,
          icon: formData.icon,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new object
      const newObject = {
        id: generateId(),
        name: normalizedName,
        label: formData.label,
        description: formData.description,
        apiName: formData.apiName,
        icon: formData.icon,
        fields: template?.fields?.map(f => ({
          ...f,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })) || [],
        associations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: !!template,
        templateId: template?.id,
      };

      dispatch({
        type: 'ADD_OBJECT',
        payload: newObject,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  const Icon = Icons[formData.icon] || Icons.Database;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Custom Object' : 'Create Custom Object'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Object Icon
            </label>
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-lg hover:border-primary-500 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900">{formData.icon}</div>
                <div className="text-xs text-slate-500">Click to change icon</div>
              </div>
            </button>
          </div>

          {/* Object Name */}
          <FormField
            label="Object Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., member_object or account_object"
            helpText="Internal name (lowercase, underscores only, no spaces)"
          />

          {/* Display Label */}
          <FormField
            label="Display Label"
            name="label"
            value={formData.label}
            onChange={handleChange}
            error={errors.label}
            required
            placeholder="e.g., Member Object"
            helpText="Human-readable name shown in the UI"
          />

          {/* API Name */}
          <div>
            <FormField
              label="API Name"
              name="apiName"
              value={formData.apiName}
              onChange={handleApiNameChange}
              error={errors.apiName}
              required
              placeholder={`p_${currentProjectId}_object_name`}
              helpText="HubSpot API name (auto-generated, editable)"
            />
            {!apiNameManuallyEdited && formData.name && (
              <p className="mt-1 text-xs text-blue-600">
                Auto-generated from object name. Edit to customize.
              </p>
            )}
          </div>

          {/* Description */}
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the purpose and usage of this object..."
            helpText="Optional description for documentation"
            rows={3}
          />

          {/* Template Info */}
          {template && !isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Creating from template: {template.label}
                  </p>
                  <p className="text-xs text-blue-700">
                    This object will include {template.fields?.length || 0} pre-configured fields.
                    You can customize the object name and description, then add or modify fields later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-error-900 mb-1">
                    Please fix the following errors:
                  </p>
                  <ul className="text-xs text-error-700 list-disc list-inside">
                    {Object.values(errors).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {isEditing ? 'Save Changes' : 'Create Object'}
            </button>
          </div>
        </form>
      </div>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPicker
          selectedIcon={formData.icon}
          onSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}

export default ObjectModal;
