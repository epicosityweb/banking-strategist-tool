import React from 'react';

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  helpText,
  options = [], // for select/radio
  className = '',
}) {
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg bg-white
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    ${error ? 'border-error-500' : 'border-slate-300'}
  `;

  const selectClasses = `
    ${baseInputClasses}
    cursor-pointer appearance-auto
  `;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseInputClasses} min-h-[100px]`}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={selectClasses}
          >
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={value}
              onChange={onChange}
              className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
            />
            <label htmlFor={name} className="text-sm text-slate-700">
              {label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <input
                  id={`${name}-${opt.value}`}
                  name={name}
                  type="radio"
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={onChange}
                  className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                />
                <label htmlFor={`${name}-${opt.value}`} className="text-sm text-slate-700">
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={baseInputClasses}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={`${className}`}>
        {renderInput()}
        {helpText && <p className="text-xs text-slate-500 mt-1 ml-6">{helpText}</p>}
        {error && <p className="text-xs text-error-600 mt-1 ml-6">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {helpText && <p className="text-xs text-slate-500 mt-1">{helpText}</p>}
      {error && <p className="text-xs text-error-600 mt-1">{error}</p>}
    </div>
  );
}

export default FormField;
