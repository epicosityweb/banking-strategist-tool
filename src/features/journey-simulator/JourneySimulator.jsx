import React from 'react';
import Card from '../../components/ui/Card';
import { Play } from 'lucide-react';

function JourneySimulator() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Journey Simulator</h2>
        <p className="text-slate-600 mt-1">
          Create member scenarios and visualize their journey paths
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-600">
            Test member scenarios, see tag qualification, and visualize journey timelines
          </p>
        </div>
      </Card>
    </div>
  );
}

export default JourneySimulator;
