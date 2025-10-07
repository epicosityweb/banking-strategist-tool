import React, { useState } from 'react';
import { Building2, Settings } from 'lucide-react';
import BasicInformation from './BasicInformation';
import IntegrationSpecifications from './IntegrationSpecifications';

function ClientProfile() {
  const [activeSection, setActiveSection] = useState('basic');

  const sections = [
    { id: 'basic', name: 'Basic Information', icon: Building2 },
    { id: 'integration', name: 'Integration Specifications', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Client Profile</h2>
        <p className="text-slate-600 mt-1">
          Capture FI details, member demographics, and integration specifications
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{section.name}</span>
            </button>
          );
        })}
      </div>

      <div>
        {activeSection === 'basic' && <BasicInformation />}
        {activeSection === 'integration' && <IntegrationSpecifications />}
      </div>
    </div>
  );
}

export default ClientProfile;
