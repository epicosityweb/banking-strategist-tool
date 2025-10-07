import React from 'react';
import Card from '../../components/ui/Card';
import { Tag } from 'lucide-react';

function TagDesigner() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Tag Library & Designer</h2>
        <p className="text-slate-600 mt-1">
          Browse pre-built tags or create custom tags with visual rule builder
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-600">
            Tag library with 30+ pre-built tags and visual rule builder for custom tags
          </p>
        </div>
      </Card>
    </div>
  );
}

export default TagDesigner;
