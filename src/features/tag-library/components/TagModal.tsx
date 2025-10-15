import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useProject } from '../../../context/ProjectContext-v2';
import { v4 as uuidv4 } from 'uuid';
import { Tag, TagCategory, TagBehavior, QualificationRules } from '../../../types/tag';
import RuleBuilder from './RuleBuilder';

/**
 * TagModal Component
 *
 * Modal for creating and editing custom tags.
 * Includes form validation and color picker.
 */

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: Tag | null;
  mode?: 'create' | 'edit';
}

interface TagFormData {
  name: string;
  category: TagCategory;
  description: string;
  icon: string;
  color: string;
  behavior: TagBehavior;
  isPermanent: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  icon?: string;
  submit?: string;
}

export default function TagModal({ isOpen, onClose, tag = null, mode = 'create' }: TagModalProps) {
  const { addTag, updateTag, state } = useProject();
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    category: 'behavior',
    description: '',
    icon: 'tag',
    color: '#15803D',
    behavior: 'dynamic',
    isPermanent: false,
  });
  const [qualificationRules, setQualificationRules] = useState<QualificationRules>({
    ruleType: 'property',
    logic: 'AND',
    conditions: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize form data when editing
  useEffect(() => {
    if (tag && mode === 'edit') {
      setFormData({
        name: tag.name,
        category: tag.category,
        description: tag.description,
        icon: tag.icon,
        color: tag.color,
        behavior: tag.behavior,
        isPermanent: tag.isPermanent,
      });
      setQualificationRules(tag.qualificationRules);
    }
  }, [tag, mode]);

  const categoryColors = {
    origin: '#1D4ED8',
    behavior: '#15803D',
    opportunity: '#7C3AED',
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCategoryChange = (category: TagCategory): void => {
    setFormData((prev) => ({
      ...prev,
      category,
      color: categoryColors[category],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tag name must be at least 2 characters';
    } else if (!/^[A-Za-z][A-Za-z0-9_\s]*$/.test(formData.name)) {
      newErrors.name = 'Tag name must start with a letter and contain only letters, numbers, underscores, and spaces';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.icon.trim()) {
      newErrors.icon = 'Icon is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tagData: Tag = {
        id: mode === 'edit' && tag ? tag.id : uuidv4(),
        ...formData,
        isCustom: true,
        qualificationRules,
        dependencies: mode === 'edit' && tag ? tag.dependencies : [],
        createdAt: mode === 'edit' && tag ? tag.createdAt : new Date(),
        updatedAt: new Date(),
      };

      const result = mode === 'edit'
        ? await updateTag(tagData)
        : await addTag(tagData);

      if (result.error) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to save tag';
        setErrors({ submit: errorMessage });
      } else {
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'edit' ? 'Edit Tag' : 'Create Custom Tag'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error saving tag
                    </h3>
                    <p className="mt-2 text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form id="tag-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Tag Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="e.g., High_Value_Customer"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Use underscores for spaces (e.g., Multi_Product_Holder)
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('origin')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.category === 'origin'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Origin
                    <p className="text-xs font-normal mt-1">WHERE they came from</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('behavior')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.category === 'behavior'
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Behavior
                    <p className="text-xs font-normal mt-1">HOW they engage</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('opportunity')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.category === 'opportunity'
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Opportunity
                    <p className="text-xs font-normal mt-1">WHAT they need next</p>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.description
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Describe when this tag should be applied..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Behavior Type */}
              <div>
                <label
                  htmlFor="behavior"
                  className="block text-sm font-medium text-gray-700"
                >
                  Behavior Type
                </label>
                <select
                  id="behavior"
                  name="behavior"
                  value={formData.behavior}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="set_once">Set Once, Permanent</option>
                  <option value="dynamic">Dynamic, Multiple Active</option>
                  <option value="evolving">Evolving, Multiple Possible</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.behavior === 'set_once' && 'Tag is assigned once and never changes'}
                  {formData.behavior === 'dynamic' && 'Tag can be added/removed based on conditions'}
                  {formData.behavior === 'evolving' && 'Tag evolves with member lifecycle'}
                </p>
              </div>

              {/* Icon */}
              <div>
                <label
                  htmlFor="icon"
                  className="block text-sm font-medium text-gray-700"
                >
                  Icon Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.icon
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="e.g., star, users, trending-up"
                />
                {errors.icon && (
                  <p className="mt-2 text-sm text-red-600">{errors.icon}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Lucide icon name (see lucide.dev)
                </p>
              </div>

              {/* Color Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="#15803D"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Hex color code (automatically set based on category)
                </p>
              </div>

              {/* Permanent Flag */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPermanent"
                  name="isPermanent"
                  checked={formData.isPermanent}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPermanent" className="ml-2 block text-sm text-gray-700">
                  Tag is permanent (cannot be removed once assigned)
                </label>
              </div>

              {/* Qualification Rules Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">
                  Qualification Rules
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Define when this tag should be automatically assigned to members based on their properties, activities, or scores.
                </p>
                <RuleBuilder
                  rules={qualificationRules}
                  onChange={setQualificationRules}
                  dataModel={state.dataModel}
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              form="tag-form"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Tag' : 'Create Tag'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
