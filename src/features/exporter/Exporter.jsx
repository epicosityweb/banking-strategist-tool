import React from 'react';
import Card from '../../components/ui/Card';
import { FileText } from 'lucide-react';

function Exporter() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Implementation Exporter</h2>
        <p className="text-slate-600 mt-1">
          Generate complete documentation for your implementation team
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-600">
            Export as PDF, JSON, Excel, or Markdown with complete specifications
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Exporter;
