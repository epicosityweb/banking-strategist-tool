import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../../../utils/idGenerator';
import FormField from '../../../components/ui/FormField';

function FieldModal({ isOpen, onClose, onSave, field = null, existingFields = [] }) {
  const isEditing = !!field;

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    dataType: 'text',
    fieldType: 'standard',
    required: false,
    unique: false,
    indexed: false,
    options: [],
  });

  const [errors, setErrors] = useState({});
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (field) {
      setFormData({
        name: field.name || '',
        label: field.label || '',
        description: field.description || '',
        dataType: field.dataType || 'text',
        fieldType: field.fieldType || 'standard',
        required: field.required || false,
        unique: field.unique || false,
        indexed: field.indexed || false,
        options: field.options || [],
      });
      setNameManuallyEdited(true);
    } else {
      setFormData({
        name: '',
        label: '',
        description: '',
        dataType: 'text',
        fieldType: 'standard',
        required: false,
        unique: false,
        indexed: false,
        options: [],
      });
      setNameManuallyEdited(false);
    }
    setErrors({});
  }, [field, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto-generate field name from label if not manually edited
    if (name === 'label' && !nameManuallyEdited) {
      const generatedName = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setFormData(prev => ({
        ...prev,
        name: generatedName,
      }));
    }

    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleNameChange = (e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
    setNameManuallyEdited(true);
    setErrors(prev => ({ ...prev, name: null }));
  };

  const handleDataTypeChange = (e) => {
    const newDataType = e.target.value;
    setFormData(prev => ({
      ...prev,
      dataType: newDataType,
      // Reset options if changing away from enumeration
      options: newDataType === 'enumeration' ? prev.options : [],
    }));
    setErrors(prev => ({ ...prev, dataType: null }));
  };

  // Enumeration options management
  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { label: '', value: '', isDefault: prev.options.length === 0 },
      ],
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => {
        if (i === index) {
          return { ...opt, [field]: value };
        }
        // If setting this as default, unset others
        if (field === 'isDefault' && value === true) {
          return { ...opt, isDefault: false };
        }
        return opt;
      }),
    }));
  };

  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Validate field name
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Field name must be at least 2 characters';
    } else if (!/^[a-z][a-z0-9_]*$/.test(formData.name)) {
      newErrors.name = 'Field name must be lowercase, start with a letter, and contain only letters, numbers, and underscores';
    } else {
      // Check for duplicates
      const normalizedName = formData.name.toLowerCase();
      const duplicate = existingFields.find(
        f => f.id !== field?.id && f.name.toLowerCase() === normalizedName
      );
      if (duplicate) {
        newErrors.name = 'A field with this name already exists in this object';
      }
    }

    // Validate label
    if (!formData.label || formData.label.trim().length === 0) {
      newErrors.label = 'Field label is required';
    }

    // Validate enumeration options
    if (formData.dataType === 'enumeration') {
      if (!formData.options || formData.options.length === 0) {
        newErrors.options = 'Enumeration fields must have at least one option';
      } else {
        const hasEmptyOptions = formData.options.some(opt => !opt.label || !opt.value);
        if (hasEmptyOptions) {
          newErrors.options = 'All options must have both a label and value';
        }
      }
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

    const fieldData = {
      id: field?.id || generateId(),
      name: normalizedName,
      label: formData.label,
      description: formData.description,
      dataType: formData.dataType,
      fieldType: formData.fieldType,
      required: formData.required,
      unique: formData.unique,
      indexed: formData.indexed,
      options: formData.dataType === 'enumeration' ? formData.options : undefined,
      createdAt: field?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(fieldData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Field' : 'Add Field'}
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
          <div className="grid grid-cols-2 gap-6">
            {/* Field Label */}
            <div className="col-span-2">
              <FormField
                label="Field Label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                error={errors.label}
                required
                placeholder="e.g., First Name"
                helpText="Human-readable name shown in the UI"
              />
            </div>

            {/* Field Name */}
            <div className="col-span-2">
              <FormField
                label="Field Name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                error={errors.name}
                required
                placeholder="e.g., first_name"
                helpText="Internal name (lowercase, underscores only, no spaces)"
              />
              {!nameManuallyEdited && formData.label && (
                <p className="mt-1 text-xs text-blue-600">
                  Auto-generated from field label. Edit to customize.
                </p>
              )}
            </div>

            {/* Data Type */}
            <div>
              <label htmlFor="dataType" className="block text-sm font-medium text-slate-700 mb-1">
                Data Type <span className="text-error-600">*</span>
              </label>
              <select
                id="dataType"
                name="dataType"
                value={formData.dataType}
                onChange={handleDataTypeChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="text">Text</option>
                <option value="multiline_text">Multi-line Text</option>
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="date">Date</option>
                <option value="datetime">Date/Time</option>
                <option value="boolean">Boolean</option>
                <option value="enumeration">Enumeration</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="url">URL</option>
              </select>
              {errors.dataType && (
                <p className="mt-1 text-sm text-error-600">{errors.dataType}</p>
              )}
            </div>

            {/* Field Type */}
            <div>
              <label htmlFor="fieldType" className="block text-sm font-medium text-slate-700 mb-1">
                Field Type <span className="text-error-600">*</span>
              </label>
              <select
                id="fieldType"
                name="fieldType"
                value={formData.fieldType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="standard">Standard</option>
                <option value="calculated">Calculated</option>
                <option value="lookup">Lookup</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the purpose and usage of this field..."
            helpText="Optional description for documentation"
            rows={2}
          />

          {/* Field Properties */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Field Properties</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="required"
                  checked={formData.required}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Required</span>
                <span className="text-xs text-slate-500">— Field must have a value</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="unique"
                  checked={formData.unique}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Unique</span>
                <span className="text-xs text-slate-500">— Value must be unique across all records</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="indexed"
                  checked={formData.indexed}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Indexed</span>
                <span className="text-xs text-slate-500">— Improves search and filter performance</span>
              </label>
            </div>
          </div>

          {/* Enumeration Options */}
          {formData.dataType === 'enumeration' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Options <span className="text-error-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>

              {formData.options.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <p className="text-sm text-slate-600">No options defined. Add at least one option.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Label (e.g., Active)"
                          value={option.label}
                          onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g., active)"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={option.isDefault}
                          onChange={(e) => handleOptionChange(index, 'isDefault', e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-xs text-slate-600">Default</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-slate-600 hover:text-error-600 hover:bg-error-50 rounded transition-colors"
                        title="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.options && (
                <p className="text-sm text-error-600">{errors.options}</p>
              )}
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
              {isEditing ? 'Save Changes' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FieldModal;
