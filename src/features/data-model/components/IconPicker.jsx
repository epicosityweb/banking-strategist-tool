import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Search, X } from 'lucide-react';

// Common icons for data model objects
const COMMON_ICONS = [
  'Database', 'Users', 'User', 'Wallet', 'Home', 'FileText', 'CreditCard',
  'Building2', 'Landmark', 'DollarSign', 'TrendingUp', 'Shield', 'Key',
  'Lock', 'Mail', 'Phone', 'MapPin', 'Calendar', 'Clock', 'Tag',
  'Briefcase', 'Package', 'ShoppingCart', 'Receipt', 'FileCheck',
  'ClipboardList', 'FolderOpen', 'Archive', 'Layers', 'Grid',
];

function IconPicker({ selectedIcon, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filteredIcons = search.trim()
    ? COMMON_ICONS.filter(icon => icon.toLowerCase().includes(search.toLowerCase()))
    : COMMON_ICONS;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Choose an Icon</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
            {filteredIcons.map((iconName) => {
              const Icon = Icons[iconName];
              const isSelected = selectedIcon === iconName;

              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onSelect(iconName);
                    onClose();
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'hover:bg-slate-100 border-2 border-transparent'
                  }`}
                  title={iconName}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-slate-600'}`} />
                  <span className="text-xs text-slate-600 truncate w-full text-center">
                    {iconName}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No icons found matching "{search}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default IconPicker;
