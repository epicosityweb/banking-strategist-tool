import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  User,
  Database,
  Tag,
  Play,
  FileText,
  CheckCircle,
} from 'lucide-react';

const navigation = [
  {
    name: 'Client Profile',
    path: 'client-profile',
    icon: User,
    description: 'FI details & integration specs',
  },
  {
    name: 'Data Model',
    path: 'data-model',
    icon: Database,
    description: 'Objects, fields & mappings',
  },
  {
    name: 'Tag System',
    path: 'tags',
    icon: Tag,
    description: 'Tag library & rule designer',
  },
  {
    name: 'Journey Simulator',
    path: 'simulator',
    icon: Play,
    description: 'Test member scenarios',
  },
  {
    name: 'Export',
    path: 'export',
    icon: FileText,
    description: 'Generate documentation',
  },
];

function Sidebar() {
  const { projectId } = useParams();

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-slate-200 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const to = `/project/${projectId}/${item.path}`;

          return (
            <NavLink
              key={item.path}
              to={to}
              className={({ isActive }) =>
                `flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-1" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
