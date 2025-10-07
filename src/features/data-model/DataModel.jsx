import React from 'react';
import Card from '../../components/ui/Card';
import { Database } from 'lucide-react';

function DataModel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Data Model Designer</h2>
        <p className="text-slate-600 mt-1">
          Define custom objects, fields, mappings, and associations
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-600">
            Data model designer with custom objects, field mappings, and visual relationship diagrams
          </p>
        </div>
      </Card>
    </div>
  );
}

export default DataModel;
